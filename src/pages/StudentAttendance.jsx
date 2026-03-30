import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StudentAttendance({ profile }) {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendance()
  }, [profile.id])

  async function fetchAttendance() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('status, subjects(name, code)')
        .eq('student_id', profile.id)

      if (data) {
        const grouped = {}
        data.forEach(r => {
          const name = r.subjects?.name || 'Unknown'
          const code = r.subjects?.code || '???'
          if (!grouped[name]) grouped[name] = { name, code, present: 0, total: 0 }
          grouped[name].total++
          if (r.status === 'present') grouped[name].present++
        })
        setAttendance(Object.values(grouped).map(g => ({
          ...g,
          percentage: g.total ? Math.round((g.present / g.total) * 100) : 0
        })).sort((a, b) => b.percentage - a.percentage))
      }
    } catch (err) {
      console.error("Attendance Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const overall = attendance.length
    ? Math.round(attendance.reduce((a, b) => a + b.percentage, 0) / attendance.length)
    : 0

  const getStatusLabel = (pct) => {
    if (pct >= 90) return { label: 'EXCELLENT', color: 'text-[#4CAF50]', bg: 'bg-[#4DB6AC]' };
    if (pct >= 75) return { label: 'ABOVE TARGET', color: 'text-[#4CAF50]', bg: 'bg-[#4DB6AC]' };
    if (pct >= 65) return { label: 'STABLE', color: 'text-on-surface-variant', bg: 'bg-primary' };
    return { label: 'LOW ATTENDANCE', color: 'text-error', bg: 'bg-[#F06292]' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium">Analyzing your presence...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header with back button */}
      <div className="flex items-center gap-4 py-1">
         <h1 className="font-headline font-bold text-lg text-primary">Attendance Analytics</h1>
      </div>

      {/* Summary Card */}
      <section>
        <div className="editorial-gradient rounded-[2rem] p-6 flex flex-col items-center justify-center gap-2 shadow-ambient relative overflow-hidden">
          {/* Decorative glass orbs */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <span className="text-white/60 font-label text-[8px] font-black uppercase tracking-[0.3em] relative z-10 opacity-70">Global Presence</span>
          <p className="text-white font-headline text-4xl font-black tracking-tighter relative z-10">{overall}%</p>
          
          <div className="w-full max-w-[160px] bg-white/20 h-1 rounded-full mt-1 overflow-hidden relative z-10">
            <div 
              className="bg-white h-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(255,255,255,0.5)]" 
              style={{ width: `${overall}%` }}
            />
          </div>
        </div>
      </section>

      {/* Weekly Trend (Visual Only Placeholder as in HTML) */}
      <section className="space-y-3">
        <div className="flex justify-between items-end gap-2 h-28 px-4 bg-surface-container-low rounded-xl py-4 border border-outline-variant/10">
          {[70, 45, 30, 90, 55].map((h, i) => (
            <div key={i} className="flex flex-col items-center flex-1 gap-1.5 h-full justify-end">
              <div 
                className={`w-full rounded-t-lg transition-all duration-1000 ease-out`} 
                style={{ height: `${h}%`, backgroundColor: h > 60 ? '#4DB6AC' : '#F06292' }}
              />
              <span className="text-[8px] font-bold text-on-surface-variant uppercase opacity-50">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <div className="bg-surface-container/60 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-outline-variant/5">
            <span className="material-symbols-outlined text-[14px] text-primary">insights</span>
            <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Visual Analysis</span>
          </div>
        </div>
      </section>

      {/* Course Breakdown List */}
      <section className="space-y-4">
        <h2 className="font-label text-[8px] font-black text-primary/40 px-2 uppercase tracking-[0.2em]">Curated Breakdown</h2>
        <div className="space-y-4">
          {attendance.map((sub, i) => {
            const status = getStatusLabel(sub.percentage);
            return (
              <div key={i} className="card-editorial p-4 flex items-center justify-between group cursor-pointer active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className={`w-1 h-9 rounded-full ${status.bg} opacity-20 group-hover:opacity-100 transition-all`}></div>
                  <div>
                    <p className="font-headline font-black text-sm text-primary uppercase tracking-tight leading-tight">{sub.name}</p>
                    <p className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-0.5">{sub.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline font-black text-primary text-lg tracking-tighter leading-tight">{sub.percentage}%</p>
                  <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest leading-none mb-1">{sub.present} / {sub.total}</p>
                  <p className={`text-[7px] ${status.color} font-black uppercase tracking-[0.1em]`}>{status.label}</p>
                </div>
              </div>
            )
          })}

          {attendance.length === 0 && (
            <div className="py-16 text-center card-editorial bg-surface-container-low border-2 border-dashed border-outline-variant/10">
              <p className="text-on-surface-variant font-medium">No records found for current semester.</p>
            </div>
          )}
        </div>
      </section>

      {/* Smart Tip Banner */}
      <section className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
        <div className="flex gap-3">
          <div className="bg-primary p-2.5 rounded-xl h-fit shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[18px]">lightbulb</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-xs text-primary leading-tight">Smart Analysis</h3>
            <p className="text-[10px] text-on-surface/70 mt-1 leading-relaxed font-medium">
              {overall < 75 
                ? "You are currently below the required 75% threshold. Aim to attend all classes next week to recover."
                : "Great job! You are maintaining a healthy attendance level. Keep it up for your internal marks."}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
