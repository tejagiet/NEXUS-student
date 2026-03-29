import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";
import { BottomNavBar } from "@/src/components/BottomNavBar";
import { Link } from "react-router-dom";

interface ProfileData {
  profile: {
    full_name: string;
    pin_number: string;
    branch: string;
    mobile: string;
    avatar_url: string;
  };
  stats: {
    fees: {
      total_fee: number;
      paid_fee: number;
    };
    attPercentage: string;
  };
}

export default function Profile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const pin = localStorage.getItem("student_pin") || "24295-AI-038";
        const response = await fetch(`/api/profile?pin=${pin}`);
        if (!response.ok) throw new Error("Failed to fetch profile");
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const dues = data?.stats?.fees ? (data.stats.fees.total_fee - data.stats.fees.paid_fee) : 0;

  return (
    <div className="min-h-screen bg-surface pb-32">
      <TopAppBar title="Account" />
      
      <main className="max-w-screen-md mx-auto px-6 space-y-8 mt-4">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Header Profile Card */}
            <section className="bg-primary rounded-2xl p-8 shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1b1e64 0%, #272A6F 100%)' }}>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                    <span className="font-headline font-black text-4xl text-white">
                      {data?.profile.full_name?.[0] || 'S'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-white font-headline font-black text-2xl tracking-tight">{data?.profile.full_name || 'Scholar Name'}</h2>
                    <p className="text-white/60 font-mono text-xs font-bold tracking-[0.3em] uppercase mt-1">{data?.profile.pin_number || '24295-AI-038'}</p>
                  </div>
                </div>
                <Link to="/profile/details" className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all text-white">
                  <span className="material-symbols-outlined text-3xl">chevron_right</span>
                </Link>
              </div>
            </section>

            {/* Stats Grid Section */}
            <section className="grid grid-cols-2 gap-5">
              <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] shadow-sm flex flex-col items-start gap-4 border border-outline-variant/10 group hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl">calendar_today</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-black text-on-surface text-sm uppercase tracking-wider opacity-60">Attendance</h3>
                  <p className="text-on-surface font-black text-lg">{data?.stats.attPercentage}%</p>
                </div>
              </div>

              <Link to="/exams" className="bg-surface-container-lowest p-6 rounded-[2.5rem] shadow-sm flex flex-col items-start gap-4 border border-outline-variant/10 group hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-secondary text-3xl">grade</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-black text-on-surface text-sm uppercase tracking-wider opacity-60">CGPA</h3>
                  <p className="text-on-surface font-black text-lg">Live Result</p>
                </div>
              </Link>

              <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] shadow-sm flex flex-col items-start gap-4 border border-outline-variant/10 group hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-tertiary text-3xl">payments</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-black text-on-surface text-sm uppercase tracking-wider opacity-60">Pending Fee</h3>
                  <p className="text-on-surface font-black text-lg">INR {dues.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-6 rounded-[2.5rem] shadow-sm flex flex-col items-start gap-4 border border-outline-variant/10 group hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-error text-3xl">verified_user</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline font-black text-on-surface text-sm uppercase tracking-wider opacity-60">Status</h3>
                  <p className="text-on-surface font-black text-lg">Active</p>
                </div>
              </div>
            </section>

            {/* Logout Button */}
            <section className="pt-4">
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
                }}
                className="w-full bg-error/10 text-error font-headline font-black py-4 rounded-3xl border border-error/5 hover:bg-error hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">logout</span>
                Logout from Nexus
              </button>
            </section>
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
