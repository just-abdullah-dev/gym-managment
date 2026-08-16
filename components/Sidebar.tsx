'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Settings, 
  LogOut,
  X,
  Dumbbell,
  ClipboardList
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isSidebarOpen, setIsSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Check In', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Attendance', href: '/dashboard/attendance', icon: <ClipboardList size={20} /> },
    { name: 'My GYM', href: '/dashboard/my-gym', icon: <Dumbbell size={20} /> },
    { name: 'Members', href: '/dashboard/members', icon: <Users size={20} /> },
    { name: 'Subscriptions', href: '/dashboard/subscriptions', icon: <CreditCard size={20} /> },
    { name: 'Violations', href: '/dashboard/violations', icon: <AlertTriangle size={20} /> },
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-black border-r border-white/10 transform transition-transform duration-200 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-light text-white tracking-widest">SYSTEM</h1>
          <button 
            className="lg:hidden text-white/50 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            // Precise active link logic
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-300
                  ${isActive 
                    ? 'bg-white/10 text-white font-semibold border-l-2 border-white' 
                    : 'text-white/50 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button 
            variant="outline" 
            fullWidth 
            className="justify-start gap-3 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
