import { useState } from 'react'
import { useLanguage } from './i18n'
import { supabase, supabaseConfigured } from './supabase'

export function SchemesPage() {
  const { t, language } = useLanguage()
  const links = [
    { title: 'Central and state government schemes', titleHi: 'केंद्र और राज्य सरकार की योजनाएँ', desc: 'Search schemes by your profile, state, category and eligibility criteria in the official myScheme directory.', descHi: 'आधिकारिक myScheme निर्देशिका में अपनी प्रोफ़ाइल, राज्य, श्रेणी और पात्रता के आधार पर योजनाएँ खोजें।', url: 'https://www.myscheme.gov.in/', tag: 'GOVERNMENT OF INDIA' },
    { title: 'Bihar citizen services', titleHi: 'बिहार नागरिक सेवाएँ', desc: 'Explore Bihar urban local-body citizen services and civic complaint channels.', descHi: 'बिहार के शहरी स्थानीय निकायों की नागरिक सेवाएँ और शिकायत चैनल देखें।', url: 'https://upyog.bihar.gov.in/c/citizen-services', tag: 'GOVERNMENT OF BIHAR' },
    { title: 'Bihar public grievance redressal', titleHi: 'बिहार लोक शिकायत निवारण', desc: 'Read the official state grievance redressal information and confirm whether your issue is covered.', descHi: 'राज्य की आधिकारिक लोक शिकायत जानकारी पढ़ें और जाँचें कि आपकी समस्या इसके अंतर्गत आती है या नहीं।', url: 'https://lokshikayat.bihar.gov.in/DefaultEn.aspx', tag: 'GOVERNMENT OF BIHAR' },
    { title: 'Central public grievance portal', titleHi: 'केंद्रीय लोक शिकायत पोर्टल', desc: 'Check the central portal scope and exclusions before submitting a grievance.', descHi: 'शिकायत दर्ज करने से पहले केंद्रीय पोर्टल का दायरा और अपवाद जाँचें।', url: 'https://pgportal.gov.in/V7/Home', tag: 'GOVERNMENT OF INDIA' },
  ]
  return <main className="page-wrap">
    <section className="schemes-hero"><div className="eyebrow">SCHEME DISCOVERY · OFFICIAL SOURCES</div><h1>{t.schemesTitle}</h1><p>{t.schemesIntro}</p><a className="button primary" href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer">{t.openMyScheme}</a></section>
    <div className="source-note">{t.officialOnly} Samadhan Setu does not determine or guarantee eligibility and does not submit scheme applications.</div>
    <div className="scheme-grid">{links.map((item)=><article className="scheme-card" key={item.url}><span className="scheme-tag">{item.tag}</span><h3>{language === 'hi' ? item.titleHi : item.title}</h3><p>{language === 'hi' ? item.descHi : item.desc}</p><a className="text-link" href={item.url} target="_blank" rel="noreferrer">Open official source ↗</a></article>)}</div>
    <p className="helper">Scheme availability, benefits, documents and eligibility rules can change. Confirm the latest information on the official scheme page and the relevant department's website.</p>
  </main>
}

type ChatMessage = { role: 'user'|'assistant'; content: string }
export function AssistantWidget() {
  const { t, language } = useLanguage()
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function send(e: React.FormEvent) {
    e.preventDefault()
    const prompt = question.trim()
    if (!prompt || busy) return
    const next = [...messages, { role: 'user' as const, content: prompt }]
    setMessages(next); setQuestion(''); setError(''); setBusy(true)
    try {
      if (!supabaseConfigured || !supabase) throw new Error(t.setupNeeded)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('Sign in to use the personalised assistant.')
      const response = await fetch(import.meta.env.VITE_SUPABASE_URL + '/functions/v1/citizen-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
        body: JSON.stringify({ messages: next, language }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Assistant is temporarily unavailable.')
      setMessages([...next, { role: 'assistant', content: result.answer }])
    } catch (err) { setError(err instanceof Error ? err.message : 'Assistant is unavailable.') }
    finally { setBusy(false) }
  }
  return <>
    {open&&<section className="assistant-panel" aria-label={t.chatTitle}><header className="assistant-head"><b>{t.chatTitle}</b><small>{t.chatIntro}</small></header><div className="assistant-messages">{messages.length===0&&<p className="assistant-message">{t.chatIntro}</p>}{messages.map((m,i)=><div className="assistant-message" key={i}><b>{m.role==='user'?'You':'Samadhan Setu'}</b><br/>{m.content}</div>)}{busy&&<p className="assistant-message">Thinking…</p>}{error&&<p className="error">{error}</p>}</div><form className="assistant-form" onSubmit={send}><input value={question} onChange={e=>setQuestion(e.target.value)} placeholder={t.chatPlaceholder} maxLength={1200}/><button disabled={busy||!question.trim()}>{t.send}</button></form><p className="assistant-disclaimer">{t.assistantDisclaimer}</p></section>}
    <button className="assistant-launch" onClick={()=>setOpen(!open)}>{open?'×': '✦ '+t.chatTitle}</button>
  </>
}
