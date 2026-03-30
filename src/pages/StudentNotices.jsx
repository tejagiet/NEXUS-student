import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StudentNotices({ profile }) {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('feed')
  const [activeCategory, setActiveCategory] = useState('General')

  const categories = ['General', 'Academics', 'Opportunities', 'Events']

  useEffect(() => {
    fetchNotices()
  }, [])

  async function fetchNotices() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('notices')
        .select('*, profiles(full_name, role)')
        .order('created_at', { ascending: false })
      
      if (data) setNotices(data)
    } catch (err) {
      console.error("Notices Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotices = notices.filter(n => {
    if (activeCategory !== 'All' && n.category !== activeCategory) {
       // If filtering by category, match it
       if (n.category !== activeCategory) return false;
    }
    
    // Role/Branch check
    if (n.target_role !== 'ALL' && n.target_role !== 'student') return false
    if (n.target_branch !== 'ALL' && n.target_branch !== profile.branch) return false
    
    return true
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium">Fetching latest updates...</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Tabs */}
      <header className="sticky top-0 glass-header z-30 -mx-4 pt-4 pb-1">
        <div className="px-5 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-headline font-black text-2xl text-primary tracking-tighter uppercase leading-none">Bulletin</h1>
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary transition-all">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            </div>
          </div>
          <div className="flex border-b border-outline-variant/5">
            {['feed', 'announcements'].map(t => (
              <button 
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.3em] relative transition-all ${activeTab === t ? 'text-primary' : 'text-on-surface-variant/40'}`}
              >
                {t}
                {activeTab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_-4px_12px_rgba(85,88,159,0.3)]"></div>}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Filter Chips */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-6 px-1">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-[8.5px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap active:scale-95 ${activeCategory === cat ? 'bg-primary text-white shadow-ambient' : 'bg-surface-container-low text-on-surface-variant/50 hover:bg-surface-container-high'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-6 px-1">
        {filteredNotices.map((n, i) => (
          <article key={n.id} className="card-editorial p-5 animate-in fade-in slide-in-from-bottom-6 transition-all group">
            {/* Author Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-headline font-black text-lg shadow-inner border border-primary/5">
                {n.profiles?.full_name?.[0] || 'N'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-primary/40 text-[8px] font-black uppercase tracking-[0.2em] mb-0.5">Board Official</p>
                <h3 className="font-headline font-black text-on-surface leading-none text-sm truncate uppercase tracking-tight">{n.profiles?.full_name}</h3>
                <p className="text-on-surface-variant/40 text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">
                   {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
              <button className="w-8 h-8 rounded-full flex items-center justify-center text-outline-variant hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 mb-6">
              <h2 className="font-headline text-xl font-black text-primary leading-tight tracking-tighter uppercase">{n.title}</h2>
              <p className="text-on-surface-variant text-[13px] font-medium leading-relaxed opacity-70">
                {n.content}
              </p>
            </div>

            {/* Editorial Image */}
            {i % 2 === 0 && (
               <div className="aspect-[16/10] w-full overflow-hidden rounded-[1.5rem] bg-surface-container-low mb-6 shadow-ambient group-hover:scale-[1.01] transition-transform duration-700">
                  <img 
                    src={`https://picsum.photos/seed/${n.id}/800/500`} 
                    alt="Notice banner" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" 
                  />
               </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-surface-container-low">
              <div className="flex items-center gap-8">
                <button className="flex items-center gap-2 text-on-surface-variant/40 hover:text-error transition-all hover:scale-105 active:scale-90 group-actions">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{10 + (i * 5)}</span>
                </button>
                <button className="flex items-center gap-2 text-on-surface-variant/40 hover:text-primary transition-all hover:scale-105 active:scale-90 group-actions">
                  <span className="material-symbols-outlined text-[20px]">mode_comment</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">{2 + (i * 2)}</span>
                </button>
              </div>
              <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary/30 hover:bg-primary/5 transition-all">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
            </div>
          </article>
        ))}

        {filteredNotices.length === 0 && (
          <div className="py-24 text-center space-y-4 opacity-30 flex flex-col items-center">
             <span className="material-symbols-outlined text-6xl">campaign</span>
             <p className="font-headline font-bold text-lg px-8">No specific notices for {activeCategory} right now.</p>
          </div>
        )}
      </div>

      {/* FAB (Floating Action Button) */}
      <button className="fixed bottom-32 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-ambient flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border border-white/20">
        <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_comment</span>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
