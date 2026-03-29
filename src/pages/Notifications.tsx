import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";
import { Sidebar } from "@/src/components/Sidebar";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'alert' | 'success' | 'feed';
  timestamp: string;
  icon: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const pin = localStorage.getItem("student_pin") || "24295-AI-038";
        const res = await fetch(`/api/notifications?pin=${pin}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar onMenuClick={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 opacity-40 italic font-bold text-on-surface-variant">
            No recent activity to display.
          </div>
        ) : (
          <>
            {/* Section: Dynamic Alerts */}
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-on-surface-variant font-sans text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-40">System Activity</span>
                <div className="h-[1px] w-full bg-outline-variant/20"></div>
              </div>
              
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`bg-surface-container-lowest rounded-3xl p-6 shadow-[0px_12px_48px_rgba(39,42,111,0.03)] border border-outline-variant/5 transition-all hover:bg-primary-container/5 group ${notif.type === 'alert' ? 'border-l-4 border-l-red-500/50' : ''}`}
                >
                  <div className="flex gap-5">
                    <div className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:rotate-12",
                      notif.type === 'alert' ? 'bg-error-container/20 text-error' : 
                      notif.type === 'success' ? 'bg-teal-500/10 text-teal-600' : 'bg-primary-container/20 text-primary'
                    )}>
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{notif.icon}</span>
                    </div>
                    <div className="space-y-2 flex-grow">
                      <h3 className="font-headline font-black text-base text-[#1b1e64] leading-tight tracking-tight uppercase">
                        {notif.title}
                      </h3>
                      <p className="font-sans text-on-surface-variant text-sm leading-relaxed opacity-80">
                        {notif.content}
                      </p>
                      <div className="flex items-center gap-2 pt-2 opacity-30">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        <p className="font-sans text-[9px] font-black uppercase tracking-widest">{notif.timestamp}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Empty State / Decorative Illustration */}
            <div className="py-20 flex flex-col items-center opacity-40">
              <div className="w-24 h-24 rounded-[2rem] bg-surface-container-low flex items-center justify-center mb-6 shadow-inner border border-outline-variant/10">
                <span className="material-symbols-outlined text-4xl">notifications_paused</span>
              </div>
              <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em]">End of Transcript</p>
            </div>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
