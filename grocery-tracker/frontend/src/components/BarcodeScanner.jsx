import React, { useEffect, useRef } from 'react';
import Quagga from '@ericblade/quagga2';

const BarcodeScanner = ({ onScan }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: {
          width: 640,
          height: 480,
          facingMode: 'environment', // Will attempt to use rear camera
        },
      },
      decoder: {
        readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'code_128_reader']
      }
    }, (err) => {
      if (err) {
        console.error('Barcode scanner initialization failed: ', err);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((res) => {
      if (res && res.codeResult && res.codeResult.code) {
        onScan(res.codeResult.code);
        Quagga.stop();
      }
    });

    return () => {
      Quagga.stop();
    };
  }, [onScan]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-900 w-full aspect-video flex-shrink-0 border-2 border-emerald-500/50 shadow-inner group">
      <div ref={scannerRef} className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>canvas]:hidden" />
      <div className="absolute inset-0 border-4 border-primary/20 pointer-events-none rounded-xl"></div>
      
      {/* Laser scanner animation overlay */}
      <div className="absolute top-[10%] bottom-[10%] left-1/2 -ml-[1px] w-0.5 bg-red-500/80 shadow-[0_0_12px_red] animate-[scan_2s_ease-in-out_infinite_alternate]"></div>
      
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-white/50 bg-black/50 py-1 backdrop-blur-sm">
        Align barcode across the red laser line
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100px); }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
