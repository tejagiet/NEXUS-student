import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import StudentApp from './StudentApp'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        setProfile(null)
        setLoading(false)
      }
    })

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; // Standard for showing "Discard changes?" browser prompt
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchProfile()
    }
  }, [session])

  async function fetchProfile() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) throw error
      
      // Verification: Only allow students in this app
      const roles = data?.roles || [data?.role] || []
      if (!roles.includes('student')) {
        alert('Access Denied: This portal is for students only.')
        await supabase.auth.signOut()
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface-variant font-headline font-bold uppercase tracking-widest text-xs">Nexus Student Sync...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  if (profile) {
    return <StudentApp profile={profile} session={session} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-10">
      <div className="text-center space-y-4 max-w-xs">
        <span className="material-symbols-outlined text-error text-6xl">error_outline</span>
        <h2 className="text-xl font-headline font-black text-primary uppercase">Profile Error</h2>
        <p className="text-sm text-on-surface-variant font-medium">We couldn't load your student profile. Please contact the administrator.</p>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
        >
          Sign Out & Retry
        </button>
      </div>
    </div>
  )
}
