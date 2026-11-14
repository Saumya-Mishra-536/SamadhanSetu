import { Link, useParams } from 'react-router-dom'
import { useLanguage } from './i18n'

const pages: Record<string,{title:string;titleHi:string;body:string[];bodyHi:string[]}> = {
 privacy:{title:'Privacy notice',titleHi:'गोपनीयता सूचना',body:[
  'This prototype stores account details and grievance drafts in a Supabase project configured by the platform operator. Row-level security is intended to restrict records to the signed-in account; this must be tested in the deployed project before real use.',
  'Do not submit Aadhaar, PAN, bank details, passwords, OTPs, medical records or identity documents. Share only the minimum information needed to describe a public-service issue.',
  'The AI assistant sends the text of your question and recent conversation messages to the configured model provider for a response. Do not include sensitive personal information. Provider retention and processing settings must be reviewed by the operator.',
  'You may delete grievance records from the application. A complete account/data deletion workflow and a formal retention schedule are not yet implemented. Contact the platform operator before using this service with personal data.',
  'This notice is a prototype disclosure, not a legal opinion or a representation of compliance with the Digital Personal Data Protection Act or rules. Obtain qualified legal review before public launch.'
 ],bodyHi:[
  'यह प्रोटोटाइप खाते की जानकारी और शिकायत प्रारूप को प्लेटफ़ॉर्म संचालक द्वारा कॉन्फ़िगर किए गए Supabase प्रोजेक्ट में रखता है। Row-level security का उद्देश्य रिकॉर्ड को संबंधित खाते तक सीमित रखना है; वास्तविक उपयोग से पहले तैनात प्रोजेक्ट में इसका परीक्षण आवश्यक है।',
  'आधार, पैन, बैंक विवरण, पासवर्ड, OTP, चिकित्सा रिकॉर्ड या पहचान दस्तावेज़ न भेजें। समस्या बताने के लिए केवल न्यूनतम आवश्यक जानकारी साझा करें।',
  'AI सहायक उत्तर तैयार करने के लिए आपके प्रश्न और हाल के संदेश कॉन्फ़िगर किए गए मॉडल प्रदाता को भेजता है। संवेदनशील व्यक्तिगत जानकारी शामिल न करें। संचालक को प्रदाता की डेटा-प्रसंस्करण और संरक्षण सेटिंग की समीक्षा करनी चाहिए।',
  'आप ऐप से शिकायत रिकॉर्ड हटा सकते हैं। खाते और सभी डेटा को हटाने की पूर्ण सुविधा तथा औपचारिक डेटा संरक्षण अवधि अभी लागू नहीं है। व्यक्तिगत डेटा का उपयोग करने से पहले प्लेटफ़ॉर्म संचालक से संपर्क करें।',
  'यह प्रोटोटाइप सूचना है, कानूनी राय या DPDP अधिनियम/नियमों के अनुपालन का दावा नहीं। सार्वजनिक लॉन्च से पहले योग्य कानूनी समीक्षा कराएँ।'
 ]},
 terms:{title:'Terms of use',titleHi:'उपयोग की शर्तें',body:[
  'Samadhan Setu is an independent civic-assistance and navigation prototype. It is not a government website, department, grievance authority or official partner.',
  'The service helps organise a description, suggest a preliminary category, prepare an editable draft and store citizen-entered notes. It does not submit complaints, issue certificates, determine eligibility or check official grievance status.',
  'Government links are provided as starting points only. You are responsible for confirming jurisdiction, current procedures, eligibility, deadlines and required documents with the relevant official source.',
  'Do not misuse the service, upload unlawful material or submit another person’s personal information without authority. Do not rely on generated guidance for emergencies or legal decisions.'
 ],bodyHi:[
  'Samadhan Setu एक स्वतंत्र नागरिक सहायता और मार्गदर्शन प्रोटोटाइप है। यह सरकारी वेबसाइट, विभाग, शिकायत प्राधिकरण या आधिकारिक भागीदार नहीं है।',
  'यह सेवा समस्या का विवरण व्यवस्थित करने, प्रारंभिक श्रेणी सुझाने, संपादन योग्य प्रारूप बनाने और नागरिक द्वारा लिखे नोट सहेजने में मदद करती है। यह शिकायत जमा नहीं करती, प्रमाणपत्र जारी नहीं करती, पात्रता तय नहीं करती और सरकारी स्थिति नहीं जाँचती।',
  'सरकारी लिंक केवल शुरुआती जानकारी के लिए हैं। अधिकार क्षेत्र, वर्तमान प्रक्रिया, पात्रता, समय-सीमा और दस्तावेज़ की पुष्टि संबंधित आधिकारिक स्रोत से करना आपकी ज़िम्मेदारी है।',
  'सेवा का दुरुपयोग न करें, गैरकानूनी सामग्री अपलोड न करें और बिना अधिकार किसी अन्य व्यक्ति की निजी जानकारी न दें। आपातकाल या कानूनी निर्णय के लिए AI मार्गदर्शन पर निर्भर न रहें।'
 ]},
 accessibility:{title:'Accessibility statement',titleHi:'सुगम्यता वक्तव्य',body:[
  'We aim to improve access for people using keyboards, screen readers, mobile devices and Hindi/English language settings. The interface includes a skip link, visible keyboard focus, text-size and contrast controls, and responsive layouts.',
  'This is not a certified WCAG 2.1 AA or GIGW audit. Screen-reader testing, colour-contrast measurement, keyboard-only testing and testing on low-cost Android devices remain to be completed.',
  'If you encounter an accessibility barrier, please use the Contact page once the operator contact is published.'
 ],bodyHi:[
  'हम कीबोर्ड, स्क्रीन रीडर, मोबाइल उपकरण और हिन्दी/अंग्रेज़ी भाषा सेटिंग का उपयोग करने वाले लोगों के लिए पहुँच बेहतर बनाने का प्रयास करते हैं। इंटरफ़ेस में skip link, स्पष्ट keyboard focus, टेक्स्ट आकार और contrast नियंत्रण तथा responsive layout शामिल हैं।',
  'यह WCAG 2.1 AA या GIGW का प्रमाणित ऑडिट नहीं है। स्क्रीन रीडर, रंग contrast, केवल कीबोर्ड और कम लागत वाले Android उपकरणों पर परीक्षण बाकी हैं।',
  'यदि आपको सुगम्यता संबंधी बाधा मिले, तो संचालक का संपर्क प्रकाशित होने के बाद Contact पेज का उपयोग करें।'
 ]},
 disclaimer:{title:'Disclaimer',titleHi:'अस्वीकरण',body:[
  'Samadhan Setu is an independent prototype and is not affiliated with, endorsed by or operated by the Government of India, Government of Bihar, MyGov or any public authority.',
  'Classification and suggested next steps are informational only. They are not an official determination, legal advice, a promise of resolution or confirmation that a listed authority has jurisdiction.',
  'All grievance drafts remain under your control and must be submitted by you through the relevant official channel. Follow-up notes are citizen-entered and are not government-confirmed status.'
 ],bodyHi:[
  'Samadhan Setu एक स्वतंत्र प्रोटोटाइप है। इसका भारत सरकार, बिहार सरकार, MyGov या किसी सार्वजनिक प्राधिकरण से संबंध, समर्थन या संचालन नहीं है।',
  'श्रेणी और सुझाए गए अगले कदम केवल जानकारी के लिए हैं। ये आधिकारिक निर्णय, कानूनी सलाह, समाधान का वादा या किसी प्राधिकरण के अधिकार क्षेत्र की पुष्टि नहीं हैं।',
  'सभी शिकायत प्रारूप आपके नियंत्रण में रहते हैं और संबंधित आधिकारिक माध्यम से आपको स्वयं जमा करने होंगे। फ़ॉलो-अप नोट नागरिक द्वारा दर्ज किए जाते हैं, सरकारी स्थिति नहीं हैं।'
 ]},
 help:{title:'Help and frequently asked questions',titleHi:'सहायता और अक्सर पूछे जाने वाले प्रश्न',body:[
  'How do I submit a grievance? Sign in, describe the issue and location, review the suggested category and edit the draft. The application does not submit it for you.',
  'Is my grievance officially registered? No. A saved record is only a private draft in your account. Use the relevant official portal to submit and obtain an official acknowledgement.',
  'Can Samadhan Setu confirm my eligibility for a government scheme? No. Use the official myScheme portal and the relevant department’s current rules.',
  'Can I track government action here? No. You can record your own follow-up notes, but they are not live status updates.',
  'What if a resource does not cover my issue? Check its jurisdiction and exclusions, or consult the responsible department’s official website.'
 ],bodyHi:[
  'शिकायत कैसे दर्ज करें? साइन इन करें, समस्या और स्थान बताएँ, सुझाई गई श्रेणी देखें और प्रारूप संपादित करें। ऐप आपकी ओर से शिकायत जमा नहीं करता।',
  'क्या शिकायत आधिकारिक रूप से दर्ज होती है? नहीं। सहेजा गया रिकॉर्ड आपके खाते का निजी प्रारूप है। आधिकारिक पावती के लिए संबंधित सरकारी पोर्टल पर स्वयं जमा करें।',
  'क्या Samadhan Setu सरकारी योजना की पात्रता की पुष्टि कर सकता है? नहीं। आधिकारिक myScheme पोर्टल और संबंधित विभाग के वर्तमान नियम देखें।',
  'क्या यहाँ सरकारी कार्रवाई ट्रैक कर सकते हैं? नहीं। आप अपने फ़ॉलो-अप नोट लिख सकते हैं, लेकिन वे लाइव स्थिति अपडेट नहीं हैं।',
  'यदि कोई संसाधन आपकी समस्या के लिए नहीं है तो? उसका अधिकार क्षेत्र और अपवाद जाँचें या संबंधित विभाग की आधिकारिक वेबसाइट देखें।'
 ]},
 contact:{title:'Contact and platform grievance contact',titleHi:'संपर्क और प्लेटफ़ॉर्म शिकायत संपर्क',body:[
  'A named platform grievance officer and a monitored contact email have not yet been configured for this prototype. This information must be supplied by the project owner before public launch; no contact details are invented here.',
  'Do not submit personal documents, Aadhaar/PAN numbers, OTPs, passwords or bank information through this prototype. For a government-service issue, contact the relevant department using its official website.'
 ],bodyHi:[
  'इस प्रोटोटाइप के लिए नामित प्लेटफ़ॉर्म शिकायत अधिकारी और निगरानी वाला संपर्क ईमेल अभी कॉन्फ़िगर नहीं किया गया है। सार्वजनिक लॉन्च से पहले परियोजना स्वामी को यह जानकारी देनी होगी; यहाँ कोई संपर्क विवरण गढ़ा नहीं गया है।',
  'इस प्रोटोटाइप के माध्यम से व्यक्तिगत दस्तावेज़, आधार/पैन नंबर, OTP, पासवर्ड या बैंक जानकारी न भेजें। सरकारी सेवा की समस्या के लिए संबंधित विभाग की आधिकारिक वेबसाइट से संपर्क करें।'
 ]}
}
export function InformationPage(){
 const {slug='help'}=useParams()
 const {language}=useLanguage()
 const page=pages[slug]
 if(!page)return <main className="page-wrap"><section className="info-card"><h1>Page not found</h1><Link to="/">Return home</Link></section></main>
 const title=language==='hi'?page.titleHi:page.title
 const body=language==='hi'?page.bodyHi:page.body
 return <main className="page-wrap"><article className="info-card"><div className="eyebrow">SAMADHAN SETU · INFORMATION</div><h1>{title}</h1>{body.map((p,i)=><p key={i}>{p}</p>)}<p><Link to="/" className="text-link">← {language==='hi'?'मुख्य पृष्ठ':'Back to home'}</Link></p></article></main>
}
