import { NavLink } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const navItems = [
  { icon: "grid_view", path: "/home", label: "Home" },
  { icon: "auto_stories", path: "/academics", label: "LMS" },
  { icon: "campaign", path: "/notices", label: "Notices" },
  { icon: "forum", path: "/chats", label: "Chats" },
  { icon: "person", path: "/profile", label: "Profile" },
];

export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,24px))] bg-white/80 backdrop-blur-md z-50 rounded-t-[2rem] shadow-[0px_-12px_32px_rgba(39,42,111,0.06)]">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn(
            "relative flex items-center justify-center transition-all duration-300 p-3 hover:scale-110 active:scale-90",
            isActive ? "text-[#272A6F]" : "text-on-surface-variant"
          )}
        >
          {({ isActive }) => (
            <>
              <span 
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              {isActive && item.icon === "home" && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
              )}
              {isActive && item.icon === "chat_bubble" && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
