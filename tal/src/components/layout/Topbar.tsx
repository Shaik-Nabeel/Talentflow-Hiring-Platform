import { Search, Bell, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/store/useStore';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export function Topbar() {
  const { searchQuery, setSearchQuery } = useStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search talents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-border/50 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl hover-glow relative overflow-hidden"
          >
            <motion.div
              initial={false}
              animate={{
                rotate: theme === 'dark' ? 180 : 0,
                scale: theme === 'dark' ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="absolute"
            >
              <Sun className="h-5 w-5" />
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                rotate: theme === 'dark' ? 0 : -180,
                scale: theme === 'dark' ? 0 : 1,
              }}
              transition={{ duration: 0.3 }}
              className="absolute"
            >
              <Moon className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <BellButton />
        </motion.div>

        <ProfileMenu />
      </div>
    </header>
  );
}

function ProfileMenu() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    db.profile?.get('main').then((p) => setProfile(p));
  }, []);

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U';

  const handleLogout = async () => {
    // clear profile and settings for now
    await db.profile?.delete('main');
    await db.settings?.delete('main');
    navigate('/dashboard');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="ghost" size="icon" className="rounded-full hover-glow p-0 w-10 h-10">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">{initials}</div>
            )}
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <div className="px-3 py-2">
          <div className="font-medium">{profile?.name}</div>
          <div className="text-xs text-muted-foreground">{profile?.email}</div>
        </div>
        <DropdownMenuItem onSelect={() => navigate('/profile')}>Profile</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/settings')}>Settings</DropdownMenuItem>
        <DropdownMenuItem onSelect={handleLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BellButton() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const items = await db.notifications?.toArray();
      setCount(items ? items.filter((i:any)=>!i.read).length : 0);
    };
    load();
  }, []);

  return (
    <Button variant="ghost" size="icon" className="rounded-xl hover-glow" onClick={() => navigate('/notifications')}>
      <div className="relative">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">{count}</span>
        )}
      </div>
    </Button>
  );
}
