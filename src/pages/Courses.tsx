import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";

interface Subject {
  id: string;
  name: string;
  code: string;
  branch: string;
}

const subjectColors = [
  { bg: '#FFE0B2', text: '#E65100' },
  { bg: '#C8E6C9', text: '#1B5E20' },
  { bg: '#D1C4E9', text: '#311B92' },
  { bg: '#B3E5FC', text: '#01579B' },
  { bg: '#F8BBD0', text: '#880E4F' },
];

export default function Courses() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const pin = localStorage.getItem("student_pin") || "24295-AI-038";
        const response = await fetch(`/api/subjects?pin=${pin}`);
        if (!response.ok) throw new Error("Failed to fetch curriculum");
        const data = await response.json();
        setSubjects(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar />
      
      <main className="max-w-2xl mx-auto px-6 pt-6 pb-32">
        {/* Tab Navigation */}
        <div className="flex items-center gap-8 mb-8 border-b border-outline-variant/15">
          <div className="relative pb-3">
            <span className="text-on-surface font-bold text-base tracking-wide">Courses</span>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-error rounded-full" />
          </div>
          <div className="pb-3 text-on-surface-variant font-medium text-base tracking-wide opacity-50">
            Growth
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-on-surface-variant font-bold text-sm tracking-widest opacity-60">Synchronizing Curriculum...</p>
          </div>
        ) : error ? (
          <div className="bg-error/10 p-6 rounded-xl border border-error/20 text-error text-center font-bold">
            {error}
          </div>
        ) : (
          <>
            {/* Section Header */}
            <div className="mb-6 flex justify-between items-center px-1">
              <span className="text-on-surface-variant font-sans text-xs uppercase tracking-widest font-black opacity-60">Active Semester Subjects</span>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">{subjects.length} Units</span>
            </div>

            {/* Courses List */}
            <div className="flex flex-col gap-5">
              {subjects.map((subject, index) => {
                const colorScheme = subjectColors[index % subjectColors.length];
                return (
                  <div 
                    key={subject.id}
                    className="bg-surface-container-lowest rounded-2xl p-6 flex items-center gap-6 shadow-[0px_12px_32px_rgba(39,42,111,0.04)] hover:shadow-xl hover:translate-x-1 transition-all cursor-pointer group border border-outline-variant/5"
                  >
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner rotate-3 group-hover:rotate-0 transition-transform"
                      style={{ backgroundColor: colorScheme.bg }}
                    >
                      <span className="font-headline font-black text-xl" style={{ color: colorScheme.text }}>{subject.code.slice(0, 2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-headline font-black text-[#1b1e64] text-lg leading-tight group-hover:text-primary transition-colors">{subject.name}</h3>
                      <p className="font-sans text-on-surface-variant text-[10px] font-black mt-1 uppercase tracking-[0.2em] opacity-40">{subject.code} • Institutional Core</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Featured Curriculum Card */}
        <div className="mt-12 p-10 rounded-3xl bg-[#1b1e64] relative overflow-hidden shadow-2xl border border-white/5">
          <div className="relative z-10">
            <span className="text-white/40 font-sans text-xs font-black tracking-[0.3em] uppercase">Academic Highlight</span>
            <h2 className="text-white font-headline font-black text-3xl mt-3 max-w-[250px] leading-tight">Institutional Research Symposium</h2>
            <p className="text-white/60 text-sm mt-4 max-w-[280px] leading-relaxed">Join the annual gathering of engineering minds at Nexus GIET to showcase your innovative work.</p>
            <button className="mt-8 bg-white text-[#1b1e64] px-8 py-3 rounded-full font-black text-sm shadow-xl active:scale-95 transition-all hover:bg-opacity-90">
              View Schedule
            </button>
          </div>
          {/* Decorative Background Element */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary-container/10 rounded-full blur-xl" />
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
