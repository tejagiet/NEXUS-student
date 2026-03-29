import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";
import { Sidebar } from "@/src/components/Sidebar";

interface Subject {
  code: string;
  external: number;
  internal: number;
  total: number;
  gradePoints: number;
  credits: number;
  grade: string;
  result: string;
}

interface ResultData {
  studentName: string;
  branch: string;
  gpa: number;
  grandTotal: number;
  result: string;
  examMonth: string;
  semester: string;
  subjects: Subject[];
  pin: string;
}

const SEMESTERS = [
  { value: '1', label: '1st Semester' },
  { value: '2', label: '2nd Semester' },
  { value: '3', label: '3rd Semester' },
  { value: '4', label: '4th Semester' },
  { value: '5', label: '5th Semester' },
  { value: '6', label: '6th Semester' },
];

const GRADE_COLORS: Record<string, string> = {
  'O':  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'A+': 'bg-blue-100    text-blue-700    border-blue-200',
  'A':  'bg-cyan-100    text-cyan-700    border-cyan-200',
  'B':  'bg-yellow-100  text-yellow-700  border-yellow-200',
  'C+': 'bg-orange-100  text-orange-700  border-orange-200',
  'C':  'bg-amber-100   text-amber-700   border-amber-200',
  'F':  'bg-red-100     text-red-700     border-red-200',
};

