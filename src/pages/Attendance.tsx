import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";

interface AttendanceDetail {
  id: string;
  name: string;
  code: string;
  present: number;
  total: number;
  percentage: string;
  periods: string;
  topics?: string[];
}

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const pin = localStorage.getItem("student_pin") || "24295-AI-038";
        const response = await fetch(`/api/attendance?pin=${pin}`);
        if (!response.ok) throw new Error("Failed to fetch attendance");
        const data = await response.json();
        setAttendance(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const totalPresent = attendance.reduce((acc, curr) => acc + curr.present, 0);
  const totalPeriods = attendance.reduce((acc, curr) => acc + curr.total, 0);
  const globalPercentage = totalPeriods > 0 ? ((totalPresent / totalPeriods) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar title="Overall Attendance" showBack onBackClick={() => window.history.back()} />
      
      <main className="max-w-md mx-auto px-6 pb-32 space-y-8 mt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-on-surface-variant font-bold text-sm">Calculating metrics...</p>
          </div>
        ) : error ? (
          <div className="bg-error/10 p-6 rounded-xl border border-error/20 text-error text-center font-bold">
            {error}
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <section>
              <div className="bg-primary shadow-xl shadow-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent pointer-events-none" />
                <span className="text-white/70 font-sans text-xs font-bold uppercase tracking-[0.2em]">Institutional Standing</span>
                <p className="text-white font-headline text-4xl font-black">{globalPercentage}%</p>
                <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full">Aggregated Average</p>
                <div className="w-full bg-white/20 h-2 rounded-full mt-4 overflow-hidden border border-white/10">
                  <div 
                    className="bg-white h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
                    style={{ width: `${globalPercentage}%` }} 
                  />
                </div>
              </div>
            </section>

            {/* List Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="font-headline text-xl font-black text-[#1b1e64] tracking-tight">Course Breakdown</h2>
                <div className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter shadow-sm">
                  {attendance.length} Subjects
                </div>
              </div>
              <div className="space-y-4">
                {attendance.map((course) => (
                  <div 
                    key={course.id}
                    className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0px_12px_32px_rgba(39,42,111,0.03)] border border-outline-variant/5 hover:shadow-lg transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-headline font-black text-xs shadow-inner ${Number(course.percentage) > 75 ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                          {course.code}
                        </div>
                        <div>
                          <p className="font-headline font-bold text-sm text-[#272A6F] line-clamp-1">{course.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider opacity-60 mt-0.5">{course.periods}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-headline font-black text-lg ${Number(course.percentage) > 75 ? 'text-primary' : 'text-error'}`}>{course.percentage}%</p>
                        <div className={cn(
                          "text-[8px] font-black px-2 py-0.5 rounded-md mt-1 shadow-sm uppercase",
                          Number(course.percentage) < 75 ? "bg-error text-white" : "bg-primary text-white"
                        )}>
                          {Number(course.percentage) < 75 ? 'Low' : 'Stable'}
                        </div>
                      </div>
                    </div>

                    {/* Topics Row */}
                    {course.topics && course.topics.length > 0 && (
                      <div className="pt-4 border-t border-outline-variant/10 flex flex-wrap gap-2">
                        {course.topics.slice(0, 3).map((topic, i) => (
                          <span key={topic + i} className="bg-surface-container px-2 py-1 rounded text-[9px] font-bold text-on-surface-variant/80 border border-outline-variant/5">
                            {topic}
                          </span>
                        ))}
                        {course.topics.length > 3 && <span className="text-[9px] font-black text-on-surface-variant opacity-40 ml-1">+{course.topics.length - 3} more</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
