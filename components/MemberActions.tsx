'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { MoreVertical, Edit, IdCard, Trash2 } from 'lucide-react';

interface MemberActionsProps {
  memberId: string;
}

export function MemberActions({ memberId }: MemberActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Also close on scroll to prevent the fixed menu from floating disconnected
    document.addEventListener('scroll', () => setIsOpen(false), true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', () => setIsOpen(false), true);
    };
  }, []);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button 
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-1 text-white/40 hover:text-white hover:bg-white/10 transition-colors rounded-sm focus:outline-none"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed w-48 bg-black/90 backdrop-blur-md rounded-sm shadow-xl border border-white/10 py-1 z-[100]"
          style={{ top: position.top, right: position.right }}
        >
          <Link 
            href={`/dashboard/members/${memberId}`}
            className="flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <IdCard size={14} />
            View Card
          </Link>
          <button 
            className="flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white w-full text-left transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Edit size={14} />
            Edit Details
          </button>
          <div className="border-t border-white/10 my-1"></div>
          <button 
            className="flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-widest text-red-500/80 hover:bg-red-500/10 hover:text-red-400 w-full text-left transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
