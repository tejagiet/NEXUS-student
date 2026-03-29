import { useState, useEffect, FormEvent } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { useParams } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: {
    full_name: string;
    role: string;
  };
}

export default function ChatRoom() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const studentPin = localStorage.getItem("student_pin") || "24295-AI-038";

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chats/${id}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // In a real app, we would use Supabase Realtime here
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chats/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderPin: studentPin, content: newMessage })
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopAppBar 
        title="Institutional Room" 
        subtitle="Departmental Channel"
        showBack 
        onBackClick={() => window.history.back()} 
      />
      
      <main className="flex-1 px-6 pt-8 pb-32 max-w-4xl mx-auto w-full space-y-8 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {messages.length === 0 ? (
              <div className="text-center py-20 text-on-surface-variant font-bold opacity-30">
                No history yet. Start the conversation.
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.profiles.full_name.includes("RAM SAI") || msg.sender_id === studentPin; // Simple heuristic for demo
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'items-start'}`}
                  >
                    <div className={`p-6 rounded-[2rem] shadow-sm flex flex-col gap-3 ${
                      isMe ? 'bg-[#1b1e64] text-white' : 'bg-surface-container-lowest'
                    }`}>
                      <div className="flex justify-between items-center gap-10">
                        <span className={`font-headline font-black text-[10px] uppercase tracking-widest ${isMe ? 'text-white/50' : 'text-primary'}`}>
                          {msg.profiles.full_name} • {msg.profiles.role}
                        </span>
                        <span className={`font-black text-[9px] ${isMe ? 'text-white/30' : 'text-on-surface-variant/40'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`text-sm leading-relaxed font-bold ${isMe ? 'text-white' : 'text-on-surface'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* pinned info card */}
            <div className="bg-primary/5 rounded-3xl p-6 flex items-start gap-4 border border-primary/10">
              <div className="bg-primary/10 p-2 rounded-xl">
                <span className="material-symbols-outlined text-primary">verified_user</span>
              </div>
              <div>
                <h4 className="font-headline font-black text-xs text-primary uppercase tracking-widest">Encrypted Channel</h4>
                <p className="text-[11px] text-on-surface-variant font-bold mt-1">This room is restricted to authorized institutional personnel and shared section students only.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <form onSubmit={handleSend} className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl p-6 pb-8 z-50 border-t border-outline-variant/10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="flex-1 bg-surface-container-low rounded-3xl flex items-center px-6 py-4 shadow-inner">
            <input 
              className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface placeholder-on-surface-variant/60 font-black" 
              placeholder="Write a message..." 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="material-symbols-outlined text-primary hover:scale-110 transition-transform active:scale-95 ml-2 font-black">send</button>
          </div>
        </div>
      </form>
    </div>
  );
}
