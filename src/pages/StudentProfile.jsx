import React from 'react'
import { supabase } from '../lib/supabase'

export default function StudentProfile({ profile, session }) {
  // Mock performance data (could be fetched if tables exist)
  const stats = [
    { label: 'Attendance', value: '92.86%', detail: 'Overall %', icon: 'calendar_today', bg: 'bg-[#EDE7F6]', color: 'text-[#5E35B1]' },
    { label: 'Exams', value: '8.4', detail: 'Current CGPA', icon: 'grade', bg: 'bg-[#FFF3E0]', color: 'text-[#EF6C00]' },
    { label: 'Fee Payments', value: '₹58,061', detail: 'Due Amount', icon: 'payments', bg: 'bg-[#E8F5E9]', color: 'text-[#2E7D32]' },
    { label: 'Transactions', value: '6', detail: 'Recent Activity', icon: 'receipt_long', bg: 'bg-[#FCE4EC]', color: 'text-[#C2185B]' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Profile Card */}
      <section className="editorial-gradient rounded-[2rem] p-5 shadow-ambient relative overflow-hidden mb-6 mt-4 group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-container/10 rounded-full -ml-16 -mb-16 blur-2xl group-hover:-translate-x-4 transition-transform duration-1000"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-ambient border-2 border-white/20">
              <span className="font-headline font-black text-3xl text-primary">{profile?.full_name?.[0] || 'S'}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-white font-headline font-black text-xl tracking-tighter leading-none">{profile?.full_name}</h2>
              <p className="text-white/50 font-label text-[8px] font-black uppercase tracking-[0.3em] mt-1.5">{profile?.pin_number || '24295-AI-038'}</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-all active:scale-90 shadow-ambient">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
          </button>
        </div>
      </section>

      {/* Stats Grid Section */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="card-editorial p-5 flex flex-col items-start gap-3 active:scale-[0.98]">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform`}>
              <span className={`material-symbols-outlined ${stat.color} text-[20px]`}>{stat.icon}</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-primary/40 text-[8px] font-black uppercase tracking-widest font-label opacity-60">{stat.label}</p>
              <h3 className="font-headline font-black text-on-surface text-lg tracking-tighter leading-none">{stat.value}</h3>
              <p className="text-on-surface-variant/40 text-[7.5px] font-black uppercase tracking-widest font-label opacity-40">{stat.detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Account Actions */}
      <section className="space-y-4 pb-12">
        <h2 className="font-label text-[10px] font-black text-primary/40 px-2 uppercase tracking-[0.2em]">Settings & Privacy</h2>
        
        <div className="card-editorial overflow-hidden group hover:bg-primary/5">
          <div className="px-5 py-4 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-[20px]">diversity_3</span>
              </div>
              <span className="font-headline font-black text-sm text-on-surface uppercase tracking-tight">Referral Program</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform text-[18px]">arrow_forward</span>
          </div>
        </div>

        <div className="card-editorial overflow-hidden group hover:bg-primary/5">
          <div className="px-5 py-4 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-[20px]">security</span>
              </div>
              <span className="font-headline font-black text-sm text-on-surface uppercase tracking-tight">Security Center</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform text-[18px]">arrow_forward</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full card-editorial group hover:bg-error transition-all duration-300 active:scale-[0.98] border-none"
        >
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-error/5 flex items-center justify-center group-hover:bg-white/20">
                <span className="material-symbols-outlined text-error group-hover:text-white transition-all text-[20px]">power_settings_new</span>
              </div>
              <span className="font-headline font-black text-sm text-error group-hover:text-white uppercase tracking-tight">Deactivate Session</span>
            </div>
            <span className="material-symbols-outlined text-error/30 group-hover:text-white transition-all text-[20px]">logout</span>
          </div>
        </button>
      </section>

      {/* Version Tag */}
      <div className="text-center pt-8">
         <p className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-[0.4em] mb-4">Nexus Student Ecosystem v2.5.0</p>
      </div>
    </div>
  )
}
