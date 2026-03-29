import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function StudentAcademics({ profile }) {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('courses')

  useEffect(() => {
    fetchSubjects()
  }, [profile.branch])

  async function fetchSubjects() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('branch', profile.branch)
        .eq('semester', 'Sem 4') // Default sem

      if (data) setSubjects(data)
    } catch (err) {
      console.error("Subjects Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getShorthand = (name) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  const colors = [
    { bg: 'bg-[#FFE0B2]', text: 'text-[#E65100]' }, // WT style
    { bg: 'bg-[#C8E6C9]', text: 'text-[#1B5E20]' }, // OS style
    { bg: 'bg-[#D1C4E9]', text: 'text-[#311B92]' }, // DA style
    { bg: 'bg-[#B3E5FC]', text: 'text-[#01579B]' }, // CN style
    { bg: 'bg-[#F8BBD0]', text: 'text-[#880E4F]' }, // SE style
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface-variant font-medium">Loading curriculum...</p>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="py-6 mb-4">
         <h1 className="font-headline font-black text-3xl text-primary tracking-tighter uppercase leading-none">Curriculum</h1>
         <p className="text-on-surface-variant font-black text-[10px] uppercase tracking-[0.3em] mt-3 opacity-40">Academic Portfolio • Semester IV</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-10 mb-10 border-b border-outline-variant/5">
        <button 
          onClick={() => setActiveTab('courses')}
          className={`relative pb-5 transition-all ${activeTab === 'courses' ? 'text-primary' : 'text-on-surface-variant/40'}`}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.25em]">Courses</span>
          {activeTab === 'courses' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-ambient"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('growth')}
          className={`relative pb-5 transition-all ${activeTab === 'growth' ? 'text-primary' : 'text-on-surface-variant/40'}`}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.25em]">Growth</span>
          {activeTab === 'growth' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-ambient"></div>}
        </button>
      </div>

      {activeTab === 'courses' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-[0.2em] font-black">Current: IV Semester</span>
            <span className="text-primary font-bold text-[10px] uppercase tracking-widest">{profile?.branch} Dept</span>
          </div>

          <div className="flex flex-col gap-6">
            {subjects.map((sub, i) => {
              const color = colors[i % colors.length];
              return (
                <div key={i} className="card-editorial p-6 flex items-center gap-6 group hover:scale-[1.02] active:scale-[0.98]">
                  <div className={`w-16 h-16 rounded-[1.5rem] ${color.bg} flex items-center justify-center flex-shrink-0 shadow-inner group-hover:rotate-6 transition-transform`}>
                    <span className={`font-headline font-black ${color.text} text-2xl`}>{getShorthand(sub.name)}</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="font-label text-primary/40 font-black text-[9px] uppercase tracking-[0.2em] mb-1">{sub.code}</p>
                    <h3 className="font-headline font-black text-on-surface text-lg leading-tight uppercase tracking-tight">{sub.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary/20"></span>
                       <p className="font-body text-on-surface-variant/40 text-[9px] font-black uppercase tracking-widest leading-none">CORE MODULE</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-primary opacity-0 group-hover:opacity-100 transition-all">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Featured Curriculum Card */}
          <div className="mt-12 p-10 rounded-[3rem] editorial-gradient relative overflow-hidden shadow-ambient group active:scale-[0.98] transition-all cursor-pointer">
            <div className="relative z-10 flex flex-col items-start gap-4">
              <span className="text-white/40 font-label text-[10px] font-black tracking-[0.4em] uppercase">Advanced Learning</span>
              <h2 className="text-white font-headline font-black text-3xl max-w-[220px] leading-tight tracking-tighter uppercase">Intelligent Systems</h2>
              <button className="mt-4 bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-lg group-hover:bg-white group-hover:text-primary transition-all">
                Launch Module
              </button>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
             <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
          </div>
          <h3 className="font-headline font-bold text-on-surface text-lg">Academic Performance Insights</h3>
          <p className="text-on-surface-variant text-sm max-w-[250px] mx-auto font-medium">We're calculating your semester growth metrics. Check back after your mid-term results.</p>
        </div>
      )}
    </div>
  )
}
