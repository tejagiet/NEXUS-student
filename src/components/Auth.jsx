import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, UserPlus, Loader2, Eye, EyeOff, ShieldCheck, ChevronDown, Badge, Check, HelpCircle, Shield } from 'lucide-react'

const BRANCHES = ['CME', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI', 'OTHER']

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(null)

  // Sign-in fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleAuth(e) {
    e.preventDefault()
    setLoading(true); setError(null)

    try {
      // Auto-suffix if not an email
      const finalEmail = email.includes('@') ? email : `${email.toLowerCase()}@nexusgiet.edu.in`
      const { error } = await supabase.auth.signInWithPassword({ email: finalEmail, password })
      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function signInWithGoogle() {
    setLoading(true); setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' }
      }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-on-surface relative overflow-hidden">
      
      {/* Decorative blobs - subtle for light theme */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Section: Branding */}
      <header className="flex flex-col items-center mb-10 relative z-10">
        <div className="w-20 h-20 mb-4 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 overflow-hidden">
          <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        </div>
        <h1 className="font-headline font-black text-3xl tracking-tighter text-[#272A6F] uppercase">
          Nexus GIET
        </h1>
        <p className="font-sans text-on-surface-variant text-[10px] font-black mt-1 tracking-[0.3em] opacity-40 uppercase">Empowering Academic Excellence</p>
      </header>

      {/* Middle Section: Login Card */}
      <main className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(39,42,111,0.1)] border border-outline-variant/10">
          <div className="mb-8">
            <h2 className="font-headline font-black text-2xl text-[#272A6F] mb-1 uppercase tracking-tight">Student Login</h2>
            <p className="font-body text-on-surface-variant/60 text-xs font-medium">Please enter your credentials to access your dashboard.</p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-error/5 border border-error/10 text-error text-[11px] p-4 rounded-2xl font-bold animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-headline text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant px-1" htmlFor="email-id">
                Scholar ID or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary/40 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-body text-sm outline-none shadow-inner"
                  id="email-id"
                  placeholder="PIN or Institutional Email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-headline text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary/40 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">lock_open</span>
                </div>
                <input
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all font-body text-sm outline-none shadow-inner"
                  id="password"
                  placeholder="••••••••"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-4 flex items-center text-primary/20 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPass ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded-lg checked:bg-primary checked:border-primary transition-all duration-200"
                  />
                  <Check className="absolute text-white size-3.5 left-0.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="font-headline text-[10px] font-black text-on-surface-variant/60 group-hover:text-on-surface uppercase tracking-widest transition-colors">Remember Me</span>
              </label>
              <a className="text-primary font-headline text-[10px] font-black hover:underline decoration-2 underline-offset-4 uppercase tracking-widest" href="#">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              disabled={loading}
              className={`w-full py-5 bg-[#272A6F] text-white font-headline font-black text-xs uppercase tracking-[0.25em] rounded-full shadow-xl shadow-primary/20 active:scale-[0.98] transition-all hover:bg-primary-900 mt-4 flex items-center justify-center gap-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : "Launch Portal"}
            </button>

            <div className="flex items-center py-2">
              <div className="flex-1 border-t border-dashed border-outline-variant/30" />
              <span className="px-4 text-[9px] text-on-surface-variant/30 font-black uppercase tracking-widest">Secure Connect</span>
              <div className="flex-1 border-t border-dashed border-outline-variant/30" />
            </div>

            <button type="button" onClick={signInWithGoogle} disabled={loading}
              className="w-full bg-surface-container-low text-on-surface font-headline font-black text-[10px] uppercase tracking-widest py-4 rounded-full transition-all flex items-center justify-center gap-3 hover:bg-surface-container-high active:scale-95 disabled:opacity-50 border border-outline-variant/5">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Section: Footer Links */}
      <footer className="mt-12 text-center relative z-10">
        <p className="font-body text-on-surface-variant/60 text-xs font-medium">
          New Scholar? <a className="text-primary font-bold hover:underline" href="#">Contact Administration</a>
        </p>
        <div className="mt-8 flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-2 text-on-surface-variant/40 hover:text-primary transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">help_outline</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Support</span>
          </div>
          <div className="flex items-center space-x-2 text-on-surface-variant/40 hover:text-primary transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">security</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
