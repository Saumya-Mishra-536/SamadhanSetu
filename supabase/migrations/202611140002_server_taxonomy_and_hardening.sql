-- Server-side taxonomy, classification, audit metadata and least-privilege writes.
-- Apply after 202611140001_initial_security.sql.

create table if not exists public.service_taxonomy (
  id bigserial primary key,
  category_id text not null,
  subcategory_id text not null unique,
  category_en text not null,
  category_hi text not null,
  subcategory_en text not null,
  subcategory_hi text not null,
  keywords text[] not null default '{}',
  jurisdiction_hint text not null default 'Verify location and responsible department on an official source',
  active boolean not null default true
);
alter table public.service_taxonomy enable row level security;
drop policy if exists taxonomy_read_authenticated on public.service_taxonomy;
create policy taxonomy_read_authenticated on public.service_taxonomy for select to authenticated using (active);

insert into public.service_taxonomy
(category_id,subcategory_id,category_en,category_hi,subcategory_en,subcategory_hi,keywords,jurisdiction_hint)
values
('welfare','pension','Welfare and Government Schemes','कल्याण और सरकारी योजनाएँ','Pension','पेंशन',array['pension','old age pension','widow pension','वृद्धावस्था पेंशन','विधवा पेंशन'],'Confirm scheme and state/central jurisdiction on the official scheme source'),
('welfare','scholarship','Welfare and Government Schemes','कल्याण और सरकारी योजनाएँ','Scholarships','छात्रवृत्ति',array['scholarship','stipend','छात्रवृत्ति','वजीफा'],'Confirm scheme and education department jurisdiction'),
('welfare','public_distribution','Welfare and Government Schemes','कल्याण और सरकारी योजनाएँ','Public distribution and ration','जन वितरण और राशन',array['ration','pds','public distribution','राशन','जन वितरण'],'Confirm state food and civil supplies jurisdiction'),
('welfare','welfare_other','Welfare and Government Schemes','कल्याण और सरकारी योजनाएँ','Other welfare benefit','अन्य कल्याण लाभ',array['benefit','subsidy','scheme','लाभ','सब्सिडी','योजना'],'Confirm the relevant scheme department and jurisdiction'),
('sanitation','solid_waste','Public Sanitation and Waste Management','सार्वजनिक स्वच्छता और कचरा प्रबंधन','Solid waste and garbage','ठोस कचरा और सफ़ाई',array['garbage','waste','cleaning','कचरा','सफाई'],'Likely local body; verify municipal jurisdiction'),
('sanitation','drainage','Public Sanitation and Waste Management','सार्वजनिक स्वच्छता और कचरा प्रबंधन','Drainage and sewerage','नाली और सीवरेज',array['drain','sewage','drainage','नाली','सीवर'],'Likely local body; verify municipal jurisdiction'),
('infrastructure','roads','Public Infrastructure','सार्वजनिक बुनियादी ढाँचा','Roads and potholes','सड़क और गड्ढे',array['road','pothole','footpath','सड़क','गड्ढा','फुटपाथ'],'Verify whether local body, state PWD or another road owner is responsible'),
('infrastructure','street_lighting','Public Infrastructure','सार्वजनिक बुनियादी ढाँचा','Street lighting','स्ट्रीट लाइट',array['streetlight','street light','street lighting','स्ट्रीट लाइट'],'Verify local body and asset ownership'),
('utilities','water_supply','Water and Electricity','पानी और बिजली','Water supply','जलापूर्ति',array['water','pipeline','leak','पानी','जलापूर्ति','रिसाव'],'Verify local water utility and service area'),
('utilities','electricity','Water and Electricity','पानी और बिजली','Electricity supply','बिजली आपूर्ति',array['electricity','power cut',' बिजली','बिजली','कटौती'],'Verify the licensed distribution company and service area'),
('healthcare','public_health','Public Healthcare Services','सार्वजनिक स्वास्थ्य सेवाएँ','Public health facility','सरकारी स्वास्थ्य सुविधा',array['hospital','medicine','doctor','clinic','अस्पताल','दवा','डॉक्टर'],'Verify the responsible health facility and state health authority'),
('administration','certificates','Public Administration and Citizen Services','लोक प्रशासन और नागरिक सेवाएँ','Certificates and documents','प्रमाणपत्र और दस्तावेज़',array['certificate','birth certificate','caste certificate','प्रमाण पत्र','जन्म प्रमाणपत्र','जाति प्रमाणपत्र'],'Verify the issuing department and local jurisdiction'),
('administration','other_citizen_service','Public Administration and Citizen Services','लोक प्रशासन और नागरिक सेवाएँ','Other citizen service','अन्य नागरिक सेवा',array['application','office','आवेदन','कार्यालय'],'Verify the responsible department and application process'),
('needs_review','needs_review','Needs clarification','स्पष्टीकरण आवश्यक','More detail needed','अधिक जानकारी आवश्यक',array[]::text[],'Ask for clarification; do not infer an authority')
on conflict (subcategory_id) do update set
  category_id=excluded.category_id, category_en=excluded.category_en, category_hi=excluded.category_hi,
  subcategory_en=excluded.subcategory_en, subcategory_hi=excluded.subcategory_hi,
  keywords=excluded.keywords, jurisdiction_hint=excluded.jurisdiction_hint, active=true;

