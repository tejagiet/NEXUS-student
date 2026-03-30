import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  ExternalLink, CreditCard, ShieldCheck, AlertCircle, Loader2, 
  TrendingDown, CheckCircle2, RefreshCw, Calendar, IndianRupee, History
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function FinancePortal({ profile }) {
  const [fee, setFee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchFeeData = async () => {
    const { data } = await supabase.from('fees').select('*').eq('student_id', profile.id).maybeSingle()
    if (data) setFee(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchFeeData()
  }, [])

  const handleSync = async () => {
    if (!profile?.pin_number) return
    setSyncing(true)
    try {
      const { data, error } = await supabase.functions.invoke('fee-sync', {
        body: { pin: profile.pin_number }
      })
      if (error) throw error
      await fetchFeeData()
    } catch (err) {
      console.error("Sync Error:", err)
      alert("Failed to sync dues. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  const campxUrl = `https://giet.campx.in/gier/payment-portal/`
  const pct = fee ? Math.round((fee.paid_fee / fee.total_fee) * 100) : 0
  const balance = fee ? (fee.total_fee - fee.paid_fee) : 0

  const STATUS = {
    paid:    { label: 'CLEARED', bg: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    partial: { label: 'PARTIAL', bg: 'bg-amber-100 text-amber-700 border-amber-300' },
    pending: { label: 'PENDING', bg: 'bg-red-100 text-red-700 border-red-300' },
  }
  const s = STATUS[fee?.status] || STATUS.pending

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary">Finance Hub</h2>
          <p className="text-on-surface-variant text-[10px] font-medium opacity-60">GIET CampX Digital Synchronization.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing || !profile?.pin_number}
          className="p-3 bg-surface-container-high rounded-2xl text-primary transition-all active:scale-90 disabled:opacity-30 shadow-ambient border border-outline-variant/10"
        >
          {syncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
        </button>
      </header>

      {loading ? (
        <div className="card-editorial p-12 text-center animate-pulse">
           <Loader2 className="animate-spin text-primary mx-auto mb-4" size={24} />
           <p className="text-[10px] font-black uppercase text-primary/40 tracking-[0.2em]">Acquiring Ledger Records...</p>
        </div>
      ) : fee ? (
        <div className="space-y-6">
          <div className="card-editorial p-5 relative overflow-hidden shadow-ambient">
             <div className="absolute top-4 right-4 z-10">
                <span className={`text-[8px] font-black px-2.5 py-0.5 rounded-full border tracking-[0.2em] uppercase ${s.bg}`}>{s.label}</span>
             </div>
             
             <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] mb-1">Total Outstanding</p>
                  <p className="text-4xl font-black text-primary">₹{balance.toLocaleString('en-IN')}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] text-on-surface-variant font-black uppercase tracking-wider">
                      <span>Sync Progress</span>
                      <span>{pct}%</span>
                   </div>
                   <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden shadow-inner border border-outline-variant/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        className="h-full bg-primary"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-[8px] font-black text-primary uppercase tracking-widest opacity-60 mb-1">Academic</p>
                      <p className="text-sm font-black text-primary">₹{(fee.college_due || 0).toLocaleString()}</p>
                   </div>
                   <div className="p-3 bg-tertiary-container/20 rounded-2xl border border-tertiary-container/10">
                      <p className="text-[8px] font-black text-tertiary uppercase tracking-widest opacity-60 mb-1">Transport</p>
                      <p className="text-sm font-black text-tertiary">₹{(fee.transport_due || 0).toLocaleString()}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="editorial-gradient rounded-[2rem] p-6 text-white shadow-ambient relative overflow-hidden group">
             <div className="relative z-10 flex flex-col gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                   <CreditCard size={18} className="text-primary" />
                </div>
                <div className="space-y-1">
                   <h3 className="text-xl font-black">GIET Payment Gateway</h3>
                   <p className="text-white/60 text-[10px] leading-tight font-medium max-w-[200px]">
                      Redirecting to official portal for secure transactions.
                   </p>
                </div>
                <a href={campxUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full bg-white text-primary py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all">
                  <span>Pay via CampX</span>
                  <ExternalLink size={14} />
                </a>
             </div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 text-center flex items-center justify-center gap-2">
             <History size={14} className="text-on-surface-variant/40" />
             <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">
               Sync: {fee.last_synced_at ? new Date(fee.last_synced_at).toLocaleDateString() : 'Pending'}
             </p>
          </div>
        </div>
      ) : (
        <div className="card-editorial p-12 text-center opacity-40">
           <CreditCard size={40} className="mx-auto mb-4" />
           <p className="text-[10px] font-black uppercase tracking-widest mb-4">No Digital Ledger Found</p>
           <button onClick={handleSync} className="text-xs font-bold text-primary underline">Link CampX Profile</button>
        </div>
      )}
    </div>
  )
}
