'use client';

import React, { useState } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { processQRScan, CheckInResult } from './actions';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanSuccess = async (decodedText: string) => {
    // Avoid double processing
    if (isProcessing) return;
    
    setIsProcessing(true);
    setResult(null);

    try {
      // the scanned text should be the qr_token (UUID)
      const res = await processQRScan(decodedText.trim());
      setResult(res);
    } catch (err) {
      console.error(err);
      setResult({ success: false, message: 'An unexpected error occurred during processing.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview and quick actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Check-in Module */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Check-in</h2>
          
          <QRScanner onScanSuccess={handleScanSuccess} />

          {/* Result Display */}
          {isProcessing && (
            <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={20} />
              <span>Processing check-in...</span>
            </div>
          )}

          {!isProcessing && result && (
            <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
              result.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {result.success ? (
                <CheckCircle2 className="shrink-0 mt-0.5" size={24} />
              ) : (
                <XCircle className="shrink-0 mt-0.5" size={24} />
              )}
              
              <div className="flex flex-col">
                <span className="font-bold text-lg">
                  {result.success ? 'Check-in Approved' : 'Check-in Denied'}
                </span>
                <span className="mt-1 opacity-90">{result.message}</span>
                {result.member && (
                  <div className="mt-3 p-3 bg-white/50 rounded-lg text-sm space-y-1">
                    <p><span className="font-semibold">Name:</span> {result.member.full_name}</p>
                    <p><span className="font-semibold">ID:</span> {result.member.member_number}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mini Stats (Placeholder for now) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Overview</h2>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
            <span className="text-gray-500 text-sm font-medium">Checked In</span>
            <span className="text-3xl font-bold text-gray-900">--</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
            <span className="text-gray-500 text-sm font-medium">Active Members</span>
            <span className="text-3xl font-bold text-gray-900">--</span>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-1">
            <span className="text-gray-500 text-sm font-medium">Violations</span>
            <span className="text-3xl font-bold text-gray-900">--</span>
          </div>
        </div>
      </div>
    </div>
  );
}
