import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const pin = localStorage.getItem("student_pin") || "24295-AI-038";
      const res = await fetch(`/api/profile?pin=${pin}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    };
    if (isOpen) fetchProfile();
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("student_pin");
    navigate("/");
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside 
        className={`fixed top-0 left-0 h-full w-[300px] bg-[#1b1e64] text-white z-[70] transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col p-8 shadow-2xl`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between mb-12">
          <span className="font-headline font-bold text-lg tracking-tight uppercase opacity-50">Student Menu</span>
          <button 
            onClick={onClose}
            className="material-symbols-outlined hover:opacity-70 transition-opacity"
          >
            close
          </button>
        </div>

        {/* Profile Area */}
        <div className="flex flex-col items-start mb-14">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/10">
            <span className="font-headline font-black text-4xl text-white">
              {profile?.full_name?.[0] || 'N'}
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="font-headline font-extrabold text-xl tracking-tight text-white uppercase">
              {profile?.full_name || 'Loading...'}
            </h2>
            <p className="font-sans text-indigo-300/80 text-[10px] font-black uppercase tracking-widest">
              ID: {profile?.pin_number || '---'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow flex flex-col space-y-2">
          <Link 
            to="/profile" 
            onClick={onClose}
            className="group flex items-center space-x-4 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-indigo-200 group-hover:text-white">person</span>
            <span className="font-sans text-sm font-bold">My Academic Profile</span>
          </Link>
          <Link 
            to="/schedule" 
            onClick={onClose}
            className="group flex items-center space-x-4 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-indigo-200 group-hover:text-white">calendar_today</span>
            <span className="font-sans text-sm font-bold">Daily Schedule</span>
          </Link>
          <Link 
            to="/results" 
            onClick={onClose}
            className="group flex items-center space-x-4 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-indigo-200 group-hover:text-white">analytics</span>
            <span className="font-sans text-sm font-bold">SBTET Results Portal</span>
          </Link>
          <a className="group flex items-center space-x-4 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-200 pointer-events-none opacity-40" href="#">
            <span className="material-symbols-outlined text-indigo-200">devices</span>
            <span className="font-sans text-sm font-bold">Active Devices</span>
          </a>
          <a className="group flex items-center space-x-4 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-200 pointer-events-none opacity-40" href="#">
            <span className="material-symbols-outlined text-indigo-200">lock_reset</span>
            <span className="font-sans text-sm font-bold">Reset Password</span>
          </a>
          <a className="group flex items-center space-x-4 py-3 px-4 rounded-2xl hover:bg-white/10 transition-all duration-200 pointer-events-none opacity-40" href="#">
            <span className="material-symbols-outlined text-indigo-200">support_agent</span>
            <span className="font-sans text-sm font-bold">Help Desk</span>
          </a>
        </nav>

        {/* Footer: Logout */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full group flex items-center space-x-4 py-4 px-4 rounded-2xl text-red-200 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
            <span className="font-sans text-sm font-black uppercase tracking-tighter">Logout</span>
          </button>
          
          <div className="mt-8 flex items-center justify-between px-2">
            <div className="flex flex-col">
              <span className="font-headline font-black text-sm tracking-tighter text-white">NEXUS GIET</span>
              <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Deployment V2.5</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/40 text-sm">settings</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
