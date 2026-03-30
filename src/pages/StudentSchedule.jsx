import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const SLOT_TIMES = {
  1: '09:30 AM - 10:15 AM',
  2: '10:15 AM - 11:00 AM',
  3: '11:00 AM - 11:45 AM',
  4: '11:45 AM - 12:30 PM',
  5: '01:15 PM - 02:15 PM',
  6: '02:15 PM - 03:15 PM',
  7: '03:15 PM - 04:15 PM'
}

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StudentSchedule({ profile }) {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('day') // 'day' or 'week'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dates, setDates] = useState([])
  
  const scrollRef = useRef(null)
  const todayRef = useRef(null)

  // Logic to group consecutive lab slots
  const groupSlots = (slots) => {
    if (!slots || slots.length === 0) return []
    const grouped = []
    let currentGroup = null

    const sorted = [...slots].sort((a, b) => a.slot - b.slot)

    sorted.forEach((slot) => {
      const isLab = slot.type?.toLowerCase() === 'lab'
      
      // Merge if it's a lab, and the subject matches the previous slot, and it's consecutive
      if (isLab && currentGroup && slot.subjects?.name === currentGroup.subjects?.name && slot.slot === Math.max(...currentGroup.slots) + 1) {
        currentGroup.slots.push(slot.slot)
        currentGroup.endTime = SLOT_TIMES[slot.slot].split(' - ')[1]
      } else {
        currentGroup = {
          ...slot,
          isGroup: isLab,
          slots: [slot.slot],
          startTime: SLOT_TIMES[slot.slot].split(' - ')[0],
          endTime: SLOT_TIMES[slot.slot].split(' - ')[1]
        }
        grouped.push(currentGroup)
      }
    })
    return grouped
  }

  // Generate 120 days rolling window for the semester
  useEffect(() => {
    const generated = []
    const today = new Date()
    
    // 30 days back, 90 days forward
    for (let i = -30; i <= 90; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      
      // Skip Sundays (Holy-day)
      if (d.getDay() === 0) continue;

      generated.push({
        fullDate: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
        shortDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: d.toLocaleDateString('en-US') === today.toLocaleDateString('en-US')
      })
    }
    setDates(generated)

    // Auto-scroll to today
    setTimeout(() => {
      if (todayRef.current && scrollRef.current) {
        const scrollContainer = scrollRef.current
        const todayElement = todayRef.current
        const scrollLeft = todayElement.offsetLeft - (scrollContainer.clientWidth / 2) + (todayElement.clientWidth / 2)
        scrollContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      }
    }, 500)
  }, [])

  useEffect(() => {
    setSchedule(viewMode === 'week' ? {} : [])
    fetchSchedule()
  }, [profile.id, selectedDate, viewMode])

  async function fetchSchedule() {
    setLoading(true)
    try {
      let query = supabase
        .from('timetable_slots')
        .select('*, subjects(name, code)')
        .eq('branch', profile.branch)
        .eq('semester', profile.semester || 'Sem 4') 
        .eq('section', profile.section)
      
      if (viewMode === 'day') {
        const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })
        query = query.eq('day', dayName)
      }

      const { data, error } = await query.order('slot', { ascending: true })

      if (data) {
        if (viewMode === 'week') {
          const groupedByDay = data.reduce((acc, slot) => {
            if (!acc[slot.day]) acc[slot.day] = []
            acc[slot.day].push(slot)
            return acc
          }, {})
          
          // Apply lab grouping for each day
          const finalGrouped = {}
          Object.keys(groupedByDay).forEach(day => {
            finalGrouped[day] = groupSlots(groupedByDay[day])
          })
          setSchedule(finalGrouped)
        } else {
          setSchedule(groupSlots(data))
        }
      }
    } catch (err) {
      console.error("Schedule Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const renderSlotCard = (slot, i) => (
    <div key={i} className={`card-editorial p-4 flex flex-col gap-4 group active:scale-[0.98] ${slot.isGroup ? 'border-l-4 border-indigo-500 bg-indigo-50/20' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <p className="font-label text-[8px] font-black text-primary/40 uppercase tracking-[0.2em]">
            {slot.startTime} - {slot.endTime}
            {slot.isGroup && <span className="ml-2 text-indigo-400">({slot.slots.length} Periods)</span>}
          </p>
          <h3 className="font-headline font-black text-on-surface text-base tracking-tight leading-tight uppercase line-clamp-1">{slot.subjects?.name}</h3>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${slot.type?.toLowerCase() === 'lab' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'bg-teal-50 text-teal-600'}`}>
          {slot.type || 'Lecture'}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-surface-container-low">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border border-outline-variant/10 shadow-inner ${slot.isGroup ? 'bg-indigo-500 text-white' : 'bg-surface-container-low text-primary'}`}>
                <span className="font-headline font-black text-xs">{slot.subjects?.name?.charAt(0)}</span>
            </div>
            <div>
                <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Faculty</p>
                <p className="text-[10px] font-bold text-primary">DR. V. SHARMA</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Status</p>
            <p className="text-[10px] font-bold text-primary italic uppercase tracking-tighter">Scheduled</p>
          </div>
      </div>
    </div>
  )

  return (
    <div className="animate-in fade-in duration-700 h-full">
      {/* Ultra-Compact Schedule Header */}
      <section className="editorial-gradient pt-2 pb-3 px-5 -mx-4 shadow-ambient relative z-30">
        <div className="flex items-center justify-between mb-2">
          <span className="font-headline font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Planner</span>
          <div className="flex bg-white/5 p-0.5 rounded-full backdrop-blur-md border border-white/5">
            <button 
              onClick={() => setViewMode('day')}
              className={`px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${viewMode === 'day' ? 'bg-white text-primary shadow-sm' : 'text-white/40'}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-3 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-white text-primary shadow-sm' : 'text-white/40'}`}
            >
              Weekly
            </button>
          </div>
        </div>

        {/* Ultra-Compact Date Scroller */}
        {viewMode === 'day' && (
          <div 
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-2 items-end snap-x"
          >
            {dates.map((d, i) => (
              <button 
                key={i}
                ref={d.isToday ? todayRef : null}
                onClick={() => setSelectedDate(d.fullDate)}
                className={`snap-center flex flex-col items-center gap-0.5 min-w-[40px] transition-all duration-500 rounded-[1rem] py-2 ${selectedDate === d.fullDate ? 'bg-white text-primary px-3 shadow-2xl scale-110 z-10' : 'text-white/30 hover:text-white'}`}
              >
                <span className={`text-[6px] font-black uppercase tracking-[0.1em] ${selectedDate === d.fullDate ? 'text-primary' : 'text-white/30'}`}>{d.shortDay}</span>
                <span className={`text-sm font-black ${selectedDate === d.fullDate ? 'text-primary' : 'text-white'}`}>{d.dateNum}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Schedule Cards Area */}
      <section className="bg-surface min-h-screen px-4 pt-8 pb-32 -mt-4 rounded-t-[2rem] relative z-20 -mx-4">
        <div className="flex flex-col gap-8 max-w-xl mx-auto">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center opacity-40">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-black text-[10px] uppercase tracking-widest text-primary">Fetching schedule...</p>
             </div>
          ) : viewMode === 'day' ? (
            <div className="flex flex-col gap-4">
              <div className="px-1 flex justify-between items-center mb-1">
                 <p className="font-headline font-black text-primary text-[10px] uppercase tracking-[0.3em]">
                   {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                 </p>
              </div>
              {schedule.length === 0 ? (
                <div className="py-32 text-center text-on-surface-variant/30 italic flex flex-col items-center">
                  <span className="material-symbols-outlined text-5xl mb-4 opacity-20">event_busy</span>
                  <p className="font-headline font-bold uppercase tracking-widest text-xs">No academic activities</p>
                </div>
              ) : (
                Array.isArray(schedule) && schedule.map((slot, i) => renderSlotCard(slot, i))
              )}
            </div>
          ) : (
            /* Weekly View Mode (With Lab Grouping) */
            <div className="flex flex-col gap-10 animate-in fade-in duration-500">
              {DAYS_ORDER.map((day) => (
                <div key={day} className="space-y-4">
                  <div className="flex items-center gap-4 px-2">
                    <h3 className="font-headline font-black text-primary text-[10px] uppercase tracking-[0.3em]">{day}</h3>
                    <div className="flex-1 h-px bg-outline-variant/10"></div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {schedule[day]?.length > 0 ? (
                      schedule[day].map((slot, i) => renderSlotCard(slot, i))
                    ) : (
                      <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/20 italic px-4 py-2">No scheduled classes</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && ((viewMode === 'day' && schedule.length > 0) || (viewMode === 'week')) && (
             <div className="relative py-8 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-outline-variant/30"></div>
              </div>
              <div className="relative px-4 bg-surface-container-low text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/50">End of Session</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-x { scroll-snap-type: x mandatory; }
        .snap-center { scroll-snap-align: center; }
      `}} />
    </div>
  )
}
