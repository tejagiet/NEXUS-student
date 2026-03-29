import { useState, useEffect, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem("isLoggedIn");
    if (session === "true") {
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      let result;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || `Server Error: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      // 1. Store PIN for dynamic data fetching across the app
      const studentPin = result.session_pin || result.user?.pin_number || identifier;
      localStorage.setItem("student_pin", studentPin);

      if (rememberMe) {
        localStorage.setItem("isLoggedIn", "true");
      }

      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-on-surface">
      {/* Top Section: Branding */}
      <header className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 mb-4 rounded-2xl bg-primary flex items-center justify-center editorial-shadow overflow-hidden">
          <span className="material-symbols-outlined text-surface text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
        </div>
        <h1 className="font-headline font-black text-3xl tracking-tighter text-[#272A6F]">
          NEXUS GIET
        </h1>
        <p className="font-sans text-on-surface-variant text-sm mt-1 tracking-wide opacity-70">Empowering Academic Excellence</p>
      </header>

      {/* Middle Section: Login Card */}
      <main className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-xl p-8 editorial-shadow border border-outline-variant/5">
          <div className="mb-8">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-2">Student Login</h2>
            <p className="font-sans text-on-surface-variant text-sm">Please enter your credentials to access your dashboard.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-xs p-3 rounded-xl font-bold animate-shake">
                {error}
              </div>
            )}

            {/* Scholar ID Field */}
            <div className="space-y-2">
              <label className="font-sans text-xs font-semibold uppercase tracking-widest text-on-surface-variant px-1" htmlFor="scholar-id">
                Scholar ID or Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">badge</span>
                </div>
                <input
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:bg-primary-container/10 transition-all font-sans outline-none"
                  id="scholar-id"
                  placeholder="PIN or Email"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-sans text-xs font-semibold uppercase tracking-widest text-on-surface-variant" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors">lock</span>
                </div>
                <input
                  className="w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:bg-primary-container/10 transition-all font-sans outline-none"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center"
                >
                  <span className="material-symbols-outlined text-outline text-lg hover:text-on-surface transition-colors">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-outline-variant rounded-md checked:bg-primary checked:border-primary transition-all duration-200"
                  />
                  <span className="material-symbols-outlined absolute text-white text-[16px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                </div>
                <span className="font-sans text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">Remember Me</span>
              </label>
              <a className="text-primary font-sans text-sm font-medium hover:underline decoration-2 underline-offset-4" href="#">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              disabled={loading}
              className={`w-full py-4 bg-[#272A6F] text-surface font-headline font-bold rounded-full editorial-shadow active:scale-[0.98] transition-all hover:bg-opacity-90 mt-4 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              type="submit"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : "Login"}
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Section: Footer Links */}
      <footer className="mt-12 text-center">
        <p className="font-sans text-on-surface-variant text-sm">
          New Scholar? <a className="text-primary font-semibold hover:underline" href="#">Contact Administration</a>
        </p>
        <div className="mt-8 flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-base">help_outline</span>
            <span className="text-xs font-medium uppercase tracking-tighter">Support</span>
          </div>
          <div className="flex items-center space-x-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-base">security</span>
            <span className="text-xs font-medium uppercase tracking-tighter">Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
