'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const regionId = "qr-reader";

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scannerRef.current && scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(regionId);
      }
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopCamera();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // html5-qrcode calls this frequently on failure to find a code in current frame
          // We ignore it to avoid spamming the console/UI, it's expected during scanning
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error(err);
      setError("Failed to start camera. Please ensure permissions are granted and you are on a secure context (HTTPS/localhost).");
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.getState() !== Html5QrcodeScannerState.NOT_STARTED) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner", err);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(regionId);
      }
      
      const decodedText = await scannerRef.current.scanFile(file, true);
      onScanSuccess(decodedText);
    } catch (err) {
      console.error(err);
      setError("Failed to decode QR code from the selected image.");
    } finally {
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-black/20 p-6 border border-white/10 backdrop-blur-md flex flex-col items-center">
      <div className="w-full max-w-sm mb-4 relative min-h-[250px] bg-white/5 border border-white/10 rounded-sm overflow-hidden flex items-center justify-center">
        {/* The container for the camera feed - MUST remain completely empty for html5-qrcode */}
        <div id={regionId} className="w-full h-full z-10 absolute inset-0"></div>
        
        {/* React controlled placeholder, overlaying the empty container when inactive */}
        {!isScanning && (
          <div className="text-white/40 flex flex-col items-center gap-3 p-6 text-center z-20 absolute inset-0 bg-black/40 backdrop-blur-sm justify-center">
            <Camera size={48} className="opacity-50" />
            <p className="text-[10px] uppercase tracking-widest font-medium text-white/70">Camera Offline</p>
            <p className="text-[9px] uppercase tracking-wider text-white/30 mt-1">Start camera or upload an image to scan</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 flex gap-3 text-red-200 backdrop-blur-md rounded-sm w-full max-w-sm">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span className="text-xs uppercase tracking-widest font-semibold">{error}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center w-full max-w-sm">
        {isScanning ? (
          <Button variant="outline" onClick={stopCamera} className="flex-1">
            Stop Camera
          </Button>
        ) : (
          <Button onClick={startCamera} className="flex-1 gap-2">
            <Camera size={18} />
            Start Camera
          </Button>
        )}
        
        <div className="flex-1 relative">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button 
            variant="outline" 
            fullWidth 
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={18} />
            Upload Image
          </Button>
        </div>
      </div>
    </div>
  );
}
