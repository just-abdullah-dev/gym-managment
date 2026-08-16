'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type CheckInResult = {
  success: boolean;
  message: string;
  member?: any;
};

export async function processQRScan(qrToken: string): Promise<CheckInResult> {
  const supabase = await createClient();

  // 1. Find Member by ID (QR code contains member.id)
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*, gyms(*)')
    .eq('id', qrToken)
    .single();

  if (memberError || !member) {
    return { success: false, message: 'Invalid or unrecognized QR code.' };
  }

  if (member.status !== 'ACTIVE') {
    return { success: false, message: `Member is ${member.status.toLowerCase()}. Check-in denied.` };
  }
  
  if (!member.qr_active) {
    return { success: false, message: 'QR code has been deactivated.' };
  }

  const gymId = member.gym_id;

  // 2. Check Subscription
  // The member must have an ACTIVE subscription that covers today.
  const today = new Date().toISOString().split('T')[0];
  
  const { data: activeSub, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('member_id', member.id)
    .eq('status', 'ACTIVE')
    .lte('start_date', today)
    .gte('end_date', today)
    .single();

  if (subError || !activeSub) {
    return { success: false, message: 'No active subscription found for today.' };
  }

  // 3. Check Schedule
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const now = new Date();
  const dayOfWeek = now.getDay();
  // Get time in HH:mm:ss format
  const timeString = now.toTimeString().split(' ')[0];

  const { data: schedule, error: schedError } = await supabase
    .from('gym_schedules')
    .select('*')
    .eq('gym_id', gymId)
    .in('gender', [member.gender, 'MIXED'])
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .lte('start_time', timeString)
    .gte('end_time', timeString)
    .maybeSingle();

  if (!schedule) {
    return { success: false, message: `No active schedule found for ${member.gender} at this time.` };
  }

  // 4. Check Duplicate Check-in
  const { data: existingCheckin, error: checkinError } = await supabase
    .from('attendance')
    .select('*')
    .eq('member_id', member.id)
    .eq('attendance_date', today)
    .is('check_out', null)
    .maybeSingle();

  if (existingCheckin) {
    return { success: false, message: 'Member is already checked in.' };
  }

  // 5. Record Attendance
  const { error: insertError } = await supabase
    .from('attendance')
    .insert({
      gym_id: gymId,
      member_id: member.id,
      attendance_date: today,
    });

  if (insertError) {
    console.error('Attendance insert error:', insertError);
    return { success: false, message: 'Failed to record attendance due to server error.' };
  }

  revalidatePath('/dashboard');

  return { 
    success: true, 
    message: `Successfully checked in ${member.full_name}.`,
    member 
  };
}