alter table public.grievances add column if not exists subcategory_id text;
alter table public.grievances add column if not exists jurisdiction_hint text not null default 'Verify location and responsible department on an official source';
alter table public.grievances add column if not exists submitted_at timestamptz;
alter table public.grievances add column if not exists retention_review_at timestamptz not null default (now() + interval '365 days');

update public.grievances set status='draft' where status not in ('draft','prepared','citizen_submitted','closed');
do $ begin
  if not exists (select 1 from pg_constraint where conname='grievances_status_check_v2') then
    alter table public.grievances add constraint grievances_status_check_v2
    check (status in ('draft','prepared','citizen_submitted','closed'));
  end if;
end $;

create or replace function public.classify_grievance_server()
returns trigger language plpgsql security definer set search_path=public as $$
declare
  item record;
  term text;
  score integer;
  best_score integer := 0;
  best record;
  is_hindi boolean := coalesce(new.language,'en') in ('hi','Hindi');
begin
  for item in select * from public.service_taxonomy where active order by id loop
    score := 0;
    foreach term in array item.keywords loop
      if position(lower(term) in lower(coalesce(new.description,''))) > 0 then score := score + 1; end if;
    end loop;
    if score > best_score then best_score := score; best := item; end if;
  end loop;

  if best_score = 0 then
    new.category_id := 'needs_review';
    new.subcategory_id := null;
    new.classification := jsonb_build_object(
      'category_id','needs_review',
      'category',case when is_hindi then 'स्पष्टीकरण आवश्यक' else 'Needs clarification' end,
      'subcategory',case when is_hindi then 'अधिक जानकारी आवश्यक' else 'More detail needed' end,
      'confidence','low',
      'explanation',case when is_hindi then 'कोई स्पष्ट श्रेणी नहीं मिली। कृपया श्रेणी की समीक्षा करें।' else 'No clear category matched. Please review the category.' end,
      'method','server-side deterministic taxonomy'
    );
    new.jurisdiction_hint := 'Verify location and responsible department on an official source';
  else
    new.category_id := best.category_id;
    new.subcategory_id := best.subcategory_id;
    new.jurisdiction_hint := best.jurisdiction_hint;
    new.classification := jsonb_build_object(
      'category_id',best.category_id,
      'category',case when is_hindi then best.category_hi else best.category_en end,
      'subcategory_id',best.subcategory_id,
      'subcategory',case when is_hindi then best.subcategory_hi else best.subcategory_en end,
      'confidence',case when best_score > 1 then 'moderate' else 'low' end,
      'explanation',case when is_hindi then 'सर्वर पर चलने वाले नियम-आधारित वर्गीकरण का सुझाव; यह आधिकारिक निर्णय नहीं है।' else 'Server-side rules-based suggestion; this is not an official determination.' end,
      'method','server-side deterministic taxonomy'
    );
  end if;
  new.guidance := jsonb_build_object(
    'next_steps',case when is_hindi then jsonb_build_array('संबंधित विभाग और वर्तमान प्रक्रिया की पुष्टि आधिकारिक वेबसाइट पर करें।','स्थान, तारीख और उपलब्ध पावती सुरक्षित रखें।') else jsonb_build_array('Verify the responsible department and current process on an official website.','Keep the location, date and any acknowledgement.') end,
    'documents',case when is_hindi then jsonb_build_array('संबंधित आवेदन या पावती, यदि हो','संवेदनशील विवरण हटाकर सहायक रिकॉर्ड') else jsonb_build_array('Relevant application or acknowledgement, if any','Supporting records with sensitive details redacted') end
  );
  return new;
end;
$$;

drop trigger if exists grievance_server_classification on public.grievances;
create trigger grievance_server_classification before insert or update of description, language
on public.grievances for each row execute function public.classify_grievance_server();

-- Clients can only insert the citizen-supplied fields. Classification and routing hints are server-owned.
revoke insert on public.grievances from authenticated;
grant insert (user_id,description,location,language,consent,complaint_draft) on public.grievances to authenticated;
revoke update on public.grievances from authenticated;
grant update (complaint_draft,guidance,updated_at) on public.grievances to authenticated;

