import { NavLink } from 'react-router-dom';
import { Briefcase, Users, ClipboardList, Waves, LayoutDashboard } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import logo from '@/assets/talentflow-logo.png';

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Jobs', icon: Briefcase, path: '/jobs' },
  { title: 'Candidates', icon: Users, path: '/candidates' },
  { title: 'Assessments', icon: ClipboardList, path: '/assessments' },
];

export function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useStore();

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? '80px' : '260px',
      }}
      className="relative flex flex-col border-r border-border bg-sidebar transition-all duration-300"
    >
      {/* Header with Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <img src={logo} alt="TalentFlow" className="w-8 h-8" />
            <span className="font-bold text-lg bg-gradient-flow bg-clip-text text-transparent">
              TalentFlow
            </span>
          </motion.div>
        )}
        {sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center w-full"
          >
            <img src={logo} alt="TalentFlow" className="w-8 h-8" />
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-flow text-white shadow-flow'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover-glow'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {item.title}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="p-3 border-t border-sidebar-border">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all hover-glow"
        >
          <Waves className="h-5 w-5" />
          {!sidebarCollapsed && <span>Collapse</span>}
        </motion.button>
      </div>

      {/* Version */}
      {!sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 text-xs text-muted-foreground text-center"
        >
          TalentFlow v1.0
        </motion.div>
      )}
    </motion.aside>
  );
}
