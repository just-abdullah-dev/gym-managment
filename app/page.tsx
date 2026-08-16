import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8">
      <h1 className="text-3xl font-bold">GymSync Dashboard</h1>
      <p className="mt-4">Redirecting...</p>
    </div>
  );
}
