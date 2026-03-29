import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";
import { FeedItem } from "@/src/types";

export default function Notices() {
  const [notices, setNotices] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'announcements'>('feed');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/feeds');
        if (!response.ok) throw new Error('Failed to fetch institutional notices');
        const data = await response.json();
        setNotices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching notices.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter(item => 
    activeTab === 'feed' ? item.type === 'feed' : item.type === 'announcement'
  );

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar title="Notices" />
      
      {/* Tabs Section from notices.html */}
      <div className="flex border-b border-outline-variant/15 bg-white/80 backdrop-blur-md sticky top-[72px] z-40">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'feed' ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          Institutional Feed
          {activeTab === 'feed' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 py-4 text-sm font-bold transition-all relative ${activeTab === 'announcements' ? 'text-primary' : 'text-on-surface-variant'}`}
        >
          Official Announcements
          {activeTab === 'announcements' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
        </button>
      </div>

      <main className="max-w-md mx-auto px-4 mt-6">
        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6 px-1">
          {['All', 'General', 'Academics', 'Events'].map((chip, i) => (
            <button 
              key={chip}
              className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-sm active:scale-95 transition-all ${
                i === 0 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-on-surface-variant mt-10 font-sans text-sm animate-pulse">Synchronizing with institutional server...</p>}
        {error && <p className="text-center text-error mt-10 font-bold">{error}</p>}

        {!loading && !error && filteredNotices.map((notice) => (
          <article 
            key={notice.id} 
            className={`bg-surface-container-lowest rounded-2xl p-5 mb-6 shadow-[0px_12px_32px_rgba(39,42,111,0.05)] border border-outline-variant/10 transition-all hover:shadow-lg ${notice.type === 'announcement' ? 'border-l-4 border-l-secondary' : ''}`}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-headline font-bold text-xl shadow-inner ${notice.type === 'announcement' ? 'bg-secondary-container text-on-secondary-container' : 'bg-primary-container text-on-primary-container'}`}>
                {notice.avatar}
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface leading-tight text-sm">{notice.author}</h3>
                <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-bold mt-0.5 opacity-60">{notice.timestamp}</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-5 px-1">
              <h2 className={`font-headline font-extrabold text-[#1b1e64] tracking-tight ${notice.type === 'announcement' ? 'text-lg' : 'text-xl'}`}>{notice.title}</h2>
              {notice.content && (
                <p className="text-on-surface-variant text-sm leading-relaxed opacity-90">
                  {notice.content}
                </p>
              )}
            </div>

            {/* Image Section */}
            {notice.image && (
              <div className="relative group rounded-xl overflow-hidden shadow-md">
                <img 
                  className={`w-full aspect-[16/10] object-cover transform transition-transform duration-700 group-hover:scale-110 ${notice.type === 'announcement' ? 'grayscale' : ''}`}
                  src={notice.image} 
                  alt={notice.title}
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Actions for Feed type */}
            {notice.type === 'feed' && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-outline-variant/5">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                    <span className="text-xs font-bold">{notice.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span className="text-xs font-bold">{notice.comments || 0}</span>
                  </button>
                </div>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            )}
          </article>
        ))}

        {!loading && filteredNotices.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-outline text-6xl opacity-20">campaign</span>
            <p className="text-on-surface-variant text-sm font-bold mt-4">No recent notices in this category.</p>
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
