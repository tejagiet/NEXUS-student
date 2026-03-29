import { Menu, QrCode } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface TopAppBarProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showBack?: boolean;
  onBackClick?: () => void;
  className?: string;
}

export function TopAppBar({ 
  title = "NEXUS GIET", 
  subtitle, 
  onMenuClick, 
  showBack, 
  onBackClick,
  className 
}: TopAppBarProps) {
  return (
    <header className={cn(
      "bg-white/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 safe-pt shadow-[0px_12px_32px_rgba(39,42,111,0.06)]",
      className
    )}>
      <div className="flex items-center gap-4">
        {showBack ? (
          <button 
            onClick={onBackClick}
            className="hover:bg-surface-container transition-colors p-2 rounded-full active:opacity-80 active:scale-95"
          >
            <span className="material-symbols-outlined text-[#272A6F]">arrow_back</span>
          </button>
        ) : (
          <button 
            onClick={onMenuClick}
            className="hover:bg-surface-container transition-colors p-2 rounded-full active:opacity-80 active:scale-95"
          >
            <span className="material-symbols-outlined text-[#272A6F]">menu</span>
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="font-headline font-bold text-lg tracking-tight text-[#272A6F]">{title}</h1>
          {subtitle && (
            <span className="font-sans text-[10px] font-medium tracking-widest text-on-surface-variant uppercase">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      <button className="hover:bg-surface-container transition-colors p-2 rounded-full active:opacity-80 active:scale-95">
        <span className="material-symbols-outlined text-[#272A6F]">qr_code_scanner</span>
      </button>
    </header>
  );
}
