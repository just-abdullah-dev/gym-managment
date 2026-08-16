import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { MemberActions } from '@/components/MemberActions';

export default async function MembersPage() {
  const supabase = await createClient();
  
  // Fetch members with basic info
  const { data: members, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Members</h1>
          <p className="text-white/50 text-xs tracking-wide">MANAGE GYM PARTICIPANTS AND ACCESS</p>
        </div>
        <Link href="/dashboard/members/new">
          <Button className="gap-2">
            <Plus size={18} />
            Register Member
          </Button>
        </Link>
      </div>

      <div className="bg-black/20 rounded-sm border border-white/10 backdrop-blur-md overflow-hidden flex flex-col">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH MEMBERS..." 
              className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 placeholder-white/30 uppercase tracking-widest transition-colors"
            />
          </div>
          <select className="bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer">
            <option value="ALL">ALL STATUSES</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/50 text-[10px] uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Member ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Gender</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80 font-light">
              {error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-400 uppercase tracking-widest text-xs">
                    Failed to load members.
                  </td>
                </tr>
              ) : members?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50 uppercase tracking-widest text-xs">
                    No members found.
                  </td>
                </tr>
              ) : (
                members?.map((member) => (
                  <tr key={member.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white font-medium tracking-wide">{member.member_number}</td>
                    <td className="px-6 py-4">{member.full_name}</td>
                    <td className="px-6 py-4">{member.phone || '-'}</td>
                    <td className="px-6 py-4 uppercase text-[10px] tracking-widest">{member.gender}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-semibold border ${
                        member.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        member.status === 'SUSPENDED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-white/10 text-white/60 border-white/10'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <MemberActions memberId={member.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