export default function Results() {
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semester, setSemester] = useState('3');
  const [pin, setPin] = useState(localStorage.getItem("student_pin") || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/results?pin=${pin}&semester=${semester}`);
      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Portal connection failed.");
      }
      
      setResult({ ...json.data, pin });
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar onMenuClick={() => setIsSidebarOpen(true)} title="SBTET Results" />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="max-w-4xl mx-auto px-6 pt-8 space-y-8">
        {/* Search Header */}
        <header className="space-y-2">
          <h2 className="text-3xl font-black text-[#1b1e64] tracking-tight uppercase">SBTET Portal Hub</h2>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest opacity-40">Verified Institutional Grade Gateway</p>
        </header>

        {/* Filter Section */}
        <div className="bg-white rounded-3xl p-8 shadow-[0px_12px_48px_rgba(39,42,111,0.03)] border border-outline-variant/5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50 ml-1">Hall Ticket Number (PIN)</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={pin} 
                  onChange={e => setPin(e.target.value)}
                  placeholder="24295-AI-038"
                  className="w-full h-14 bg-surface-container-low border-none rounded-2xl px-6 font-mono font-black text-[#1b1e64] outline-none focus:ring-2 focus:ring-[#1b1e64]/10 transition-all placeholder:opacity-20"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50 ml-1">Semester</label>
              <select 
                value={semester} 
                onChange={e => setSemester(e.target.value)}
                className="w-full h-14 bg-surface-container-low border-none rounded-2xl px-6 font-black text-[#1b1e64] outline-none focus:ring-2 focus:ring-[#1b1e64]/10 transition-all cursor-pointer appearance-none"
              >
                {SEMESTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <button 
              onClick={fetchResults} 
              disabled={loading}
              className="h-14 bg-[#1b1e64] text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center space-x-3 hover:shadow-xl active:scale-95 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">sync</span>
                  <span>Pull Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Area */}
        {error && (
          <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl flex items-start gap-4 animate-in zoom-in-95">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <div>
              <p className="font-black text-red-700 text-sm uppercase tracking-tight">Crawl Interrupted</p>
              <p className="text-red-600/70 text-xs font-bold mt-1 uppercase tracking-widest">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-30">
            <div className="w-12 h-12 border-2 border-[#1b1e64]/10 border-t-[#1b1e64] rounded-full animate-spin" />
            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em]">Crawling Official Portal...</p>
          </div>
        ) : result ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            {/* GPA Hero Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-[#1b1e64] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[280px]">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-400 rounded-full blur-[100px] opacity-20" />
                <div>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Academic GPA</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-8xl font-black text-teal-400 leading-none">{result.gpa}</h3>
                    <span className="text-white/20 font-black text-xl">/ 10</span>
                  </div>
                </div>
                <div className="mt-8 space-y-1">
                  <p className="text-white font-black text-xl tracking-tight uppercase truncate">{result.studentName}</p>
                  <p className="text-white/40 text-[10px] font-mono font-black uppercase tracking-[0.2em]">{result.pin}</p>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-[2rem] p-8 flex flex-col justify-between border border-outline-variant/5 shadow-sm">
                  <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em]">Aggregate Marks</p>
                  <p className="text-4xl font-black text-[#1b1e64]">{result.grandTotal}</p>
                </div>
                <div className="bg-white rounded-[2rem] p-8 flex flex-col justify-between border border-outline-variant/5 shadow-sm">
                  <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em]">Portal Status</p>
                  <div className="flex items-center gap-3">
                    <p className={`text-2xl font-black ${result.result === 'PASS' ? 'text-teal-600' : 'text-red-500'}`}>{result.result}</p>
                    <div className={`w-2.5 h-2.5 rounded-full ${result.result === 'PASS' ? 'bg-teal-500' : 'bg-red-500'} animate-pulse`} />
                  </div>
                </div>
                <div className="col-span-full bg-surface-container-low rounded-[2rem] p-6 flex items-center justify-between px-10">
                   <div className="flex flex-col">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Exam Session</p>
                      <p className="text-sm font-black text-[#1b1e64] uppercase">{result.examMonth}</p>
                   </div>
                   <div className="h-8 w-[1px] bg-outline-variant/20" />
                   <div className="flex flex-col text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Semester Code</p>
                      <p className="text-sm font-black text-[#1b1e64] uppercase">{result.semester}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Subject Table */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant/5">
              <div className="px-10 py-8 bg-surface-container-lowest border-b border-outline-variant/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1b1e64] rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <span className="material-symbols-outlined text-[24px]">analytics</span>
                  </div>
                  <div>
                    <h4 className="font-black text-[#1b1e64] text-lg tracking-tight uppercase">Performance Breakdown</h4>
                    <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] mt-0.5">Subject-Wise Analytics</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1b1e64]/5">
                    <tr className="text-[#1b1e64] text-[9px] font-black uppercase tracking-[0.3em]">
                      <th className="px-10 py-5 text-left">Code</th>
                      <th className="px-8 py-5 text-center">External</th>
                      <th className="px-8 py-5 text-center">Internal</th>
                      <th className="px-8 py-5 text-center">Total</th>
                      <th className="px-8 py-5 text-center">Grade</th>
                      <th className="px-10 py-5 text-right">Credits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {result.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-primary-container/[0.03] transition-colors group">
                        <td className="px-10 py-6 font-mono font-black text-[#1b1e64]/60 group-hover:text-[#1b1e64] transition-colors">{sub.code}</td>
                        <td className="px-8 py-6 text-center font-black text-on-surface-variant opacity-60">{sub.external}</td>
                        <td className="px-8 py-6 text-center font-black text-on-surface-variant opacity-60">{sub.internal}</td>
                        <td className="px-8 py-6 text-center font-black text-[#1b1e64] text-lg">{sub.total}</td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-widest ${GRADE_COLORS[sub.grade] || 'bg-gray-100 border-gray-200'}`}>
                            {sub.grade}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right font-black text-[#1b1e64]/30">{sub.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Aggregation Footer */}
              <div className="bg-[#1b1e64] p-10 flex items-center justify-between text-white">
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Final Performance</p>
                  <p className="text-3xl font-black uppercase italic tracking-tighter">Academic Status: {result.result}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Semester GPA</p>
                  <p className="text-5xl font-black text-teal-400 leading-none">{result.gpa}</p>
                </div>
              </div>
            </div>

            <p className="text-center text-[9px] text-on-surface-variant/30 font-black uppercase tracking-[0.4em]">
              Gateway: SBTET AP · Verified Institutional Node
            </p>
          </div>
        ) : (
          <div className="bg-surface-container-low border-2 border-dashed border-outline-variant/10 rounded-[3rem] p-24 text-center">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">school</span>
            </div>
            <h3 className="text-2xl font-black text-[#1b1e64]/30 uppercase tracking-tight">Portal Entry Pending</h3>
            <p className="text-on-surface-variant/40 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs mx-auto">
              Provide credentials to verify institutional grade records from official servers.
            </p>
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
