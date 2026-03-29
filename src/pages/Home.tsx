import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";
import { Sidebar } from "@/src/components/Sidebar";
import { Link } from "react-router-dom";
import { Notice } from "@/src/types";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'alert' | 'success' | 'feed';
  timestamp: string;
  icon: string;
}

interface HomeData {
  studentName: string;
  currentDate: string;
  attendance: string;
  feesDue: string;
  upcomingEvents: string;
  campusClubs: string;
  libraryPick: {
    title: string;
    status: string;
    image: string;
  };
  notices: Notice[];
  notifications?: Notification[];
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const studentPin = localStorage.getItem("student_pin") || "24295-AI-038";
        
        // Parallel fetching for dashboard performance
        const [homeRes, notifRes] = await Promise.all([
          fetch(`/api/home?pin=${studentPin}`),
          fetch(`/api/notifications?pin=${studentPin}`)
        ]);

        if (homeRes.ok && notifRes.ok) {
          const homeJson = await homeRes.json();
          const notifJson = await notifRes.json();
          setData({ ...homeJson, notifications: notifJson.slice(0, 3) }); // Top 3 alerts
        }
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-on-surface-variant font-black text-xs uppercase tracking-widest">Nexus GIET Loading...</p>
      </div>
    );
  }

  // Fallback default structure if nothing loaded
  const displayData = data || {
    studentName: "Scholar Name",
    currentDate: "Good Evening",
    attendance: "-",
    feesDue: "-",
    upcomingEvents: "-",
    campusClubs: "-",
    libraryPick: { title: "Nexus Library", status: "Closed", image: "https://images.unsplash.com/photo-1541339907198-e08759df9a13?auto=format&fit=crop&q=80&w=800" },
    notices: [],
    notifications: []
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="max-w-xl mx-auto px-6 pt-8 pb-32 space-y-8 safe-px">
        {/* Greeting Section */}
        <section className="bg-surface-container-lowest rounded-xl editorial-shadow p-6 space-y-4">
          <div className="space-y-1">
            <h1 className="font-headline font-bold text-2xl text-on-surface truncate">Hi {displayData.studentName},</h1>
            <p className="font-sans text-on-surface-variant text-sm opacity-70">{displayData.currentDate}</p>
          </div>
          <div className="h-px bg-surface-container w-full" />
          <Link to="/schedule" className="flex justify-between items-center group py-2">
            <span className="font-headline font-bold text-primary text-sm uppercase tracking-tight">View Schedule</span>
            <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">chevron_right</span>
          </Link>
        </section>

        {/* Essentials Section */}
        <section className="space-y-4">
          <h2 className="font-sans text-[10px] tracking-[0.2em] font-black text-on-surface-variant px-1 uppercase opacity-40">ESSENTIALS</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Card 1: Attendance */}
            <Link to="/attendance" className="bg-[#E8F5E9] rounded-[2rem] p-5 flex flex-col justify-between aspect-square editorial-shadow hover:scale-[1.02] transition-transform group">
              <div className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-green-800" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-on-surface text-base uppercase tracking-tight">Attendance</h3>
                <p className="font-sans font-black text-green-900/60 text-xs mt-1">{displayData.attendance}</p>
              </div>
            </Link>

            {/* Card 2: Fee Payments */}
            <div className="bg-[#FCE4EC] rounded-[2rem] p-5 flex flex-col justify-between aspect-square editorial-shadow group">
              <div className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-pink-800" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-on-surface text-base uppercase tracking-tight">Fee Payments</h3>
                <p className="font-sans font-black text-pink-900/60 text-xs mt-1 truncate">{displayData.feesDue}</p>
              </div>
            </div>

            {/* Card 3: Campus Events */}
            <div className="bg-[#EDE7F6] rounded-[2rem] p-5 flex flex-col justify-between aspect-square editorial-shadow group">
              <div className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-purple-800" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-on-surface text-base uppercase tracking-tight">Campus Events</h3>
                <p className="font-sans font-black text-purple-900/60 text-xs mt-1">{displayData.upcomingEvents}</p>
              </div>
            </div>

            {/* Card 4: Campus Clubs */}
            <div className="bg-[#E0F7FA] rounded-[2rem] p-5 flex flex-col justify-between aspect-square editorial-shadow group">
              <div className="w-10 h-10 bg-white/50 rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:bg-white transition-colors">
                <span className="material-symbols-outlined text-cyan-800" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <div>
                <h3 className="font-headline font-black text-on-surface text-base uppercase tracking-tight">Campus Clubs</h3>
                <p className="font-sans font-black text-cyan-900/60 text-xs mt-1">{displayData.campusClubs}</p>
              </div>
            </div>
          </div>
        </section>

        {/* System Activity (Notifications) Section */}
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-end px-1">
            <h2 className="font-sans text-[10px] tracking-[0.2em] font-black text-on-surface-variant uppercase opacity-40">SYSTEM ACTIVITY</h2>
            <Link to="/notifications" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Recent Alarms</Link>
          </div>
          
          <div className="space-y-3">
            {displayData.notifications && displayData.notifications.length > 0 ? (
              displayData.notifications.map((notif) => (
                <div key={notif.id} className="bg-surface-container-lowest p-5 rounded-[2rem] border border-outline-variant/10 flex gap-5 items-center editorial-shadow transition-transform hover:scale-[1.01]">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    notif.type === 'alert' ? 'bg-red-50 text-red-600' : 
                    notif.type === 'success' ? 'bg-teal-50 text-teal-600' : 'bg-[#1b1e64]/5 text-[#1b1e64]'
                  }`}>
                    <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{notif.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-black text-[#1b1e64] text-sm uppercase tracking-tight truncate">{notif.title}</h3>
                    <p className="font-sans text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.15em] mt-1">{notif.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-surface-container-low rounded-[2rem] border-2 border-dashed border-outline-variant/10">
                <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em]">Static Environment • No Hub Activity</p>
              </div>
            )}
          </div>
        </section>

        {/* Global Library Pick Section */}
        <section className="space-y-4">
          <h2 className="font-sans text-[10px] tracking-[0.2em] font-black text-on-surface-variant px-1 uppercase opacity-40">COMMUNITY PICK</h2>
          <div className="bg-surface-container-lowest rounded-[2.5rem] overflow-hidden editorial-shadow border border-outline-variant/5">
            <div className="h-40 relative">
              <img src={displayData.libraryPick.image} className="w-full h-full object-cover" alt="Library Pick" />
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
                <p className="text-white text-[10px] font-black uppercase tracking-widest">{displayData.libraryPick.status}</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-headline font-bold text-lg text-on-surface leading-snug">{displayData.libraryPick.title}</h3>
              <p className="font-sans text-on-surface-variant text-xs mt-2 opacity-60">Handpicked for your academic branch.</p>
            </div>
          </div>
        </section>

        {/* Recent Notices Section */}
        <section className="space-y-4 pt-2">
          <div className="flex justify-between items-end px-1">
            <h2 className="font-sans text-[10px] tracking-[0.2em] font-black text-on-surface-variant uppercase opacity-40">INSTITUTIONAL FEED</h2>
            <Link to="/notices" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">View Loop</Link>
          </div>
          
          <div className="space-y-3">
            {displayData.notices.length > 0 ? (
              displayData.notices.map((notice) => (
                <article key={notice.id} className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 flex gap-4 items-center editorial-shadow transition-transform hover:scale-[1.01] cursor-pointer">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${notice.urgent ? 'bg-error text-white shadow-xl shadow-error/30' : 'bg-primary-container text-on-primary-container'}`}>
                    <span className="material-symbols-outlined">{notice.urgent ? 'campaign' : 'description'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-on-surface text-sm truncate uppercase tracking-tight">{notice.title}</h3>
                    <p className="font-sans text-[9px] font-black text-on-surface-variant/40 mt-1 uppercase tracking-widest">{notice.date}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-xs text-on-surface-variant/30 font-black text-center py-10 uppercase tracking-[0.2em]">Synchronized • No Announcements</p>
            )}
          </div>
        </section>

      </main>

      <BottomNavBar />
    </div>
  );
}
