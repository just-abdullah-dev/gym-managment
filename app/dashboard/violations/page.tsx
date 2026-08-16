import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { Plus, Search, MoreVertical, ShieldAlert } from 'lucide-react';

export default async function ViolationsPage() {
  const supabase = await createClient();
  
  // Fetch violations with member info
  const { data: violations, error } = await supabase
    .from('violations')
    .select(`
      *,
      members (
        full_name,
        member_number
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Violations & Fines</h1>
          <p className="text-white/50 text-xs tracking-wide uppercase">TRACK DISCIPLINARY ACTIONS</p>
        </div>
        <Link href="/dashboard/violations/new">
          <Button className="gap-2">
            <Plus size={18} />
            Record Violation
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
              placeholder="SEARCH BY MEMBER OR TYPE..." 
              className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 placeholder-white/30 uppercase tracking-widest transition-colors"
            />
          </div>
          <select className="bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer">
            <option value="ALL">ALL STATUSES</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
            <option value="WAIVED">WAIVED</option>
          </select>
        </div>

        {/* Violations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/50 text-[10px] uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Fine Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80 font-light">
              {error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-400 flex flex-col items-center justify-center gap-2 uppercase tracking-widest text-xs">
                    <ShieldAlert size={20} />
                    FAILED TO LOAD: {error.message}
                  </td>
                </tr>
              ) : violations?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50 uppercase tracking-widest text-xs">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <ShieldAlert size={24} className="text-white/20" />
                      <p>NO VIOLATIONS RECORDED.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                violations?.map((violation) => (
                  <tr key={violation.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{violation.members?.full_name || 'Unknown'}</div>
                      <div className="text-[10px] uppercase tracking-widest text-white/40">{violation.members?.member_number}</div>
                    </td>
                    <td className="px-6 py-4 text-[10px] uppercase tracking-widest text-white/70">{violation.type}</td>
                    <td className="px-6 py-4 font-medium tracking-wide text-white">
                      ${Number(violation.fine_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-semibold border ${
                        violation.fine_status === 'UNPAID' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        violation.fine_status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        'bg-white/10 text-white/60 border-white/10'
                      }`}>
                        {violation.fine_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/50 text-[10px] tracking-widest uppercase">
                      {new Date(violation.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-sm transition-colors">
                        <MoreVertical size={16} />
                      </button>
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
