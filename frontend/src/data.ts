import { supabase } from './supabase'

export type Followup = { id: string; note: string; status: string; reference_number?: string | null }
export type Grievance = {
  id: string; description: string; location: string;
  classification: { category_id: string; category: string; confidence: string; explanation: string };
  guidance: { next_steps: string[]; documents: string[] };
  complaint_draft: string; status: string; created_at: string; followups: Followup[];
}
const categories: Record<string,{name:string;nameHi:string;terms:string[]}> = {
  welfare:{name:'Welfare and Government Schemes',nameHi:'कल्याण और सरकारी योजनाएँ',terms:['pension','scholarship','ration','benefit','subsidy','scheme','पेंशन','छात्रवृत्ति','राशन','योजना']},
  sanitation:{name:'Public Sanitation and Waste Management',nameHi:'सार्वजनिक स्वच्छता और कचरा प्रबंधन',terms:['garbage','waste','drain','sewage','cleaning','कचरा','नाली','सफाई']},
  infrastructure:{name:'Public Infrastructure',nameHi:'सार्वजनिक बुनियादी ढाँचा',terms:['road','pothole','streetlight','footpath','सड़क','गड्ढा']},
  utilities:{name:'Water and Electricity',nameHi:'पानी और बिजली',terms:['water','electricity','power cut','pipeline','पानी','बिजली']},
  healthcare:{name:'Public Healthcare Services',nameHi:'सार्वजनिक स्वास्थ्य सेवाएँ',terms:['hospital','medicine','doctor','clinic','अस्पताल','दवा','डॉक्टर']},
  administration:{name:'Public Administration and Citizen Services',nameHi:'लोक प्रशासन और नागरिक सेवाएँ',terms:['certificate','application','office','प्रमाण पत्र','आवेदन','कार्यालय']},
}
function classify(text:string,language:string) {
  const ranked=Object.entries(categories).map(([id,c])=>({id,...c,count:c.terms.filter(term=>text.toLocaleLowerCase().includes(term.toLocaleLowerCase())).length})).sort((a,b)=>b.count-a.count)
  const top=ranked[0]
  if(!top||!top.count)return {category_id:'needs_review',category:'Needs clarification',confidence:'low',explanation:'No clear category matched. Please review and select the closest category.'}
  return {category_id:top.id,category:language==='Hindi'?top.nameHi:top.name,confidence:top.count>1?'high':'moderate',explanation:'Preliminary transparent keyword suggestion. This is not an official classification.'}
}
function guidance(id:string,language:string) {
  const common=['Verify the responsible office and current procedure on its official website.','Keep acknowledgement numbers and copies of your own submissions.']
  const specific:Record<string,string[]>={welfare:['Check the current scheme/application status using its official portal.','Review the scheme’s published eligibility and document requirements.'],sanitation:['Record the location and date the issue was observed.','Find the municipal or local-body complaint channel for your area.'],infrastructure:['Record the precise location and safety impact.','Check the relevant local-body or public-works website.'],utilities:['Identify the service provider and record relevant dates.','Use the provider’s official customer grievance channel.'],healthcare:['Avoid sharing unnecessary medical details.','For urgent medical needs, seek immediate local medical assistance.'],administration:['Record the application date and acknowledgement number.','Ask the responsible office whether any documents are missing.']}
  if(language==='Hindi'){const hindi:Record<string,string[]>={welfare:['आधिकारिक पोर्टल पर योजना या आवेदन की वर्तमान स्थिति जाँचें।','योजना की प्रकाशित पात्रता और दस्तावेज़ आवश्यकताएँ पढ़ें।'],sanitation:['समस्या का स्थान और पहली बार देखे जाने की तारीख लिखें।','अपने क्षेत्र के नगर निकाय का आधिकारिक शिकायत चैनल खोजें।'],infrastructure:['सटीक स्थान और सुरक्षा पर प्रभाव दर्ज करें।','संबंधित स्थानीय निकाय या लोक निर्माण विभाग की वेबसाइट देखें।'],utilities:['सेवा प्रदाता और संबंधित तारीखों की जानकारी रखें।','प्रदाता के आधिकारिक शिकायत चैनल का उपयोग करें।'],healthcare:['अनावश्यक चिकित्सा जानकारी साझा न करें।','तत्काल चिकित्सा आवश्यकता में तुरंत स्थानीय चिकित्सा सहायता लें।'],administration:['आवेदन की तारीख और पावती संख्या लिखें।','संबंधित कार्यालय से पूछें कि कोई दस्तावेज़ लंबित तो नहीं है।']};return {next_steps:[...(hindi[id]||['अधिक जानकारी जोड़ें और आधिकारिक चैनल की पुष्टि करें।']),'संबंधित कार्यालय और वर्तमान प्रक्रिया की पुष्टि उसकी आधिकारिक वेबसाइट पर करें।','पावती संख्या और अपने आवेदन की प्रतियाँ सुरक्षित रखें।'],documents:['संबंधित आवेदन या पावती, यदि हो','सटीक स्थान और तारीख','संवेदनशील विवरण हटाकर सहायक रिकॉर्ड']}}\n  return {next_steps:[...(specific[id]||['Add more detail and verify the correct official channel.']),...common],documents:['Relevant application or acknowledgement, if any','Exact location and date','Supporting records with sensitive details redacted']}
}
function makeDraft(description:string,location:string,classification:{category:string},created:string) {
  return 'Subject: Request for assistance regarding '+classification.category.toLowerCase()+'\n\nTo the concerned grievance redressal officer,\n\nI wish to bring the following public-service issue to your attention:\n\nDescription: '+description+'\nLocation: '+location+'\nDate recorded: '+created.slice(0,10)+'\n\nI request that the concerned office review the matter and inform me of any action taken or additional information required.\n\nI will verify the recipient and submit this draft through the appropriate official channel.'
}
function requireClient(){if(!supabase)throw new Error('Supabase is not configured. Add the public project URL and anon key.');return supabase}
function unwrap<T>(result:{data:T|null;error:{message:string}|null}):T {if(result.error)throw new Error(result.error.message);if(result.data===null)throw new Error('No data returned');return result.data}
export async function createGrievance(description:string,location:string,language:string,consent:boolean) {
  if(!consent) throw new Error('Please acknowledge the data-storage notice before saving this record.')
  const db=requireClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('Sign in to save a grievance.')
  const classification=classify(description,language),created=new Date().toISOString(),guide=guidance(classification.category_id,language)
  const result=await db.from('grievances').insert({user_id:user.id,description,location,language,consent,category_id:classification.category_id,classification,guidance:guide,complaint_draft:makeDraft(description,location,classification,created,language),status:'Draft - not submitted to government'}).select('*, followups(*)').single()
  if(result.error) throw new Error(result.error.message)
  if(!result.data) throw new Error('Unable to save grievance.')
  return result.data as unknown as Grievance
}
export async function listGrievances():Promise<Grievance[]> {const db=requireClient();const result=await db.from('grievances').select('*, followups(*)').order('created_at',{ascending:false});return (unwrap(result) as Grievance[])}
export async function getGrievance(id:string):Promise<Grievance> {const db=requireClient();const result=await db.from('grievances').select('*, followups(*)').eq('id',id).single();if(result.error)throw new Error(result.error.message);if(!result.data)throw new Error('Grievance not found.');return result.data as unknown as Grievance}
export async function saveComplaint(id:string,draft:string){const db=requireClient();unwrap(await db.from('grievances').update({complaint_draft:draft,updated_at:new Date().toISOString()}).eq('id',id).select('id').single());}
export async function setCategory(id:string,categoryId:string){const db=requireClient();const existing=unwrap(await db.from('grievances').select('language,description,location,created_at').eq('id',id).single()) as {language:string;description:string;location:string;created_at:string};const hindi=existing.language==='Hindi';const name=categories[categoryId]?(hindi?categories[categoryId].nameHi:categories[categoryId].name):(hindi?'स्पष्टीकरण आवश्यक':'Needs clarification');const classification={category_id:categoryId,category:name,confidence:'citizen-selected',explanation:hindi?'यह श्रेणी नागरिक द्वारा चुनी गई है; यह आधिकारिक निर्धारण नहीं है।':'Category selected by the citizen; not an official determination.'};const guide=guidance(categoryId,existing.language);const draft=makeDraft(existing.description,existing.location,classification,existing.created_at,existing.language);unwrap(await db.from('grievances').update({category_id:categoryId,classification,guidance:guide,complaint_draft:draft}).eq('id',id).select('id').single());return {classification,guidance:guide,complaint_draft:draft}}
export async function addFollowup(id:string,note:string,reference:string){const db=requireClient();const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('Sign in required.');return unwrap(await db.from('followups').insert({grievance_id:id,user_id:user.id,note,reference_number:reference||null,status:'Citizen-recorded update'}).select('*').single()) as Followup}
export async function deleteGrievance(id:string){const db=requireClient();unwrap(await db.from('grievances').delete().eq('id',id).select('id').single())}
export async function getOverview(){const items=await listGrievances();const category_counts:Record<string,number>={};items.forEach(x=>{const key=x.classification?.category||'Needs clarification';category_counts[key]=(category_counts[key]||0)+1});return {total_grievances:items.length,category_counts,note:'Counts are private records belonging to your signed-in account, not government statistics.'}}
export const officialResources=[
{id:'bihar-lok-shikayat',name:'Bihar Lok Shikayat',scope:'Bihar state government',description:'Official Bihar public grievance redressal portal. Verify jurisdiction and process on the portal.',url:'https://lokshikayat.bihar.gov.in/DefaultEn.aspx',phone:'1800 345 6284',categories:['welfare','sanitation','infrastructure','utilities','healthcare','administration'],source_url:'https://lokshikayat.bihar.gov.in/AboutUsEn.aspx',verified_on:'2026-11-14'},
{id:'bihar-upyog-civic',name:'Bihar UPYOG Citizen Services',scope:'Bihar urban local bodies',description:'Official citizen-services page for urban local-body services. Select your district and urban local body.',url:'https://upyog.bihar.gov.in/c/citizen-services',phone:null,categories:['sanitation','infrastructure','utilities'],source_url:'https://upyog.bihar.gov.in/c/citizen-services',verified_on:'2026-11-14'},
{id:'central-cpgrams',name:'CPGRAMS',scope:'Government of India',description:'Central public grievance portal. Check its exclusions and jurisdiction before filing.',url:'https://pgportal.gov.in/V7/Home',phone:null,categories:['welfare','sanitation','infrastructure','utilities','healthcare','administration'],source_url:'https://pgportal.gov.in/V7/Home',verified_on:'2026-11-14'},
]
