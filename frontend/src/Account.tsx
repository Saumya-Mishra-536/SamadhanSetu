import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabase'
import { useLanguage } from './i18n'

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(supabaseConfigured))
  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])
  return { user, loading }
}

export function AuthPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setNotice('')
    if (!supabase) return setError(t.setupNeeded)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })
        if (authError) throw authError
        setNotice('Check your email to confirm your account, then sign in.')
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) throw authError
        navigate('/profile')
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed') }
    finally { setBusy(false) }
  }
  async function resetPassword() {
    if (!supabase) return setError(t.setupNeeded)
    if (!email) return setError('Enter your email address first.')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/profile' })
    if (resetError) setError(resetError.message); else setNotice(t.resetSent)
  }
  return <main className="page-wrap account-wrap"><section className="form-card account-card"><div className="eyebrow">SECURE CITIZEN ACCOUNT</div><h1>{t.authTitle}</h1><p className="helper">Your account is separate from government identity systems.</p>
    {!supabaseConfigured && <p className="error">{t.setupNeeded}</p>}
    <div className="account-tabs"><button className={mode==='signin'?'active':''} onClick={()=>setMode('signin')}>{t.signIn}</button><button className={mode==='signup'?'active':''} onClick={()=>setMode('signup')}>{t.createAccount}</button></div>
    <form onSubmit={submit}>{mode==='signup'&&<label>{t.name}<input value={name} onChange={e=>setName(e.target.value)} maxLength={100} required/></label>}<label>{t.email}<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>{t.password}<input type="password" autoComplete={mode==='signup'?'new-password':'current-password'} minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="button primary" disabled={busy||!supabaseConfigured}>{busy?'Please wait…':mode==='signup'?t.createAccount:t.signIn}</button></form>
    {mode==='signin'&&<button className="text-link reset-link" onClick={resetPassword}>{t.forgot}</button>}{notice&&<p className="success-msg">{notice}</p>}{error&&<p className="error">{error}</p>}<p className="helper">Use a unique password. Samadhan Setu does not ask for Aadhaar, OTPs or banking passwords.</p><Link to="/" className="text-link">← Back to home</Link>
  </section></main>
}

export function ProfilePage() {
  const { t } = useLanguage()
  const { user, loading } = useCurrentUser()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setName(String(user?.user_metadata?.full_name ?? ''))
    setPhone(String(user?.user_metadata?.phone ?? ''))
    setAvatar(String(user?.user_metadata?.avatar_url ?? ''))
  }, [user])
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (!supabase || !user) return
    setBusy(true); setError(''); setNotice('')
    const { error: updateError } = await supabase.auth.updateUser({ data: { full_name: name.trim(), phone: phone.trim() } })
    if (updateError) setError(updateError.message); else setNotice('Profile updated.')
    setBusy(false)
  }
  async function upload(file?: File) {
    if (!supabase || !user || !file) return
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 2*1024*1024) return setError('Choose a JPG, PNG or WebP image under 2 MB.')
    setBusy(true); setError(''); setNotice('')
    const path = user.id + '/avatar-' + Date.now()
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) setError(uploadError.message)
    else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: data.publicUrl } })
      if (updateError) setError(updateError.message)
      else { setAvatar(data.publicUrl); setNotice('Profile photo updated.') }
    }
    setBusy(false)
  }
  async function signOut() { if (supabase) { await supabase.auth.signOut(); window.location.href='/' } }
  if (loading) return <main className="page-wrap"><p>Loading account…</p></main>
  if (!user) return <main className="page-wrap"><section className="form-card"><h1>Sign in required</h1><p>Sign in to manage your profile.</p><Link className="button primary" to="/login">Sign in</Link></section></main>
  return <main className="page-wrap account-wrap"><section className="form-card account-card"><div className="eyebrow">ACCOUNT SETTINGS</div><h1>{t.profileTitle}</h1>
    <div className="avatar-row">{avatar?<img src={avatar} alt="Profile" className="avatar-preview"/>:<div className="avatar-placeholder">{name.slice(0,1).toUpperCase()||'S'}</div>}<div><b>{t.avatar}</b><label className="upload-label">{t.upload}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files?.[0])} disabled={busy}/></label><small>JPG, PNG or WebP · 2 MB maximum</small></div></div>
    <form onSubmit={save}><label>{t.name}<input value={name} onChange={e=>setName(e.target.value)} maxLength={100}/></label><label>{t.email}<input value={user.email??''} disabled/></label><label>{t.phone}<input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} maxLength={20}/></label><button className="button primary" disabled={busy}>{t.save}</button></form>
    {notice&&<p className="success-msg">{notice}</p>}{error&&<p className="error">{error}</p>}<button className="button secondary signout" onClick={signOut}>{t.signOut}</button>
  </section></main>
}
