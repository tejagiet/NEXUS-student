import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function StudentChatRoom({ profile, room, onBack }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef()

  useEffect(() => {
    fetchMessages()
    const channel = supabase.channel(`room-${room.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${room.id}` }, 
        payload => {
          // Fetch the profile for the new message to get the name/role
          supabase.from('profiles').select('full_name, role').eq('id', payload.new.sender_id).single()
            .then(({ data }) => {
              setMessages(prev => [...prev, { ...payload.new, profiles: data }])
            })
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [room.id])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('chat_messages')
        .select('*, profiles(full_name, role)')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true })
      setMessages(data || [])
    } catch (err) {
      console.error("Messages Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim()) return
    const msg = { room_id: room.id, sender_id: profile.id, content: newMessage }
    setNewMessage('')
    const { error } = await supabase.from('chat_messages').insert(msg)
    if (error) alert(error.message)
  }

  return (
    <div className="fixed inset-0 z-[70] bg-surface flex flex-col animate-in slide-in-from-right duration-300">
      {/* Top App Bar */}
      <nav className="bg-white/80 backdrop-blur-md text-primary sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 shadow-[0px_12px_32px_rgba(39,42,111,0.06)]">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="material-symbols-outlined hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-90">arrow_back</button>
          <div className="flex flex-col">
            <span className="font-headline font-bold text-lg tracking-tight leading-tight uppercase truncate max-w-[200px]">{room.name}</span>
            <span className="font-body text-[10px] font-bold tracking-widest text-on-surface-variant uppercase opacity-60">
              {room.subjects?.name || 'Discussion Group'}
            </span>
          </div>
        </div>
        <button className="material-symbols-outlined hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-90">settings_suggest</button>
      </nav>

      {/* Chat Canvas */}
      <main className="flex-1 px-6 pt-8 pb-32 overflow-y-auto no-scrollbar space-y-8 flex flex-col">
        {/* Date Pill */}
        <div className="flex justify-center">
          <span className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase">
            Today
          </span>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((m, i) => {
              const isMe = m.sender_id === profile.id
              const isStaff = ['faculty', 'admin', 'principal', 'hod'].includes(m.profiles?.role)
              
              return (
                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[72%] ${isMe ? 'self-end' : 'self-start'} animate-in fade-in duration-500`}>
                  <div className={`${isMe ? 'bg-primary text-white shadow-xl shadow-primary/10' : (isStaff ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-on-surface')} p-3.5 rounded-2xl shadow-[0px_8px_24px_rgba(39,42,111,0.04)] flex flex-col gap-1.5`}>
                    <div className="flex justify-between items-center gap-4">
                      <span className={`font-headline font-black text-[10px] uppercase tracking-wider ${isMe ? 'text-white/60' : (isStaff ? 'text-primary' : 'text-green-700')}`}>
                        {m.profiles?.full_name?.split(' ')[0] || 'Member'} {isStaff && '• STAFF'}
                      </span>
                      <span className={`font-bold text-[9px] ${isMe ? 'text-white/40' : 'text-on-surface-variant/40'}`}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[12px] leading-relaxed font-body font-medium">
                      {m.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={scrollRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md p-4 pb-6 z-50 shadow-[0px_-8px_24px_rgba(39,42,111,0.04)]">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button type="button" className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-xl hover:bg-primary/20 transition-all active:scale-95 text-xl">add</button>
          <div className="flex-1 bg-surface-container-low rounded-2xl flex items-center px-4 py-2 border border-outline-variant/5">
            <input 
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface placeholder-on-surface-variant/60 font-bold" 
              placeholder="Type your message..." 
              type="text"
            />
            <button type="submit" className="material-symbols-outlined text-primary hover:scale-110 transition-transform active:scale-90 ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>send</button>
          </div>
        </div>
      </form>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
