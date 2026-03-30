import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StudentHome({ profile, setTab }) {
  const [attendance, setAttendance]  = useState([])
  const [loading,    setLoading]     = useState(true)
  const [schedule,   setSchedule]    = useState([])
  const [feeStatus,  setFeeStatus]   = useState({ total: 0, paid: 0 })
  const [upcomingEvent, setUpcomingEvent] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [profile.id])

  async function fetchDashboardData() {
    setLoading(true)
    try {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
      const todayISO = new Date().toISOString().split('T')[0]
      
      const [attendRes, ttRes, profileRes, eventRes] = await Promise.all([
        supabase.from('attendance').select('status, subjects(name)').eq('student_id', profile.id),
        supabase.from('timetable_slots').select('*, subjects(name, code)')
          .eq('branch', profile.branch)
          .eq('semester', profile.semester || 'Sem 4') 
          .eq('section', profile.section)
          .eq('day', today)
          .order('slot', { ascending: true }),
        supabase.from('fees').select('total_fee, paid_fee').eq('student_id', profile.id).maybeSingle(),
        supabase.from('academic_calendar')
          .select('*')
          .gte('date', todayISO)
          .order('date', { ascending: true })
          .limit(1)
          .maybeSingle()
      ])

      if (attendRes.data) {
        const grouped = {}
        attendRes.data.forEach(r => {
          const name = r.subjects?.name || 'Unknown'
          if (!grouped[name]) grouped[name] = { name, present: 0, total: 0 }
          grouped[name].total++
          if (r.status === 'present') grouped[name].present++
        })
        setAttendance(Object.values(grouped).map(g => ({
          ...g,
          percentage: g.total ? Math.round((g.present / g.total) * 100) : 0
        })))
      }

      setSchedule(ttRes.data || [])
      setUpcomingEvent(eventRes.data || null)
      
      if (profileRes.data) {
        setFeeStatus({
          total: profileRes.data.total_fee || 0,
          paid: profileRes.data.paid_fee || 0
        })
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const overall = attendance.length
    ? Math.round(attendance.reduce((a, b) => a + b.percentage, 0) / attendance.length)
    : 0
  const balance = feeStatus.total - feeStatus.paid

  const formatDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium animate-pulse">Syncing your campus life...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting Section */}
      <section className="card-editorial p-5 space-y-4">
        <div className="space-y-1">
          <p className="font-label text-primary font-black uppercase tracking-[0.25em] text-[8px] opacity-60">{formatDate()}</p>
          <h1 className="font-headline font-black text-2xl text-on-surface leading-tight">
            {getGreeting()},<br/>
            <span className="text-primary">{profile?.full_name?.split(' ')[0] || 'Scholar'}</span>
          </h1>
        </div>
        <div className="h-px bg-surface-container-low w-full"></div>
        <button onClick={() => setTab('schedule')} className="flex justify-between items-center group w-full text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-[20px]">calendar_today</span>
            </div>
            <span className="font-headline font-bold text-on-surface">Daily Schedule</span>
          </div>
          <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </section>

      {/* Essentials Section */}
      <section className="space-y-4">
        <h2 className="font-label text-[8px] tracking-[0.3em] font-black text-primary/40 px-2 uppercase">LATEST INSIGHTS</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Attendance Card */}
          <div onClick={() => setTab('attendance')} className="card-editorial p-4 flex flex-col justify-between aspect-square cursor-pointer active:scale-95 group">
            <div className="w-10 h-10 bg-[#E8F5E9] rounded-2xl flex items-center justify-center mb-2 group-hover:rotate-6 transition-transform">
              <span className="material-symbols-outlined text-green-800 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <div>
              <p className="font-label text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">Attendance</p>
              <h3 className="font-headline font-black text-on-surface text-2xl">{overall}%</h3>
            </div>
          </div>

          {/* Fee Payments Card */}
          <div onClick={() => setTab('fees')} className="card-editorial p-4 flex flex-col justify-between aspect-square cursor-pointer active:scale-95 group bg-[#FFF9F9]">
            <div className="w-10 h-10 bg-[#FCE4EC] rounded-2xl flex items-center justify-center mb-2 group-hover:-rotate-6 transition-transform">
              <span className="material-symbols-outlined text-pink-800 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <div>
              <p className="font-label text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">Student Fees</p>
              <p className="font-headline font-black text-on-surface text-base leading-tight">₹{balance.toLocaleString()}</p>
            </div>
          </div>

          {/* Academic Calendar Card (Holidays) */}
          <div onClick={() => setTab('schedule')} className="card-editorial p-4 flex flex-col justify-between aspect-square cursor-pointer active:scale-95 group bg-[#FFFBEB]">
            <div className="w-10 h-10 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-amber-800 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>event_note</span>
            </div>
            <div>
              <p className="font-label text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">Campus Events</p>
              {upcomingEvent ? (
                <div className="space-y-0.5">
                  <h3 className="font-headline font-black text-amber-900 text-[10px] uppercase line-clamp-1">{upcomingEvent.title}</h3>
                  <p className="font-headline font-black text-amber-700 text-xs">{new Date(upcomingEvent.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                </div>
              ) : (
                <h3 className="font-headline font-black text-on-surface-variant/20 text-xs uppercase">No Holidays</h3>
              )}
            </div>
          </div>

          {/* LMS Quick Connect Card */}
          <div onClick={() => setTab('academics')} className="card-editorial p-4 flex flex-col justify-between aspect-square cursor-pointer active:scale-95 group">
            <div className="w-10 h-10 bg-[#E0F7FA] rounded-2xl flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-cyan-800 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            </div>
            <div>
              <p className="font-label text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">LMS Portal</p>
              <h3 className="font-headline font-black text-on-surface text-base">Course Hub</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="editorial-gradient rounded-[2.5rem] shadow-ambient overflow-hidden relative min-h-[160px] flex flex-col justify-end p-6 group cursor-pointer active:scale-[0.98] transition-all">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000" 
            alt="Library"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcb1YOTj9y23S69XYuM-K1QA7V6KGIMBvCaZ5U_Tl0FexMvVgEB3s08FHpZBxZbPnjGLQUTeF_51SJw722hBXGnwJi6BWpDKdd0Makfih5u4_eGUyIkrVvD5BI3kMPMeKTVt4HiT_moaJm9KovWcxsIEXb1WMvMbkWYzHaWv5IEBpukQ199WoW8LN9Q2ryug7ai9nFVkjWbrO87u2Fqj1leEv6788hxC5EsgQNC7DAR90Z77U504byvfg0ePh9QRiBVGhSRlysfqY"
          />
        </div>
        <div className="relative z-10 space-y-1">
          <span className="bg-white/20 backdrop-blur-sm text-white font-label text-[8px] px-2.5 py-1 rounded-full uppercase tracking-widest font-black text-xs">Trending Now</span>
          <h3 className="font-headline font-black text-xl text-white tracking-tight">Quantum Mechanics II</h3>
          <p className="font-body text-white/70 text-[10px] font-medium leading-relaxed">Available for borrowing in the main wing.</p>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}} />
    </div>
  )
}
