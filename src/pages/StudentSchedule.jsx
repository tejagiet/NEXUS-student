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

const DAYS_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function StudentSchedule({ profile }) {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('day') // 'day' or 'week'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dates, setDates] = useState([])
  const [calendarEvents, setCalendarEvents] = useState({})
  const [selectedItem, setSelectedItem] = useState(null)
  
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
    fetchCalendar(generated[0].fullDate, generated[generated.length-1].fullDate)

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
  }, [profile.id, selectedDate, viewMode, profile.branch, profile.section, profile.semester])

  async function fetchCalendar(start, end) {
    try {
      const { data } = await supabase
        .from('academic_calendar')
        .select('*')
        .gte('date', start)
        .lte('date', end)
      
      if (data) {
        const mapped = data.reduce((acc, curr) => {
          acc[curr.date] = curr
          return acc
        }, {})
        setCalendarEvents(mapped)
      }
    } catch (err) {
      console.error("Calendar Fetch Error:", err)
    }
  }

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
    <div 
      key={i} 
      onClick={() => setSelectedItem({ ...slot, modalType: 'class' })}
      className={`card-editorial p-4 flex flex-col gap-4 group active:scale-[0.98] cursor-pointer ${slot.isGroup ? 'border-l-4 border-indigo-500 bg-indigo-50/20' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <p className="font-label text-[8px] font-black text-primary/40 uppercase tracking-[0.2em]">
            {slot.startTime} - {slot.endTime}
            {slot.isGroup && <span className="ml-2 text-indigo-400">({slot.slots.length} Periods)</span>}
          </p>
          <h3 className="font-headline font-black text-on-surface text-base tracking-tight leading-tight uppercase line-clamp-1 group-hover:text-primary transition-colors">{slot.subjects?.name}</h3>
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

  const renderStatusCard = () => {
    const event = calendarEvents[selectedDate]
    if (!event || event.type === 'academic_day') return null

    const colors = {
      holiday: 'bg-red-500 text-white',
      event: 'bg-blue-600 text-white',
      exam: 'bg-amber-500 text-white'
    }

    const icons = {
      holiday: 'hotel_class',
      event: 'campaign',
      exam: 'history_edu'
    }

    return (
      <div 
        onClick={() => setSelectedItem({ ...event, modalType: 'event' })}
        className={`${colors[event.type]} p-5 rounded-[2.5rem] shadow-xl flex items-center gap-6 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all mb-4 relative overflow-hidden group`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <span className="material-symbols-outlined text-7xl font-black">{icons[event.type]}</span>
        </div>
        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-2xl font-black">{icons[event.type]}</span>
        </div>
        <div className="flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">{event.type}</p>
          <h3 className="font-headline font-black text-lg tracking-tight leading-tight uppercase">{event.title}</h3>
          <p className="text-[10px] opacity-70 font-bold mt-1 line-clamp-1">{event.description || 'Institutional Special Day'}</p>
        </div>
        <span className="material-symbols-outlined text-white/40">arrow_forward_ios</span>
      </div>
    )
  }

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
            {dates.map((d, i) => {
              const hasEvent = calendarEvents[d.fullDate] && calendarEvents[d.fullDate].type !== 'academic_day'
              const eventType = calendarEvents[d.fullDate]?.type
              return (
                <button 
                  key={i}
                  ref={d.isToday ? todayRef : null}
                  onClick={() => setSelectedDate(d.fullDate)}
                  className={`snap-center flex flex-col items-center gap-0.5 min-w-[40px] transition-all duration-500 rounded-[1rem] py-2 ${selectedDate === d.fullDate ? 'bg-white text-primary px-3 shadow-2xl scale-110 z-10' : 'text-white/30 hover:text-white'}`}
                >
                  <span className={`text-[6px] font-black uppercase tracking-[0.1em] ${selectedDate === d.fullDate ? 'text-primary' : 'text-white/30'}`}>{d.shortDay}</span>
                  <span className={`text-sm font-black ${selectedDate === d.fullDate ? 'text-primary' : 'text-white'}`}>{d.dateNum}</span>
                  {hasEvent && (
                    <div className={`w-1 h-1 rounded-full mt-0.5 ${eventType === 'holiday' ? 'bg-red-500' : eventType === 'exam' ? 'bg-amber-500' : 'bg-blue-400'}`} />
                  )}
                </button>
              )
            })}
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
              
              {renderStatusCard()}

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

      {/* Interactive Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-xl" onClick={() => setSelectedItem(null)}></div>
          
          <div className="bg-surface-container-lowest w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className={`p-8 ${selectedItem.modalType === 'event' ? (selectedItem.type === 'holiday' ? 'bg-red-500' : selectedItem.type === 'exam' ? 'bg-amber-500' : 'bg-blue-600') : 'bg-primary'} text-white`}>
              <div className="flex justify-between items-start mb-6">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <span className="material-symbols-outlined text-2xl font-black">
                    {selectedItem.modalType === 'event' ? 
                      (selectedItem.type === 'holiday' ? 'hotel_class' : selectedItem.type === 'exam' ? 'history_edu' : 'campaign') :
                      'event_seat'}
                  </span>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors active:scale-90">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">
                {selectedItem.modalType === 'event' ? selectedItem.type : 'Faculty Lecture'}
              </p>
              <h2 className="font-headline font-black text-3xl tracking-tight leading-tight uppercase">
                {selectedItem.modalType === 'event' ? selectedItem.title : selectedItem.subjects?.name}
              </h2>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-8 flex-1">
              {selectedItem.modalType === 'event' ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#272A6F]/40 mb-2">Description</p>
                    <p className="text-on-surface-variant font-bold leading-relaxed">{selectedItem.description || 'Standard institutional special day observed as per GIET academic policy.'}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl">
                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">{new Date(selectedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#272A6F]/40 mb-1">Time Window</p>
                      <p className="text-sm font-black text-[#1b1e64]">{selectedItem.startTime} - {selectedItem.endTime}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#272A6F]/40 mb-1">Facility</p>
                      <p className="text-sm font-black text-[#1b1e64]">{selectedItem.room || 'Main Block'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#272A6F]/40 mb-3">Academic Context</p>
                    <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">account_circle</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-tight">DR. V. SHARMA</p>
                        <p className="text-[9px] font-bold text-on-surface-variant opacity-60">Senior Faculty Associate</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-center">
                    <span className="bg-teal-500/10 text-teal-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Session Live</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 pt-0">
               <button 
                onClick={() => setSelectedItem(null)}
                className="w-full bg-[#1b1e64] text-white py-5 rounded-2xl font-headline font-black text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all"
               >
                 Close Detail
               </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .snap-x { scroll-snap-type: x mandatory; }
        .snap-center { scroll-snap-align: center; }
      `}} />
    </div>
  )
}
