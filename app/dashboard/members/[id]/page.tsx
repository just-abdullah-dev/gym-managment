'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/Button';
import { Printer, ArrowLeft, Edit, Download } from 'lucide-react';
import Link from 'next/link';

export default function MemberCardPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [member, setMember] = useState<any>(null);
  const [gym, setGym] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      
      const { data: memberData, error } = await supabase
        .from('members')
        .select('*, gyms(*)')
        .eq('id', id as string)
        .single();
        
      if (!error && memberData) {
        setMember(memberData);
        setGym(memberData.gyms);
      }
      setLoading(false);
    };
    
    fetchMember();
  }, [id, supabase]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading member details...</div>;
  }

  if (!member) {
    return <div className="p-8 text-center text-red-500">Member not found.</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async (ref: React.RefObject<HTMLDivElement | null>, side: 'front' | 'back') => {
    if (ref.current) {
      const canvas = await html2canvas(ref.current, { backgroundColor: null });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `member-${member.member_number}-${side}.png`;
      link.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Non-printable Header Area */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/members')} className="p-2 border-white/10 text-white/50 hover:bg-white/10 hover:text-white">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-light text-white tracking-widest uppercase mb-1">Member Card</h1>
            <p className="text-white/50 text-xs tracking-wide uppercase">PRINT OR SAVE AS PDF</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2">
            <Edit size={18} />
            Edit Member
          </Button>
          <Button variant="outline" onClick={() => handleDownloadImage(frontRef, 'front')} className="gap-2">
            <Download size={18} />
            Front
          </Button>
          <Button variant="outline" onClick={() => handleDownloadImage(backRef, 'back')} className="gap-2">
            <Download size={18} />
            Back
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer size={18} />
            Print Card
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: white !important;
          }
          @page {
            size: auto;
            margin: 0;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>

      {/* Printable Area */}
      <div id="print-section" className="flex flex-col items-center justify-center p-8 bg-black/20 border border-white/10 backdrop-blur-md rounded-sm print:bg-white print:border-none print:p-0 print:block">
        
        <div className="flex flex-col sm:flex-row gap-8 justify-center w-full print:block">
          
          {/* Card Front */}
          <div className="print:flex print:justify-center print:items-center print:w-full print:h-screen page-break">
            <div ref={frontRef} className="w-[300px] h-[480px] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col items-center bg-[#2d2d2d] text-white">
            {/* Background design elements */}
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 border-[20px] border-[#aaff2b] rounded-full opacity-80"></div>
            <div className="absolute bottom-[-60px] right-[-40px] w-56 h-56 bg-gray-500 rounded-full mix-blend-overlay opacity-30"></div>
            <div className="absolute bottom-4 left-6 w-16 h-16 bg-[#aaff2b] rounded-full opacity-90"></div>
            
            <div className="z-10 w-full flex flex-col items-center pt-8 px-6">
              <h2 className="text-3xl font-black italic tracking-wider uppercase mb-1">{gym?.name || 'GYM'}</h2>
              <p className="text-[#aaff2b] text-xs font-bold tracking-widest uppercase mb-8">Sport Center</p>
              
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden mb-6 bg-gray-200">
                {member.profile_image_url ? (
                  <img src={member.profile_image_url} alt={member.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-3xl">
                    {member.full_name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="bg-[#aaff2b] text-[#2d2d2d] w-full text-center py-2 -mx-6 mb-2">
                <h3 className="text-xl font-black uppercase tracking-wide truncate px-4">{member.full_name}</h3>
              </div>
              <p className="text-[#aaff2b] text-sm font-semibold tracking-wider uppercase mb-8">
                {member.status} MEMBER
              </p>
              
              <div className="mt-auto pb-8 text-center text-gray-300 text-xs tracking-wider font-light w-full">
                <p>ID {member.member_number}</p>
                <p className="truncate">{member.phone || member.gender}</p>
              </div>
            </div>
          </div>
          </div>

          {/* Card Back */}
          <div className="print:flex print:justify-center print:items-center print:w-full print:h-screen">
            <div ref={backRef} className="w-[300px] h-[480px] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col items-center bg-[#2d2d2d] text-white">
            {/* Background design elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border-[30px] border-[#aaff2b] rounded-full opacity-20"></div>
            <div className="absolute top-[-30px] right-[-30px] w-32 h-32 bg-gray-500 rounded-full mix-blend-overlay opacity-30"></div>
            <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-40 h-40 bg-[#aaff2b] rounded-full opacity-90 rounded-b-none"></div>

            <div className="z-10 w-full h-full flex flex-col items-center justify-center p-8">
              
              <div className="bg-white p-4 rounded-xl shadow-lg mb-8">
                <QRCodeSVG 
                  value={member.id}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <h2 className="text-3xl font-black italic tracking-wider uppercase mb-1">{gym?.name || 'GYM'}</h2>
              <p className="text-[#aaff2b] text-xs font-bold tracking-widest uppercase mb-4">Sport Center</p>
              
              <p className="text-center text-xs text-gray-400 leading-relaxed px-4">
                This card is the property of {gym?.name || 'the gym'}. Must be presented for access. Non-transferable.
              </p>
            </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
