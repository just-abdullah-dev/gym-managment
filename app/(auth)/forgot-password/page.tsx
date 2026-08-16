import React from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h2>
        <p className="text-gray-500">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form className="flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="manager@facility.com"
          icon={<Mail size={18} />}
          required
        />

        <Button type="submit" fullWidth className="mt-2">
          Send Reset Link <Send size={16} />
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-brand-primary hover:text-brand-primary-hover flex items-center justify-center gap-1 mt-2">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </>
  );
}
