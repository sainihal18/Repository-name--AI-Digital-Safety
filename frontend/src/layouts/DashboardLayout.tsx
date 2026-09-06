import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  Search,
  History,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Menu,
  X,
  Lock,
  Scan,
  Terminal,
  Database,
  QrCode,
  Eye,
  Mail,
  Bot
} from 'lucide-react';
import { api } from '@/services/api';
import CyberBackground from '@/components/CyberBackground';
import cyberThreatPattern from '@/assets/cyber-threat-pattern.png';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analyze', icon: Search, label: 'Analyzer' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/threat-intel', icon: Globe, label: 'Threat Intel' },
  { to: '/password-checker', icon: Lock, label: 'Password Check' },
  { to: '/scanner', icon: Scan, label: 'Port Scanner' },
  { to: '/honeypot', icon: Terminal, label: 'Honeypot Live' },
  { to: '/vault', icon: Database, label: 'Secure Vault' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const proNavItems = [
  { to: '/analyze/email', icon: Mail, label: 'Email Analyzer' },
  { to: '/analyze/qr', icon: QrCode, label: 'QR Scanner' },
  { to: '/monitor/darkweb', icon: Eye, label: 'Dark Web Monitor' },
  { to: '/copilot', icon: Bot, label: 'Cyber Copilot' },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [health, setHealth] = useState<{ ok: boolean; checked: boolean }>({ ok: false, checked: false });
  const location = useLocation();

  // Health heartbeat
  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.health();
        setHealth({ ok: res.status === 'ok' || res.status === 'degraded', checked: true });
      } catch {
        setHealth({ ok: false, checked: true });
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background/90">
      <CyberBackground />
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col bg-surface/80 backdrop-blur-md border-r border-border
          transition-all duration-300 ease-in-out relative
          ${collapsed ? 'w-[72px]' : 'w-[260px]'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="absolute inset-0 opacity-10 mix-blend-screen pointer-events-none" style={{ backgroundImage: `url(${cyberThreatPattern})`, backgroundSize: '150px' }} />
        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-background" />
            </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-bold gradient-text whitespace-nowrap">AI Digital Safety</h1>
              <p className="text-[10px] text-slate-500 whitespace-nowrap">Analyze Before You Trust</p>
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </>
              )}
            </NavLink>
          ))}

          {/* PRO LABS Section */}
          {!collapsed && (
            <div className="px-4 py-2 mt-4 text-[10px] font-bold tracking-widest text-[#00FF9D] uppercase flex items-center justify-between border-t border-border pt-4">
              <span>Pro Labs</span>
              <div className="w-2 h-2 rounded-full bg-[#00FF9D] animate-ping" />
            </div>
          )}
          {collapsed && (
            <div className="mt-4 border-t border-border pt-4 flex justify-center">
              <div className="w-2 h-2 rounded-full bg-[#00FF9D] mt-2 shadow-[0_0_8px_#00FF9D]" title="Pro Labs" />
            </div>
          )}

          {proNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
                ${isActive
                  ? 'bg-[#00FF9D]/10 text-[#00FF9D] border border-[#00FF9D]/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator-pro"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#00FF9D] rounded-r-full shadow-[0_0_8px_#00FF9D]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#00FF9D]' : ''}`} />
                  {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Health indicator & collapse */}
        <div className="p-3 border-t border-border space-y-2 shrink-0">
          {/* Health */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {health.ok && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                !health.checked ? 'bg-slate-500' : health.ok ? 'bg-success' : 'bg-danger'
              }`} />
            </span>
            {!collapsed && (
              <span className="text-xs text-slate-500">
                {!health.checked ? 'Checking...' : health.ok ? 'API Online' : 'API Offline'}
              </span>
            )}
          </div>

          {/* Collapse button (desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-surface-hover transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-hover"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Threat Detection Platform v2.0</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
