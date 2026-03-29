import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StudentChatList({ profile, onSelectRoom }) {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchRooms()
  }, [])

  async function fetchRooms() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('chat_rooms')
        .select('*, subjects(name)')
        .or(`branch.eq.${profile.branch},branch.eq.ALL`)
      setRooms(data || [])
    } catch (err) {
      console.error("Chat Rooms Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const filteredRooms = rooms.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'groups') return r.subject_id !== null;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium">Connecting to Nexus Social...</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header & Search */}
      <div className="py-4 space-y-4">
        <h1 className="font-headline font-bold text-xl text-primary px-1">Messages</h1>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">search</span>
          <input 
            type="text" 
            placeholder="Search groups or classmates..." 
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline-variant/60 focus:ring-2 focus:ring-primary/20 transition-all font-body outline-none"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-6 hide-scrollbar">
        {['all', 'groups', 'direct', 'unread'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-full font-label text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-primary text-white shadow-lg' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Chat List */}
      <div className="space-y-1">
        {filteredRooms.map((room, i) => (
          <div 
            key={room.id} 
            onClick={() => onSelectRoom && onSelectRoom(room)}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-all cursor-pointer active:scale-[0.98] group"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${i % 3 === 0 ? 'bg-primary/10 text-primary' : i % 3 === 1 ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-container text-on-tertiary-container'}`}>
              <span className="font-headline font-bold text-xl">{getInitials(room.name)}</span>
            </div>
            <div className="flex-1 min-w-0 border-b border-outline-variant/5 pb-4 group-last:border-none">
              <div className="flex justify-between items-start mb-0.5">
                <h3 className="font-headline font-bold text-on-surface truncate pr-2">{room.name}</h3>
                <span className="text-[10px] font-bold text-on-surface-variant/50">12:45 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-on-surface-variant truncate opacity-70">New study materials have been posted in the main group...</p>
                {i < 2 && (
                  <div className="w-5 h-5 bg-error rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ml-2">3</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRooms.length === 0 && (
          <div className="py-20 text-center opacity-30 flex flex-col items-center">
            <span className="material-symbols-outlined text-5xl mb-2">forum</span>
            <p className="font-bold">No active conversations</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
