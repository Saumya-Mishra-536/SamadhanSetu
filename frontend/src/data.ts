import { supabase } from './supabase'

export type Followup = { id: string; note: string; status: string; reference_number?: string | null }
export type Grievance = {
  id: string; description: string; location: string;
  classification: { category_id: string; category: string; confidence: string; explanation: string };
  guidance: { next_steps: string[]; documents: string[] };
  complaint_draft: string; status: string; created_at: string; followups: Followup[];
}
const categories: Record<string,{name:string;terms:string[]}> = {
  welfare:{name:'Welfare and Government Schemes',terms:['pension','scholarship','ration','benefit','subsidy','scheme','पेंशन','छात्रवृत्ति','राशन','योजना']},
  sanitation:{name:'Public Sanitation and Waste Management',terms:['garbage','waste','drain','sewage','cleaning','कचरा','नाली','सफाई']},
  infrastructure:{name:'Public Infrastructure',terms:['road','pothole','streetlight','footpath','सड़क','गड्ढा']},
  utilities:{name:'Water and Electricity',terms:['water','electricity','power cut','pipeline','पानी','बिजली']},
  healthcare:{name:'Public Healthcare Services',terms:['hospital','medicine','doctor','clinic','अस्पताल','दवा','डॉक्टर']},
  administration:{name:'Public Administration and Citizen Services',terms:['certificate','application','office','प्रमाण पत्र','आवेदन','कार्यालय']},
}
function classify(text:string) {
  const ranked=Object.entries(categories).map(([id,c])=>({id,...c,count:c.terms.filter(term=>text.toLocaleLowerCase().includes(term.toLocaleLowerCase())).length})).sort((a,b)=>b.count-a.count)
  const top=ranked[0]
  if(!top||!top.count)return {category_id:'needs_review',category:'Needs clarification',confidence:'low',explanation:'No clear category matched. Please review and select the closest category.'}
  return {category_id:top.id,category:top.name,confidence:top.count>1?'high':'moderate',explanation:'Preliminary transparent keyword suggestion. This is not an official classification.'}
}
function guidance(id:string) {
  const common=['Verify the responsible office and current procedure on its official website.','Keep acknowledgement numbers and copies of your own submissions.']
  const specific:Record<string,string[]>={welfare:['Check the current scheme/application status using its official portal.','Review the scheme’s published eligibility and document requirements.'],sanitation:['Record the location and date the issue was observed.','Find the municipal or local-body complaint channel for your area.'],infrastructure:['Record the precise location and safety impact.','Check the relevant local-body or public-works website.'],utilities:['Identify the service provider and record relevant dates.','Use the provider’s official customer grievance channel.'],healthcare:['Avoid sharing unnecessary medical details.','For urgent medical needs, seek immediate local medical assistance.'],administration:['Record the application date and acknowledgement number.','Ask the responsible office whether any documents are missing.']}
  return {next_steps:[...(specific[id]||['Add more detail and verify the correct official channel.']),...common],documents:['Relevant application or acknowledgement, if any','Exact location and date','Supporting records with sensitive details redacted']}
}
function makeDraft(description:string,location:string,classification:{category:string},created:string) {
  return 'Subject: Request for assistance regarding '+classification.category.toLowerCase()+'\n\nTo the concerned grievance redressal officer,\n\nI wish to bring the following public-service issue to your attention:\n\nDescription: '+description+'\nLocation: '+location+'\nDate recorded: '+created.slice(0,10)+'\n\nI request that the concerned office review the matter and inform me of any action taken or additional information required.\n\nI will verify the recipient and submit this draft through the appropriate official channel.'
}
function requireClient(){if(!supabase)throw new Error('Supabase is not configured. Add the public project URL and anon key.');return supabase}
function unwrap<T>(result:{data:T|null;error:{message:string}|null}):T {if(result.error)throw new Error(result.error.message);if(result.data===null)throw new Error('No data returned');return result.data}
export async function createGrievance(description:string,location:string,language:string) {
  const db=requireClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('Sign in to save a grievance.')
  const classification=classify(description),created=new Date().toISOString(),guide=guidance(classification.category_id)
  const row=unwrap(await db.from('grievances').insert({user_id:user.id,description,location,language,category_id:classification.category_id,classification,guidance:guide,complaint_draft:makeDraft(description,location,classification,created),status:'Draft - not submitted to government'}).select('*, followups(*)').single())
  return row as Grievance
}
export async function listGrievances():Promise<Grievance[]> {const db=requireClient();const result=await db.from('grievances').select('*, followups(*)').order('created_at',{ascending:false});return (unwrap(result) as Grievance[])}
export async function getGrievance(id:string):Promise<Grievance> {const db=requireClient();return unwrap(await db.from('grievances').select('*, followups(*)').eq('id',id).single()) as Grievance}
export async function saveComplaint(id:string,draft:string){const db=requireClient();unwrap(await db.from('grievances').update({complaint_draft:draft,updated_at:new Date().toISOString()}).eq('id',id).select('id').single());}
export async function setCategory(id:string,categoryId:string){const db=requireClient();const name=categories[categoryId]?.name??'Needs clarification';const classification={category_id:categoryId,category:name,confidence:'citizen-selected',explanation:'Category selected by the citizen; not an official determination.'};const guide=guidance(categoryId);unwrap(await db.from('grievances').update({category_id:categoryId,classification,guidance:guide}).eq('id',id).select('id').single());return {classification,guidance:guide,complaint_draft:''}}
export async function addFollowup(id:string,note:string,reference:string){const db=requireClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('Sign in required.');return unwrap(await db.from('followups').insert({grievance_id:id,user_id:user.id,note,reference_number:reference||null,status:'Citizen-recorded update'}).select('*').single()) as Followup}
export async function deleteGrievance(id:string){const db=requireClient();unwrap(await db.from('grievances').delete().eq('id',id).select('id').single())}
export async function getOverview(){const items=await listGrievances();const category_counts:Record<string,number>={};items.forEach(x=>{const key=x.classification?.category||'Needs clarification';category_counts[key]=(category_counts[key]||0)+1});return {total_grievances:items.length,category_counts,note:'Counts are private records belonging to your signed-in account, not government statistics.'}}
export const officialResources=[
{id:'bihar-lok-shikayat',name:'Bihar Lok Shikayat',scope:'Bihar state government',description:'Official Bihar public grievance redressal portal. Verify jurisdiction and process on the portal.',url:'https://lokshikayat.bihar.gov.in/DefaultEn.aspx',phone:'1800 345 6284',categories:['welfare','sanitation','infrastructure','utilities','healthcare','administration'],source_url:'https://lokshikayat.bihar.gov.in/AboutUsEn.aspx',verified_on:'2026-11-14'},
{id:'bihar-upyog-civic',name:'Bihar UPYOG Citizen Services',scope:'Bihar urban local bodies',description:'Official citizen-services page for urban local-body services. Select your district and urban local body.',url:'https://upyog.bihar.gov.in/c/citizen-services',phone:null,categories:['sanitation','infrastructure','utilities'],source_url:'https://upyog.bihar.gov.in/c/citizen-services',verified_on:'2026-11-14'},
{id:'central-cpgrams',name:'CPGRAMS',scope:'Government of India',description:'Central public grievance portal. Check its exclusions and jurisdiction before filing.',url:'https://pgportal.gov.in/V7/Home',phone:null,categories:['welfare','sanitation','infrastructure','utilities','healthcare','administration'],source_url:'https://pgportal.gov.in/V7/Home',verified_on:'2026-11-14'},
]
