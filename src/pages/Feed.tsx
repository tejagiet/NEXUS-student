import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";
import { FeedItem } from "@/src/types";

export default function Feed() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const response = await fetch('/api/feeds');
        if (!response.ok) throw new Error('Failed to fetch feeds');
        const data = await response.json();
        setFeeds(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching feeds.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar />
      
      {/* Tabs Section */}
      <div className="flex border-b border-outline-variant/15 bg-white/80 backdrop-blur-md sticky top-[72px] z-40">
        <button className="flex-1 py-3 text-sm font-semibold text-error relative group">
          Feed
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-error rounded-t-full" />
        </button>
        <button className="flex-1 py-3 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
          Announcements
        </button>
      </div>

      <main className="max-w-md mx-auto px-4 mt-6">
        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-6">
          {['General', 'Academics', 'Opportunities', 'Events'].map((chip, i) => (
            <button 
              key={chip}
              className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap shadow-sm active:scale-95 transition-transform ${
                i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-on-surface-variant mt-10">Loading feeds from server...</p>}
        {error && <p className="text-center text-error mt-10">{error}</p>}

        {!loading && !error && feeds.map((feed) => (
          <article 
            key={feed.id} 
            className={`bg-surface-container-lowest rounded-xl p-5 mb-6 shadow-[0px_12px_32px_rgba(39,42,111,0.06)] border border-outline-variant/10 ${feed.type === 'announcement' ? 'opacity-90' : ''}`}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-headline font-bold text-xl ${feed.type === 'announcement' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                {feed.avatar}
              </div>
              <div>
                <h3 className="font-headline font-bold text-on-surface leading-tight">{feed.author}</h3>
                <p className="text-on-surface-variant text-xs mt-0.5">{feed.timestamp}</p>
              </div>
              {feed.type !== 'announcement' && (
                <button className="ml-auto text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              )}
            </div>

            {/* Content */}
            <div className="space-y-3 mb-5">
              <h2 className={`font-headline font-bold text-on-surface tracking-tight ${feed.type === 'announcement' ? 'text-lg mb-2' : 'text-xl font-extrabold text-[#1b1e64]'}`}>{feed.title}</h2>
              {feed.content && (
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {feed.content}
                </p>
              )}
            </div>

            {/* Image Section */}
            {feed.image && (
              <div className="relative group">
                <div className={`w-full overflow-hidden rounded-lg ${feed.type === 'announcement' ? 'h-32 bg-surface-container-low flex items-center justify-center' : 'aspect-[16/10]'}`}>
                  <img 
                    className={`w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 ${feed.type === 'announcement' ? 'grayscale' : ''}`}
                    src={feed.image} 
                    alt={feed.title}
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Pagination Dots */}
                {feed.type === 'feed' && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    <div className="w-2 h-2 rounded-full bg-white/40 shadow-sm" />
                    <div className="w-2 h-2 rounded-full bg-white/40 shadow-sm" />
                  </div>
                )}
              </div>
            )}

            {/* Card Actions */}
            {feed.type === 'feed' && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-outline-variant/10">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">favorite</span>
                    <span className="text-xs font-semibold">{feed.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span className="text-xs font-semibold">{feed.comments || 0}</span>
                  </button>
                </div>
                <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">share</span>
                </button>
              </div>
            )}
          </article>
        ))}
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined">edit</span>
      </button>

      <BottomNavBar />
    </div>
  );
}
