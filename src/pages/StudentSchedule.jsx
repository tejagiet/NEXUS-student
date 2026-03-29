import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SLOT_TIMES = {
  1: '09:00 AM - 10:00 AM',
  2: '10:00 AM - 11:00 AM',
  3: '11:00 AM - 12:00 PM',
  4: '12:00 PM - 01:00 PM',
  5: '02:00 PM - 03:00 PM',
  6: '03:00 PM - 04:00 PM',
  7: '04:00 PM - 05:00 PM'
}

export default function StudentSchedule({ profile }) {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }))

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const weekDates = days.map((day, i) => {
    const today = new Date()
    const currentDay = today.getDay() // 0-6
    const diff = i + 1 - currentDay
    const date = new Date(today)
    date.setDate(today.getDate() + diff)
    return {
      name: day,
      short: day.substring(0, 3),
      date: date.getDate(),
      isToday: day === new Date().toLocaleDateString('en-US', { weekday: 'long' })
    }
  })

  useEffect(() => {
    fetchSchedule()
  }, [profile.id, selectedDay])

  async function fetchSchedule() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('timetable_slots')
        .select('*, subjects(name, code)')
        .eq('branch', profile.branch)
        .eq('semester', 'Sem 4') // Default
        .eq('section', profile.section)
        .eq('day', selectedDay)
        .order('slot', { ascending: true })

      if (data) setSchedule(data)
    } catch (err) {
      console.error("Schedule Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in duration-700 h-full">
      {/* Schedule Header Section */}
      <section className="editorial-gradient pt-8 pb-16 px-6 -mx-4 shadow-ambient relative z-30">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4 text-white">
            <h2 className="font-headline font-black text-3xl tracking-tighter">Daily Planner</h2>
          </div>
          <div className="flex items-center gap-2 text-white/80 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span className="font-label text-xs font-black uppercase tracking-widest">March</span>
          </div>
        </div>

        {/* Date Selector Tab */}
        <div className="flex justify-between items-end overflow-x-auto hide-scrollbar">
          {weekDates.map((day, i) => (
            selectedDay === day.name ? (
              <div key={i} className="bg-white rounded-t-[2.5rem] px-6 pt-6 pb-3 flex flex-col items-center gap-1 shadow-ambient relative z-10 scale-110 origin-bottom transition-all duration-500">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40">{day.short}</span>
                <span className="text-2xl font-black text-primary leading-none mb-1">{day.date}</span>
                <div className="w-1 h-1 rounded-full bg-primary/20"></div>
              </div>
            ) : (
              <button 
                key={i} 
                onClick={() => setSelectedDay(day.name)}
                className="flex flex-col items-center gap-2 px-4 py-6 text-white/40 hover:text-white transition-all active:scale-90"
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{day.short}</span>
                <span className="text-xl font-bold">{day.date}</span>
              </button>
            )
          ))}
        </div>
      </section>

      {/* Schedule Cards Area */}
      <section className="bg-surface min-h-screen px-6 pt-12 pb-32 -mt-8 rounded-t-[3rem] relative z-20 -mx-4">
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-black text-[10px] uppercase tracking-widest text-primary">Fetching slots...</p>
             </div>
          ) : schedule.length === 0 ? (
            <div className="py-32 text-center text-on-surface-variant/30 italic flex flex-col items-center">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-20">event_busy</span>
              <p className="font-headline font-bold uppercase tracking-widest text-xs">No academic activities</p>
            </div>
          ) : (
            schedule.map((slot, i) => (
              <div key={i} className="card-editorial p-8 flex flex-col gap-6 group active:scale-[0.98]">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-label text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">{SLOT_TIMES[slot.slot]}</p>
                    <h3 className="font-headline font-black text-on-surface text-xl tracking-tight leading-tight uppercase">{slot.subjects?.name}</h3>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${slot.type === 'lab' ? 'bg-indigo-50 text-indigo-600' : 'bg-teal-50 text-teal-600'}`}>
                    {slot.type || 'Lecture'}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-surface-container-low">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary border border-outline-variant/10 shadow-inner">
                         <span className="font-headline font-black text-sm">{slot.subjects?.name.charAt(0)}</span>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Faculty Advisor</p>
                         <p className="text-xs font-bold text-primary">DR. V. SHARMA</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Location</p>
                      <p className="text-xs font-bold text-primary">ROOM {slot.room || 'L-402'}</p>
                   </div>
                </div>
              </div>
            ))
          )}

          {!loading && schedule.length > 0 && (
             <div className="relative py-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-outline-variant/30"></div>
              </div>
              <div className="relative px-4 bg-surface-container-low">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50">End of Session</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}} />
    </div>
  )
}
