import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Package, MapPin, Wallet, LayoutDashboard, LogOut, Truck } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/orders", label: "Orders", icon: Package },
    { to: "/admin/tracking", label: "Live Tracking", icon: MapPin },
  ];

  const riderLinks = [
    { to: "/rider", label: "My Deliveries", icon: Truck },
    { to: "/rider/earnings", label: "Earnings", icon: Wallet },
  ];

  const links = user?.role === "admin" ? adminLinks : riderLinks;

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-xl shadow-soft">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-slate-800 tracking-tight">
                Dispatch<span className="text-primary-600">Hub</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.to)
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize leading-tight">
                {user?.role} {user?.storeName ? `· ${user.storeName}` : ""}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile links */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  isActive(link.to)
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
