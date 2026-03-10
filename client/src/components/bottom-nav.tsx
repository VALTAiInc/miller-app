import { useLocation } from "wouter";
import { Home, MessageCircle, BookOpen, Wrench, ClipboardList } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/talk", label: "Talk", icon: MessageCircle },
  { path: "/blueprints", label: "Reference", icon: BookOpen },
  { path: "/procedures", label: "Procedures", icon: Wrench },
  { path: "/job-log", label: "Log", icon: ClipboardList },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-[#1a1a1a] z-40"
      data-testid="nav-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[52px] ${
                isActive
                  ? "text-[#006bae]"
                  : "text-[#555] hover:text-[#888]"
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
