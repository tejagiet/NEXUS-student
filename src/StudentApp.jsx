import React, { useState } from 'react'
import StudentHome from './pages/StudentHome'
import StudentAttendance from './pages/StudentAttendance'
import StudentSchedule from './pages/StudentSchedule'
import StudentAcademics from './pages/StudentAcademics'
import StudentChatList from './pages/StudentChatList'
import StudentChatRoom from './pages/StudentChatRoom'
import StudentNotices from './pages/StudentNotices'
import StudentProfile from './pages/StudentProfile'
import FinancePortal from './components/FinancePortal'
import AcademicCalendar from './components/AcademicCalendar'
import { supabase } from './lib/supabase'

export default function StudentApp({ profile, session }) {
  const [activeTab, setActiveTab] = useState('home')
  const [activeRoom, setActiveRoom] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <StudentHome profile={profile} setTab={setActiveTab} />
      case 'attendance': return <StudentAttendance profile={profile} />
      case 'schedule': return <StudentSchedule profile={profile} />
      case 'academics': return <StudentAcademics profile={profile} />
      case 'chat': return <StudentChatList profile={profile} onSelectRoom={(room) => setActiveRoom(room)} />
      case 'notices': return <StudentNotices profile={profile} />
      case 'profile': return <StudentProfile profile={profile} session={session} />
      case 'fees': return <FinancePortal profile={profile} />
      case 'calendar': return <AcademicCalendar profile={profile} />
      default: return <StudentHome profile={profile} setTab={setActiveTab} />
    }
  }

  const navItems = [
    { id: 'home', icon: 'grid_view', label: 'Home' },
    { id: 'schedule', icon: 'calendar_today', label: 'Schedule' },
    { id: 'academics', icon: 'menu_book', label: 'LMS' },
    { id: 'notices', icon: 'campaign', label: 'Notices' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased pb-24 selection:bg-primary/10 selection:text-primary">
      {/* Top App Bar */}
      <header className="glass-header">
        <div className="flex justify-between items-center w-full px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="hover:bg-primary/5 transition-colors p-2 rounded-full active:scale-95"
            >
              <img src="/logo.png" alt="Nexus Logo" className="w-8 h-8 object-contain rounded-lg" />
            </button>
            <h1 className="font-headline font-black text-xl tracking-tight text-primary">NEXUS Student</h1>
          </div>
          <div className="flex items-center gap-2">
             <button 
                onClick={() => setActiveTab('chat')}
                className={`p-2 rounded-full transition-all active:scale-90 relative ${activeTab === 'chat' ? 'bg-primary text-white shadow-ambient' : 'text-primary hover:bg-primary/5'}`}
             >
                <span className="material-symbols-outlined">chat_bubble</span>
                {/* Notification dot */}
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-white"></div>
             </button>
             <div className="w-10 h-10 rounded-2xl overflow-hidden border border-outline-variant/10 shadow-ambient bg-surface-container-lowest flex items-center justify-center">
                <span className="font-headline font-black text-primary text-sm">{profile?.full_name?.[0]}</span>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-4 pt-2">
        {renderPage()}
      </main>

      {/* Chat Room Overlay */}
      {activeRoom && (
        <StudentChatRoom 
          profile={profile} 
          room={activeRoom} 
          onBack={() => setActiveRoom(null)} 
        />
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 glass-nav rounded-t-[3rem]">
        {navItems.map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center transition-all duration-300 relative px-4 py-2 rounded-full ${activeTab === item.id ? 'bg-primary/10 text-primary scale-105' : 'text-on-surface-variant/40 hover:text-primary'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === item.id ? 'fill-1' : ''}`} style={{ fontVariationSettings: `'FILL' ${activeTab === item.id ? 1 : 0}` }}>
              {item.icon}
            </span>
            <span className={`font-headline text-[8px] font-black uppercase tracking-[0.2em] mt-1.5 ${activeTab === item.id ? 'opacity-100' : 'opacity-0 scale-50'}`}>
              {item.label}
            </span>
            {activeTab === item.id && (
               <div className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Drawer Simulation */}
      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300 shadow-2xl" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="fixed left-0 top-0 h-full w-[85%] max-w-[320px] bg-surface z-[110] shadow-2xl rounded-r-[3rem] p-8 animate-in slide-in-from-left duration-500 flex flex-col border-r border-outline-variant/5">
             <div className="flex items-center justify-between mb-10">
                <span className="font-headline font-black text-2xl text-primary">NEXUS</span>
                <button onClick={() => setIsDrawerOpen(false)} className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-full active:scale-90 transition-all">
                   <span className="material-symbols-outlined text-outline-variant text-[20px]">close</span>
                </button>
             </div>

             <div className="flex items-center gap-4 mb-10 p-5 bg-primary/5 rounded-[2rem] border border-primary/10 shadow-inner">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-primary/5">
                   <span className="font-headline font-black text-2xl text-primary">{profile?.full_name?.[0]}</span>
                </div>
                <div className="flex flex-col min-w-0">
                   <p className="font-headline font-bold text-primary text-base truncate pr-1">{profile?.full_name}</p>
                   <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">{profile?.branch} • SEM 4</p>
                </div>
             </div>

             <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                {[
                    { id: 'attendance', label: 'Attendance', icon: 'analytics' },
                    { id: 'academics', label: 'LMS Portal', icon: 'school' },
                    { id: 'fees', label: 'Fee Payments', icon: 'payments' },
                    { id: 'schedule', label: 'Daily Schedule', icon: 'calendar_month' },
                    { id: 'calendar', label: 'Academic Calendar', icon: 'event_available' },
                    { id: 'chat', label: 'Faculty Help', icon: 'contact_support' },
                    { id: 'profile', label: 'Settings', icon: 'settings' },
                 ].map(item => (
                   <button 
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); setIsDrawerOpen(false); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                   >
                      <div className={`p-2 rounded-xl ${activeTab === item.id ? 'bg-white/20' : 'bg-surface-container'}`}>
                        <span className={`material-symbols-outlined text-[20px] ${activeTab === item.id ? 'fill-1' : ''}`}>{item.icon}</span>
                      </div>
                      <span className="font-headline font-bold text-sm tracking-tight">{item.label}</span>
                   </button>
                ))}
             </div>

             <div className="mt-8 space-y-4">
                <div className="p-6 bg-tertiary-container/20 rounded-[2rem] border border-tertiary-container/10">
                   <p className="text-[10px] font-black text-tertiary uppercase tracking-[0.2em] mb-2 opacity-60">Insight of the Day</p>
                   <p className="text-xs font-bold text-tertiary/80 leading-relaxed italic">"Excellence is not an act, but a habit."</p>
                </div>
                <button 
                   onClick={() => supabase.auth.signOut()}
                   className="w-full flex items-center gap-4 p-5 rounded-[2rem] text-error hover:bg-error/5 transition-all group active:scale-[0.98]"
                >
                   <div className="p-2 rounded-xl bg-error/10 group-hover:bg-error/20 transition-all">
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                   </div>
                   <span className="font-headline font-black text-sm uppercase tracking-widest">Sign Out</span>
                </button>
             </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .fill-1 { font-variation-settings: 'FILL' 1; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
