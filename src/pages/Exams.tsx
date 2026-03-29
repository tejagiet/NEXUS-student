import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";

interface ExamResult {
  grade: string;
  feedback: string;
  submitted_at: string;
  assignments: {
    title: string;
    max_points: number;
  };
}

export default function Exams() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const pin = localStorage.getItem("student_pin") || "24295-AI-038";
        const response = await fetch(`/api/exams/results?pin=${pin}`);
        if (!response.ok) throw new Error("Failed to fetch academic history");
        const data = await response.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Simple GPA Calculation (Mapping A-F to 4-0 scale for demo)
  const gradeToPoints = (grade: string) => {
    const map: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0, 'S': 4, 'O': 4 };
    return map[grade.toUpperCase()] ?? 0;
  };

  const cumulativeGPA = results.length > 0 
    ? (results.reduce((acc, curr) => acc + gradeToPoints(curr.grade), 0) / results.length).toFixed(2)
    : "N/A";

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar title="Exam Performance" showBack onBackClick={() => window.history.back()} />
      
      <main className="max-w-md mx-auto px-6 pt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-on-surface-variant font-bold text-sm">Aggregating records...</p>
          </div>
        ) : error ? (
          <div className="bg-error/10 p-6 rounded-xl border border-error/20 text-error text-center font-bold">
            {error}
          </div>
        ) : (
          <>
            {/* Hero Summary Section */}
            <section className="mb-10">
              <div className="bg-[#1b1e64] p-10 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.4em] mb-3">Institutional Ranking</p>
                  <h2 className="text-white font-headline text-6xl font-black tracking-tighter">{cumulativeGPA}</h2>
                  <p className="text-white/70 text-xs font-bold mt-2">Cumulative Grade Point Average</p>
                  <div className="mt-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Live Verification Status</span>
                  </div>
                </div>
                {/* Decorative Light Leak */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            </section>

            {/* List Section Header */}
            <div className="flex justify-between items-end mb-8 px-1">
              <div>
                <h3 className="font-headline text-2xl font-black text-[#1b1e64] tracking-tight">Academic Journey</h3>
                <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Verified Submissions</p>
              </div>
              <span className="bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">Semester IV</span>
            </div>

            {/* Submissions List */}
            <div className="space-y-5">
              {results.length === 0 ? (
                <div className="text-center py-10 text-on-surface-variant italic opacity-50 font-bold">No verified results found in current term.</div>
              ) : (
                results.map((res, index) => (
                  <div 
                    key={index}
                    className="bg-surface-container-lowest rounded-3xl p-6 flex items-center shadow-[0px_12px_32px_rgba(39,42,111,0.03)] border border-outline-variant/5 hover:border-primary/20 transition-all cursor-pointer group hover:shadow-xl"
                  >
                    <div className="w-16 h-16 bg-primary/5 rounded-[2rem] flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform">
                      <span className="font-headline font-black text-primary text-2xl">{res.grade}</span>
                    </div>
                    <div className="ml-6 flex-grow">
                      <h4 className="font-headline font-bold text-base text-[#1b1e64] line-clamp-1">{res.assignments.title}</h4>
                      <div className="flex items-center gap-3 mt-1 opacity-50">
                        <span className="material-symbols-outlined text-xs">calendar_today</span>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                          {new Date(res.submitted_at).toLocaleDateString('en-GB')} • Score: {res.grade}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">verified</span>
                  </div>
                ))
              )}
            </div>

            {/* Disclaimer Insight Card */}
            <div className="mt-12 p-8 bg-[#f8f9ff] rounded-3xl border border-primary/5 relative overflow-hidden group">
              <div className="relative z-10">
                <h5 className="font-headline font-black text-[#1b1e64] text-xs uppercase tracking-[0.2em] mb-4 opacity-50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Institutional Policy
                </h5>
                <p className="text-[#272A6F] text-sm font-bold leading-relaxed">
                  These results are subject to final verification by the <span className="text-primary italic">Controller of Examinations</span>. Official transcripts must be collected from the administration office.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
