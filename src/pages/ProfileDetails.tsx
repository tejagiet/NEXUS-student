import { useState, useEffect } from "react";
import { TopAppBar } from "@/src/components/TopAppBar";

interface ProfileDetailData {
  profile: {
    full_name: string;
    pin_number: string;
    branch: string;
    mobile: string;
    email: string;
    section: string;
  };
  stats: {
    fees: {
      college_due: number;
      transport_due: number;
      year_1_due: number;
      year_2_due: number;
      year_3_due: number;
      year_4_due: number;
      status: string;
    };
    attPercentage: string;
  };
}

export default function ProfileDetails() {
  const [data, setData] = useState<ProfileDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const pin = localStorage.getItem("student_pin") || "24295-AI-038";
        const response = await fetch(`/api/profile?pin=${pin}`);
        if (!response.ok) throw new Error("Failed to fetch full records");
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

  const totalDues = data?.stats?.fees ? 
    Number(data.stats.fees.college_due || 0) + Number(data.stats.fees.transport_due || 0) : 0;

  return (
    <div className="min-h-screen bg-surface pb-24 font-sans">
      <TopAppBar title="Profile Details" showBack onBackClick={() => window.history.back()} />
      
      <main className="max-w-screen-md mx-auto px-6 py-8 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="mt-4 text-on-surface-variant font-bold text-xs uppercase tracking-widest">Synchronizing Identity...</p>
          </div>
        ) : (
          <>
            {/* Profile Header/Identity Card */}
            <section className="mb-12 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-primary/5">
                  <div className="w-full h-full bg-[#1b1e64] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <span className="text-white font-headline font-black text-6xl relative z-10">
                      {data?.profile?.full_name?.[0] || 'S'}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#4CAF50] text-white p-3 rounded-2xl shadow-xl border-4 border-white">
                  <span className="material-symbols-outlined text-sm font-black">verified</span>
                </div>
              </div>
              <h2 className="font-headline text-3xl font-black text-[#1b1e64] tracking-tight">{data?.profile?.full_name || 'Scholar'}</h2>
              <p className="text-on-surface-variant font-black text-xs uppercase tracking-[0.3em] mt-2 opacity-50">{data?.profile?.branch || 'General'} Department • Student</p>
            </section>

            <div className="space-y-12">
              {/* Section 1: Personal Details */}
              <section>
                <div className="mb-8 flex items-center gap-6">
                  <h3 className="font-headline text-xl font-black text-[#1b1e64] tracking-tight shrink-0">Bio Data</h3>
                  <div className="flex-grow h-[2px] bg-primary/5 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-[0px_12px_48_rgba(39,42,111,0.03)] border border-outline-variant/5">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">PIN Number</p>
                      <p className="text-[#272A6F] font-black tracking-widest">{data?.profile?.pin_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Mobile</p>
                      <p className="text-on-surface font-bold">{data?.profile?.mobile || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Institutional Email</p>
                      <p className="text-on-surface font-bold text-sm truncate">{data?.profile?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Blood Group</p>
                      <p className="text-on-surface font-black">B+ Positive</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Financial Standing */}
              <section>
                <div className="mb-8 flex items-center gap-6">
                  <h3 className="font-headline text-xl font-black text-[#1b1e64] tracking-tight shrink-0">Financial Standing</h3>
                  <div className="flex-grow h-[2px] bg-primary/5 rounded-full" />
                </div>
                <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-[0px_12px_48_rgba(39,42,111,0.03)] border border-outline-variant/5 space-y-10">
                  <div className="flex items-center justify-between p-6 bg-error/5 rounded-3xl border border-error/5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-error mb-1 opacity-60">Total Outstanding</p>
                      <p className="text-error font-headline text-4xl font-black">₹ {totalDues.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-error text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-error/20">
                      {data?.stats?.fees?.status || 'PAID'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-10">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">College Dues</p>
                        <p className="text-on-surface font-black text-xl">₹ {data?.stats?.fees?.college_due?.toLocaleString('en-IN') || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Transport Dues</p>
                        <p className="text-on-surface font-black text-xl">₹ {data?.stats?.fees?.transport_due?.toLocaleString('en-IN') || 0}</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low p-6 rounded-3xl space-y-4">
                      <p className="text-[9px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Yearly Dues Breakdown</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold opacity-60">Year 1</span>
                        <span className="font-black text-on-surface">₹ {data?.stats?.fees?.year_1_due?.toLocaleString('en-IN') || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold opacity-60">Year 2</span>
                        <span className="font-black text-on-surface">₹ {data?.stats?.fees?.year_2_due?.toLocaleString('en-IN') || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold opacity-60">Year 3</span>
                        <span className="font-black text-on-surface">₹ {data?.stats?.fees?.year_3_due?.toLocaleString('en-IN') || 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold opacity-60">Year 4</span>
                        <span className="font-black text-on-surface">₹ {data?.stats?.fees?.year_4_due?.toLocaleString('en-IN') || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: Institutional Details */}
              <section>
                <div className="mb-8 flex items-center gap-6">
                  <h3 className="font-headline text-xl font-black text-[#1b1e64] tracking-tight shrink-0">Institutional</h3>
                  <div className="flex-grow h-[2px] bg-primary/5 rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface-container-lowest shadow-[0px_12px_48_rgba(39,42,111,0.03)] p-8 rounded-[2.5rem] border border-outline-variant/5">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Primary Branch</p>
                      <p className="text-on-surface font-bold">{data?.profile?.branch || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Assigned Section</p>
                      <p className="text-on-surface font-black text-lg">Section {data?.profile?.section || 'A'}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Degree Program</p>
                      <p className="text-on-surface font-bold">B.Tech Engineering</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-2 opacity-40">Current Institutional Status</p>
                      <p className="text-[#4CAF50] font-black tracking-tighter">OFFICIALLY REGISTERED • ACTIVE</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Support Banner */}
            <div className="mt-20 p-10 bg-[#1b1e64] rounded-[3rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 flex items-center gap-8">
                <div className="bg-white/10 text-white w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-2xl border border-white/20">
                  <span className="material-symbols-outlined text-4xl">contact_support</span>
                </div>
                <div>
                  <p className="font-headline font-black text-white text-lg">Official Records Issue?</p>
                  <p className="text-sm text-white/50 font-medium leading-relaxed mt-1">Please visit the Institutional Admin Office for official data corrections or identity verification updates.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
