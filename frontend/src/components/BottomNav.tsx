import { NavLink } from "react-router-dom";
import { Home, ArrowLeftRight, PieChart, Settings } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Asosiy" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Harakatlar" },
  { to: "/stats", icon: PieChart, label: "Statistika" },
  { to: "/settings", icon: Settings, label: "Sozlamalar" },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <Icon size={21} strokeWidth={2} />
          <span>{label}</span>
          <span className="nav-dot" />
        </NavLink>
      ))}
    </nav>
  );
}
