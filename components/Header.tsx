'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Menu, LogOut, User, ChevronDown, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const supabase = createClient();
  const router = useRouter();
  
  const [gym, setGym] = useState<any>(null);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);

      // Fetch gym
      const { data: gymData } = await supabase
        .from('gyms')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (gymData) {
        setGym(gymData);
        
        // Fetch active members count
        const { count } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gymData.id)
          .eq('status', 'ACTIVE');
          
        setActiveMembersCount(count || 0);
      }
    };

    fetchData();

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="bg-black border-b border-white/10 h-16 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button 
          className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>

        {/* Gym Info */}
        {gym ? (
          <div className="flex items-center gap-3">
            {gym.logo_url ? (
              <img src={gym.logo_url} alt="Logo" className="w-8 h-8 rounded-sm object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center text-white font-light border border-white/20">
                {gym.name.charAt(0)}
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="font-light text-white tracking-wider leading-tight text-sm uppercase">{gym.name}</h1>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/50 font-medium">
                <Activity size={10} className="text-white/70" />
                <span>{activeMembersCount} Active</span>
              </div>
            </div>
          </div>
        ) : (
          <h1 className="text-sm font-light text-white tracking-widest hidden lg:block uppercase">SYSTEM</h1>
        )}
      </div>

      {/* User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 hover:bg-white/5 p-1.5 rounded-sm transition-colors border border-transparent hover:border-white/10 group"
        >
          <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center text-white/70 font-light border border-white/20 group-hover:text-white transition-colors">
            {user?.email?.charAt(0).toUpperCase() || <User size={16} />}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[10px] uppercase tracking-widest text-white/90 leading-tight">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[9px] uppercase tracking-widest text-white/40">Manager</p>
          </div>
          <ChevronDown size={14} className="text-white/40 hidden md:block group-hover:text-white transition-colors" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-sm shadow-xl border border-white/10 py-1 z-50">
            <div className="px-4 py-3 border-b border-white/10 md:hidden">
              <p className="text-[10px] uppercase tracking-widest text-white/90 truncate">{user?.email}</p>
            </div>
            <Link 
              href="/dashboard/settings"
              className="flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <User size={14} />
              Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest text-white/50 hover:bg-white/10 hover:text-white w-full text-left transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
