import React, { useState } from 'react'
import { LogOut, LayoutDashboard, Calendar, BookOpen, Megaphone, User, Menu, ChevronRight, Info, Tablet, Share2, Lock, HelpCircle, X, Settings, QrCode } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function StudentLayout({ children, activeTab, setTab, profile }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navItems = [
    { id: 'home', label: 'Home', icon: 'grid_view' },
    { id: 'schedule', label: 'Schedule', icon: 'calendar_today' },
    { id: 'lms', label: 'Resources', icon: 'auto_stories' },
    { id: 'notices', label: 'Circulars', icon: 'campaign' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ]

  const sidebarItems = [
    { label: 'About NEXUS', icon: 'info' },
    { label: 'Active Devices', icon: 'devices' },
    { label: 'Share Nexus App', icon: 'share' },
    { label: 'Reset Password', icon: 'lock_reset' },
    { label: 'Help Desk', icon: 'support_agent' },
  ]

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      {/* --- Navigation Drawer --- */}
      <div className={`fixed inset-0 z-[60] transition-all duration-300 ${drawerOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setDrawerOpen(false)}
        />
        
        {/* Drawer Content */}
        <aside className={`absolute left-0 top-0 h-full w-[85%] max-w-[320px] bg-primary text-white flex flex-col p-8 transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-12">
            <span className="font-headline font-bold text-lg tracking-tight">Menu</span>
            <button onClick={() => setDrawerOpen(false)} className="material-symbols-outlined hover:opacity-70">close</button>
          </div>

          <div className="flex flex-col items-start mb-14">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl">
              <span className="font-headline font-black text-3xl text-primary">
                {profile?.full_name?.charAt(0) || 'S'}
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="font-headline font-extrabold text-xl tracking-tight uppercase">{profile?.full_name || 'Scholar Name'}</h2>
              <p className="text-white/60 text-xs font-medium tracking-wider">ID: {profile?.pin_number || 'STU-ID'}</p>
            </div>
          </div>

          <nav className="flex-grow flex flex-col space-y-1">
            {sidebarItems.map((item, i) => (
              <a key={i} href="#" className="flex items-center space-x-4 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                <span className="material-symbols-outlined text-white/70">{item.icon}</span>
                <span className="font-label text-sm font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="mt-auto pt-6">
            <div className="h-[1px] w-full bg-white/10 mb-6"></div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="w-full flex items-center space-x-4 py-4 px-4 rounded-2xl text-[#f76a80] bg-[#f76a80]/10 hover:bg-[#f76a80]/20 transition-all active:scale-95 mb-8"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
              <span className="font-label text-sm font-bold">Logout</span>
            </button>
            <div className="flex items-center justify-between px-2">
              <div className="flex flex-col">
                <span className="font-headline font-black text-base tracking-tighter">NEXUS GIET</span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Version 2.4.0</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white/40 text-sm">settings</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* --- Top App Bar --- */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between md:hidden shadow-[0px_12px_32px_rgba(39,42,111,0.06)]">
        <button onClick={() => setDrawerOpen(true)} className="material-symbols-outlined text-primary scale-110 active:scale-90 transition-transform">menu</button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span className="font-headline font-black text-lg tracking-tighter text-primary">NEXUS GIET</span>
        </div>
        <button className="material-symbols-outlined text-primary scale-110 active:scale-90 transition-transform">qr_code_scanner</button>
      </header>

      {/* --- Content Area --- */}
      <main className="min-h-screen pt-[72px] pb-[100px] md:pt-0 md:pb-0 px-4 md:px-0">
        <div className="max-w-xl mx-auto md:max-w-full">
           {children}
        </div>
      </main>

      {/* --- Bottom Navigation --- */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg flex justify-around items-center px-4 pb-8 pt-4 z-50 rounded-t-[2.5rem] shadow-[0px_-12px_32px_rgba(39,42,111,0.06)] border-t border-surface-container-high md:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-2xl transition-all duration-300 active:scale-90 ${activeTab === item.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: activeTab === item.id ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className={`font-label text-[10px] font-bold uppercase tracking-wider mt-1 ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}} />
    </div>
  )
}
