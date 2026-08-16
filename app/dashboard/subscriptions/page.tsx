import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/Button';
import { Plus, Search, MoreVertical } from 'lucide-react';

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  
  // Fetch subscriptions with member info
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*, members(full_name, member_number)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Subscriptions</h1>
          <p className="text-white/50 text-xs tracking-wide uppercase">MANAGE PLANS AND PAYMENTS</p>
        </div>
        <Link href="/dashboard/subscriptions/new">
          <Button className="gap-2">
            <Plus size={18} />
            New Subscription
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
              placeholder="SEARCH BY PLAN OR MEMBER..." 
              className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-sm text-sm text-white font-light focus:outline-none focus:border-white/50 placeholder-white/30 uppercase tracking-widest transition-colors"
            />
          </div>
          <select className="bg-black/40 border border-white/10 rounded-sm px-4 py-3 text-sm text-white font-light focus:outline-none focus:border-white/50 uppercase tracking-widest transition-colors appearance-none cursor-pointer">
            <option value="ALL">ALL STATUSES</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Subscriptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-white/50 text-[10px] uppercase tracking-widest border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Plan Name</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80 font-light">
              {error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-400 uppercase tracking-widest text-xs">
                    Failed to load subscriptions.
                  </td>
                </tr>
              ) : subscriptions?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-white/50 uppercase tracking-widest text-xs">
                    No subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions?.map((sub) => {
                  const member = sub.members as unknown as { full_name: string, member_number: string };
                  return (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{member?.full_name}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40">{member?.member_number}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{sub.plan_name}</td>
                      <td className="px-6 py-4">
                        <div className="text-white text-[10px] tracking-widest uppercase">{sub.start_date}</div>
                        <div className="text-[9px] text-white/40 tracking-widest uppercase">TO {sub.end_date}</div>
                      </td>
                      <td className="px-6 py-4 font-medium tracking-wide">PKR {sub.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-semibold border ${
                          sub.payment_status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          sub.payment_status === 'UNPAID' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {sub.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-sm text-[9px] uppercase tracking-widest font-semibold border ${
                          sub.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          'bg-white/10 text-white/60 border-white/10'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded-sm transition-colors">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
