import { useState, useEffect, useRef } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";
import { Sidebar } from "@/src/components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";

interface Slot {
  id: string;
  day: string;
  slot: number;
  start_time: string;
  end_time: string;
  room: string;
  subjects: {
    name: string;
    code: string;
    credits: number;
  };
}

export default function Schedule() {
  const [allSlots, setAllSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate all semester dates from March 1st to June 30th, 2026
  const getSemesterDates = () => {
    const dates = [];
    const start = new Date(2026, 2, 1); // March 1st
    const end = new Date(2026, 5, 30);   // June 30th
    
    let curr = new Date(start);
    while (curr <= end) {
      dates.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const semesterDates = getSemesterDates();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const pin = localStorage.getItem("student_pin") || "24295-AI-038";
        const res = await fetch(`/api/schedule?pin=${pin}`);
        if (res.ok) {
          const data = await res.json();
          setAllSlots(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();

    // Scroll to today's date after a short delay
    setTimeout(() => {
      const todayEl = document.getElementById('today-date');
      if (todayEl) {
        todayEl.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }, 500);

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper for robust day matching (handles Mon, mn, Monday, etc.)
  const isDayMatch = (selected: Date, slotDay: string) => {
    if (!slotDay) return false;
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const abbreviated = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    const dayIndex = selected.getDay();
    const full = weekdayNames[dayIndex].toLowerCase();
    const abbr = abbreviated[dayIndex].toLowerCase();
    const target = slotDay.toLowerCase().trim();

    return target === full || target === abbr || target === String(dayIndex);
  };

  const filteredSlots = allSlots.filter(s => isDayMatch(selectedDate, s.day));

  const isPeriodActive = (start: string, end: string) => {
    // Only highlight if it's actually today
    if (selectedDate.toDateString() !== new Date().toDateString()) return false;
    
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const parseTime = (timeStr: string) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    try {
      const startTime = parseTime(start);
      const endTime = parseTime(end);
      return now >= startTime && now < endTime;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      <TopAppBar onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main>
        {/* Schedule Header Section */}
        <section className="bg-[#1b1e64] pt-6 pb-20 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-4 text-white">
              <button 
                onClick={() => window.history.back()}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all font-bold"
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </button>
              <div>
                <h2 className="font-headline font-black text-2xl tracking-tight uppercase leading-none">TIMETABLE</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1 italic leading-none">Institutional Flow</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white bg-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-xl">
              <span className="material-symbols-outlined text-sm text-[#EFBE33]">calendar_today</span>
              <span className="font-sans text-[11px] font-black uppercase tracking-widest whitespace-nowrap">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Movable Semester Calendar Strip */}
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-2 pb-2 relative z-10"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {semesterDates.map(date => {
              const isActive = selectedDate.toDateString() === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              const isSunday = date.getDay() === 0;
              
              return (
                <button 
                  key={date.toISOString()}
                  id={isToday ? 'today-date' : undefined}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center shrink-0 transition-all duration-300 relative ${isActive ? 'pb-2' : 'pb-4'}`}
                >
                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] mb-3 px-2 py-0.5 rounded-md transition-all ${isActive ? 'text-[#EFBE33] bg-white/10' : 'text-white/30'}`}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className={`w-14 h-16 rounded-[1.25rem] flex flex-col items-center justify-center transition-all ${isActive ? 'bg-white shadow-[0px_10px_30px_rgba(39,42,111,0.4)] scale-110' : 'text-white/40 hover:bg-white/5'}`}>
                    <span className={`text-xl font-black leading-none ${isActive ? 'text-[#1b1e64]' : ''}`}>{date.getDate()}</span>
                    {isToday && !isActive && <div className="w-1 h-1 rounded-full bg-[#EFBE33] mt-1.5" />}
                  </div>
                  {isActive && (
                    <motion.div 
                      layoutId="activeDateUnderline"
                      className="w-1.5 h-1.5 rounded-full bg-[#EFBE33] absolute bottom-1 shadow-[0_0_10px_rgba(239,190,51,0.5)]" 
                    />
                  )}
                  {isSunday && !isActive && (
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full border-2 border-red-500/30" title="Holiday" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Schedule Cards Area */}
        <section className="bg-[#f8fafc] min-h-[50vh] px-6 pt-12 pb-20 -mt-8 rounded-t-[3rem] shadow-[-20px_0_40px_rgba(0,0,0,0.05)] relative z-20">
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24"
                >
                  <div className="w-10 h-10 border-4 border-[#1b1e64]/10 border-t-[#1b1e64] rounded-full animate-spin" />
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-[#1b1e64]/30">Synchronizing Slots...</p>
                </motion.div>
              ) : selectedDate.getDay() === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-[#1b1e64]/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20" />
                  <span className="material-symbols-outlined text-5xl text-[#EFBE33] mb-6 block relative z-10">hotel</span>
                  <h3 className="font-headline font-black text-[#1b1e64] text-xl tracking-tight uppercase relative z-10">Institutional Recharge Day</h3>
                  <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest mt-4 opacity-40 leading-relaxed relative z-10">
                    Sundays are for relaxation.<br/>Your next academic session begins Monday.
                  </p>
                </motion.div>
              ) : filteredSlots.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24 bg-white/50 rounded-[2.5rem] border border-dashed border-[#1b1e64]/10"
                >
                  <span className="material-symbols-outlined text-4xl text-[#1b1e64]/10 mb-4">event_busy</span>
                  <p className="font-headline font-bold text-[#1b1e64]/30 text-sm uppercase tracking-widest">No Classes Scheduled</p>
                </motion.div>
              ) : (
                filteredSlots.map((slot, index) => {
                  const isActive = isPeriodActive(slot.start_time, slot.end_time);
                  return (
                    <motion.div 
                      key={slot.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className={`group bg-white rounded-[2.5rem] flex relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#1b1e64]/5 ${isActive ? 'ring-4 ring-[#EFBE33]/40 shadow-2xl scale-[1.02]' : 'shadow-[0px_12px_48px_rgba(39,42,111,0.04)]'}`}
                    >
                      {isActive && <div className="absolute top-0 left-0 w-2 h-full bg-[#EFBE33] animate-pulse" />}

                      <div className="p-8 flex-1">
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2">
                             <span className={`material-symbols-outlined text-sm ${isActive ? 'text-[#EFBE33]' : 'text-slate-300'}`}>schedule</span>
                             <span className={`font-sans text-[11px] font-black tracking-[0.1em] uppercase ${isActive ? 'text-[#EFBE33]' : 'text-slate-400'}`}>
                               Slot {slot.slot} • {slot.start_time} - {slot.end_time}
                             </span>
                           </div>
                           {isActive && (
                             <span className="text-[9px] font-black text-white bg-[#EFBE33] px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-[#EFBE33]/30 animate-bounce">
                               LIVE NOW
                             </span>
                           )}
                        </div>

                        <h3 className={`font-headline font-black text-xl tracking-tight uppercase leading-tight mb-6 ${isActive ? 'text-[#1b1e64]' : 'text-[#1b1e64]/80'}`}>
                          {slot.subjects.name}
                        </h3>

                        <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#1b1e64]/5 transition-all text-[#1b1e64]/30">
                              <span className="material-symbols-outlined text-xl group-hover:text-[#1b1e64]">location_on</span>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Hall No.</p>
                                <p className="text-xs font-bold text-[#1b1e64]/60 uppercase tracking-tight">{slot.room}</p>
                            </div>
                          </div>
                          <div className="text-right">
                              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">Academic Weight</p>
                              <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest border transition-all ${isActive ? 'bg-[#1b1e64] text-white border-transparent' : 'text-[#1b1e64] bg-white border-[#1b1e64]/10 shadow-sm'}`}>
                                {slot.subjects.credits} Credits
                              </span>
                          </div>
                        </div>
                      </div>

                      <div className={`w-14 shrink-0 flex items-center justify-center p-2 relative ${slot.subjects.name.toLowerCase().includes('lab') ? 'bg-indigo-600' : 'bg-[#EFBE33]'}`}>
                        <span className="writing-mode-vertical-rl text-white font-headline font-black text-[10px] uppercase tracking-[0.4em] rotate-180 opacity-80 group-hover:opacity-100 transition-all">
                          {slot.subjects.name.toLowerCase().includes('lab') ? 'LOGIC LAB' : 'THEORY'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}
