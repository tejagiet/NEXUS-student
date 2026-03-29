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
      <section className="editorial-gradient rounded-[3rem] p-10 shadow-ambient relative overflow-hidden mb-10 mt-6 group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-container/10 rounded-full -ml-16 -mb-16 blur-2xl group-hover:-translate-x-4 transition-transform duration-1000"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-ambient border-2 border-white/20">
              <span className="font-headline font-black text-5xl text-primary">{profile?.full_name?.[0] || 'S'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-white font-headline font-black text-3xl tracking-tighter leading-none">{profile?.full_name}</h2>
              <p className="text-white/50 font-label text-[10px] font-black uppercase tracking-[0.3em] mt-2">{profile?.pin_number || '24295-AI-038'}</p>
            </div>
          </div>
          <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-all active:scale-90 shadow-ambient">
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
          </button>
        </div>
      </section>

      {/* Stats Grid Section */}
      <section className="grid grid-cols-2 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="card-editorial p-8 flex flex-col items-start gap-4 active:scale-[0.98]">
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform`}>
              <span className={`material-symbols-outlined ${stat.color} text-[28px]`}>{stat.icon}</span>
            </div>
            <div className="space-y-1">
              <p className="text-primary/40 text-[9px] font-black uppercase tracking-widest font-label">{stat.label}</p>
              <h3 className="font-headline font-black text-on-surface text-2xl tracking-tighter leading-none">{stat.value}</h3>
              <p className="text-on-surface-variant/40 text-[9px] font-black uppercase tracking-widest font-label">{stat.detail}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Account Actions */}
      <section className="space-y-4 pb-12">
        <h2 className="font-label text-[10px] font-black text-primary/40 px-2 uppercase tracking-[0.2em]">Settings & Privacy</h2>
        
        <div className="card-editorial overflow-hidden group hover:bg-primary/5">
          <div className="px-8 py-6 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-[24px]">diversity_3</span>
              </div>
              <span className="font-headline font-black text-base text-on-surface uppercase tracking-tight">Referral Program</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>

        <div className="card-editorial overflow-hidden group hover:bg-primary/5">
          <div className="px-8 py-6 flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <span className="material-symbols-outlined text-[24px]">security</span>
              </div>
              <span className="font-headline font-black text-base text-on-surface uppercase tracking-tight">Security Center</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full card-editorial group hover:bg-error transition-all duration-300 active:scale-[0.98] border-none"
        >
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-error/5 flex items-center justify-center group-hover:bg-white/20">
                <span className="material-symbols-outlined text-error group-hover:text-white transition-all">power_settings_new</span>
              </div>
              <span className="font-headline font-black text-base text-error group-hover:text-white uppercase tracking-tight">Deactivate Session</span>
            </div>
            <span className="material-symbols-outlined text-error/30 group-hover:text-white transition-all">logout</span>
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