create or replace function public.set_grievance_category(p_grievance_id uuid,p_category_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  row_data public.grievances;
  tax public.service_taxonomy;
  hindi boolean;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into row_data from public.grievances where id=p_grievance_id and user_id=auth.uid() for update;
  if not found then raise exception 'Grievance not found'; end if;
  select * into tax from public.service_taxonomy where category_id=p_category_id and active order by id limit 1;
  if not found then raise exception 'Invalid category'; end if;
  hindi := row_data.language in ('hi','Hindi');
  update public.grievances set
    category_id=tax.category_id,
    subcategory_id='citizen-selected',
    jurisdiction_hint=tax.jurisdiction_hint,
    classification=jsonb_build_object(
      'category_id',tax.category_id,
      'category',case when hindi then tax.category_hi else tax.category_en end,
      'subcategory_id','citizen-selected',
      'subcategory',case when hindi then 'नागरिक द्वारा चुना गया' else 'Citizen selected' end,
      'confidence','citizen-selected',
      'explanation',case when hindi then 'यह श्रेणी नागरिक द्वारा चुनी गई है; यह आधिकारिक निर्धारण नहीं है।' else 'Category selected by the citizen; not an official determination.' end,
      'method','citizen correction'
    ),
    updated_at=now()
  where id=p_grievance_id;
  return jsonb_build_object('ok',true);
end;
$$;
revoke all on function public.set_grievance_category(uuid,text) from public;
grant execute on function public.set_grievance_category(uuid,text) to authenticated;

create table if not exists public.authority_directory (
  id bigserial primary key,
  name text not null,
  jurisdiction text not null,
  category_ids text[] not null default '{}',
  official_url text not null,
  source_url text not null,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','expired')),
  last_checked_at timestamptz,
  notes text not null default 'Navigation only; confirm jurisdiction on the official source',
  created_at timestamptz not null default now()
);
alter table public.authority_directory enable row level security;
drop policy if exists authority_directory_read_authenticated on public.authority_directory;
create policy authority_directory_read_authenticated on public.authority_directory for select to authenticated using (true);
create unique index if not exists authority_directory_official_url_uidx on public.authority_directory(official_url);
insert into public.authority_directory(name,jurisdiction,category_ids,official_url,source_url,verification_status,notes)
values
('Bihar Lok Shikayat','Bihar state government',array['welfare','sanitation','infrastructure','utilities','healthcare','administration'],'https://lokshikayat.bihar.gov.in/DefaultEn.aspx','https://lokshikayat.bihar.gov.in/AboutUsEn.aspx','unverified','Listed as an official starting point; user must confirm issue coverage and jurisdiction.'),
('Bihar UPYOG Citizen Services','Bihar urban local bodies',array['sanitation','infrastructure','utilities'],'https://upyog.bihar.gov.in/c/citizen-services','https://upyog.bihar.gov.in/c/citizen-services','unverified','Select the relevant urban local body and verify current service coverage.'),
('CPGRAMS','Government of India',array['welfare','sanitation','infrastructure','utilities','healthcare','administration'],'https://pgportal.gov.in/V7/Home','https://pgportal.gov.in/V7/Home','unverified','Check exclusions and jurisdiction before filing.')
on conflict (official_url) do nothing;

create table if not exists public.grievance_audit_log (
  id bigserial primary key,
  grievance_id uuid,
  user_id uuid,
  action text not null,
  occurred_at timestamptz not null default now()
);
alter table public.grievance_audit_log enable row level security;
drop policy if exists grievance_audit_read_own on public.grievance_audit_log;
create policy grievance_audit_read_own on public.grievance_audit_log for select to authenticated using (auth.uid()=user_id);
revoke insert,update,delete on public.grievance_audit_log from anon,authenticated;

create or replace function public.log_grievance_change()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='DELETE' then
    insert into public.grievance_audit_log(grievance_id,user_id,action) values(old.id,old.user_id,'deleted');
    return old;
  elsif tg_op='INSERT' then
    insert into public.grievance_audit_log(grievance_id,user_id,action) values(new.id,new.user_id,'created');
    return new;
  else
    insert into public.grievance_audit_log(grievance_id,user_id,action) values(new.id,new.user_id,'updated');
    return new;
  end if;
end;
$$;
drop trigger if exists grievance_audit on public.grievances;
create trigger grievance_audit after insert or update or delete on public.grievances
for each row execute function public.log_grievance_change();

-- Private evidence metadata and storage. Upload UI is a later increment; no public bucket.
create table if not exists public.grievance_evidence (
  id uuid primary key default gen_random_uuid(),
  grievance_id uuid not null references public.grievances(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  object_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes between 1 and 10485760),
  created_at timestamptz not null default now()
);
alter table public.grievance_evidence enable row level security;
drop policy if exists evidence_select_own on public.grievance_evidence;
create policy evidence_select_own on public.grievance_evidence for select to authenticated using (auth.uid()=user_id);
drop policy if exists evidence_insert_own on public.grievance_evidence;
create policy evidence_insert_own on public.grievance_evidence for insert to authenticated with check (auth.uid()=user_id and exists(select 1 from public.grievances g where g.id=grievance_id and g.user_id=auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('grievance-evidence','grievance-evidence',false,10485760,array['application/pdf','image/jpeg','image/png'])
on conflict(id) do nothing;
drop policy if exists evidence_storage_read_own on storage.objects;
create policy evidence_storage_read_own on storage.objects for select to authenticated using(bucket_id='grievance-evidence' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists evidence_storage_insert_own on storage.objects;
create policy evidence_storage_insert_own on storage.objects for insert to authenticated with check(bucket_id='grievance-evidence' and (storage.foldername(name))[1]=auth.uid()::text);
