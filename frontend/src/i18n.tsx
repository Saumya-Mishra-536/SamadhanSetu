import { createContext, useContext, useMemo, useState } from 'react'
import { supabase } from './supabase'
import type { ReactNode } from 'react'

export type Language = 'en' | 'hi'
const messages = {
  en: {
    overview:'Overview', grievances:'My grievances', schemes:'Find schemes', resources:'Government resources', insights:'Insights', raise:'Raise a grievance',
    signIn:'Sign in', profile:'My profile', signOut:'Sign out', language:'Language', english:'English', hindi:'हिन्दी',
    independent:'Independent citizen assistance platform · Not an official government website',
    homeTitle:'Your voice matters.', homeSubtitle:'Find public services, understand possible next steps and keep your records organised.',
    schemesTitle:'Discover government schemes', schemesIntro:'Explore official scheme information and check eligibility through the Government of India’s scheme directory.',
    openMyScheme:'Explore on myScheme ↗', eligibility:'Check eligibility', officialOnly:'Eligibility and benefits are decided by the relevant government department. Verify current rules on the official source.',
    profileTitle:'Profile and preferences', name:'Full name', phone:'Phone number', save:'Save profile', avatar:'Profile photo', upload:'Upload photo',
    authTitle:'Welcome to Samadhan Setu', email:'Email address', password:'Password', createAccount:'Create account', forgot:'Forgot password?', resetSent:'Password reset email requested.',
    chatTitle:'Ask Samadhan Setu', chatIntro:'Ask a question about public services or government schemes. Verify important details with the linked official source.',
    chatPlaceholder:'Type your question…', send:'Send', assistantDisclaimer:'AI guidance can be incomplete. It is not an official decision or legal advice.',
    setupNeeded:'Account services need Supabase configuration. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment.',
  },
  hi: {
    overview:'मुख्य पृष्ठ', grievances:'मेरी शिकायतें', schemes:'योजनाएँ खोजें', resources:'सरकारी संसाधन', insights:'जानकारी', raise:'शिकायत दर्ज करें',
    signIn:'लॉग इन', profile:'मेरी प्रोफ़ाइल', signOut:'लॉग आउट', language:'भाषा', english:'English', hindi:'हिन्दी',
    independent:'स्वतंत्र नागरिक सहायता मंच · आधिकारिक सरकारी वेबसाइट नहीं',
    homeTitle:'आपकी आवाज़ महत्वपूर्ण है।', homeSubtitle:'सार्वजनिक सेवाएँ खोजें, अगले कदम समझें और अपने रिकॉर्ड व्यवस्थित रखें।',
    schemesTitle:'सरकारी योजनाएँ खोजें', schemesIntro:'भारत सरकार की योजना निर्देशिका में आधिकारिक जानकारी देखें और पात्रता जाँचें।',
    openMyScheme:'myScheme पर देखें ↗', eligibility:'पात्रता जाँचें', officialOnly:'पात्रता और लाभ का निर्णय संबंधित सरकारी विभाग करता है। वर्तमान नियम आधिकारिक स्रोत पर जाँचें।',
    profileTitle:'प्रोफ़ाइल और प्राथमिकताएँ', name:'पूरा नाम', phone:'फ़ोन नंबर', save:'प्रोफ़ाइल सहेजें', avatar:'प्रोफ़ाइल फ़ोटो', upload:'फ़ोटो अपलोड करें',
    authTitle:'समाधान सेतु में आपका स्वागत है', email:'ईमेल पता', password:'पासवर्ड', createAccount:'खाता बनाएँ', forgot:'पासवर्ड भूल गए?', resetSent:'पासवर्ड रीसेट ईमेल का अनुरोध भेजा गया।',
    chatTitle:'समाधान सेतु से पूछें', chatIntro:'सार्वजनिक सेवाओं या सरकारी योजनाओं के बारे में प्रश्न पूछें। महत्वपूर्ण जानकारी आधिकारिक स्रोत से सत्यापित करें।',
    chatPlaceholder:'अपना प्रश्न लिखें…', send:'भेजें', assistantDisclaimer:'AI की जानकारी अधूरी हो सकती है। यह आधिकारिक निर्णय या कानूनी सलाह नहीं है।',
    setupNeeded:'खाता सेवाओं के लिए Supabase कॉन्फ़िगरेशन आवश्यक है। डिप्लॉयमेंट में VITE_SUPABASE_URL और VITE_SUPABASE_ANON_KEY जोड़ें।',
  },
} as const

type Copy = typeof messages.en
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: Copy } | null>(null)
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('samadhan-language') === 'hi' ? 'hi' : 'en'))
  const setLanguage = (next: Language) => { localStorage.setItem('samadhan-language', next); setLanguageState(next); if (supabase) supabase.auth.getUser().then(({ data }) => { if (data.user) void supabase.from('profiles').upsert({ id: data.user.id, preferred_language: next }) }) }
  const value = useMemo(() => ({ language, setLanguage, t: messages[language] }), [language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
export function useLanguage() {
  const value = useContext(LanguageContext)
  if (!value) throw new Error('useLanguage must be used inside LanguageProvider')
  return value
}
