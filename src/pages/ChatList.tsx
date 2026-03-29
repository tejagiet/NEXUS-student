import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";
import { Link } from "react-router-dom";

interface ChatRoom {
  id: string;
  title: string;
  type: string;
  lastMessage: string;
  time: string;
  initials: string;
}

export default function ChatList() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const pin = localStorage.getItem("student_pin") || "24295-AI-038";
        const response = await fetch(`/api/chats?pin=${pin}`);
        if (!response.ok) throw new Error("Failed to fetch conversations");
        const data = await response.json();
        setRooms(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar />
      
      <main className="max-w-2xl mx-auto px-6 pt-6 pb-32">
        {/* Editorial Header Section */}
        <section className="mb-8">
          <p className="text-on-surface-variant font-medium text-sm mb-1 uppercase tracking-widest opacity-60">Communications</p>
          <h2 className="font-headline text-3xl font-black text-[#1b1e64] tracking-tight">Active Channels</h2>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-outline text-5xl mb-4 opacity-20">chat_bubble</span>
            <p className="text-on-surface-variant font-bold">No active conversations found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((chat) => (
              <Link 
                key={chat.id}
                to={`/chats/${chat.id}`}
                className="bg-surface-container-lowest p-6 rounded-3xl flex items-center gap-5 shadow-[0px_12px_32px_rgba(39,42,111,0.03)] border border-outline-variant/5 hover:bg-surface-container-low transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner bg-primary/10`}>
                  <span className="font-headline font-black text-primary text-xl tracking-tighter">{chat.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-headline font-black text-[#272A6F] truncate pr-2 group-hover:text-primary transition-colors">{chat.title}</h3>
                    <span className="text-[10px] font-black text-on-surface-variant/40 flex-shrink-0 uppercase tracking-tighter">{chat.time}</span>
                  </div>
                  <p className="text-sm truncate text-on-surface-variant/80 font-medium">
                    {chat.lastMessage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <button className="fixed bottom-28 right-6 w-16 h-16 bg-[#1b1e64] text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 border border-white/10">
          <span className="material-symbols-outlined text-3xl">add_comment</span>
        </button>
      </main>

      <BottomNavBar />
    </div>
  );
}
