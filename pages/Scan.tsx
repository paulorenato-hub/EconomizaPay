
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Image as ImageIcon, QrCode, ScanLine, CheckCircle2, Loader2, ShieldCheck, Camera, AlertTriangle } from 'lucide-react';
import { DB } from '../services/db';
import { useAuth } from '../context/AuthContext';

// Access the global variable from the CDN script
declare const Html5Qrcode: any;

export const Scan: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<'initializing' | 'scanning' | 'permission_denied' | 'processing' | 'success'>('initializing');
  const [errorMessage, setErrorMessage] = useState('');
  const [flash, setFlash] = useState(false);
  const [scannedContent, setScannedContent] = useState('');
  
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const timer = setTimeout(() => {
        if (mounted) {
            startCamera();
        }
    }, 800);

    return () => {
      mounted = false;
      clearTimeout(timer);
      cleanupScanner();
    };
  }, []);

  const cleanupScanner = async () => {
      if (html5QrCodeRef.current) {
        try {
            if (html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
            }
            html5QrCodeRef.current.clear();
        } catch (e) {
            // Ignorar erros de cleanup
        }
        html5QrCodeRef.current = null;
      }
  };

  const startCamera = async () => {
    setErrorMessage('');
    
    if (status === 'permission_denied' || status === 'success') {
        setStatus('initializing');
    }

    try {
        await cleanupScanner();

        const readerElement = document.getElementById('reader');
        if (!readerElement) throw new Error("Container do scanner não encontrado");

        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const config = { 
            fps: 15, 
            qrbox: { width: 250, height: 250 }, 
            aspectRatio: 1.0,
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        };
        
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config, 
          onScanSuccess, 
          onScanFailure
        );
        
        setStatus('scanning');

    } catch (err: any) {
        console.warn("Falha ao iniciar câmera:", err);
        let msg = "Não foi possível acessar a câmera.";
        
        const errStr = err.toString().toLowerCase();
        
        if (errStr.includes("notallowederror") || errStr.includes("permission denied")) {
            msg = "Acesso negado. Verifique as permissões do navegador.";
        } else if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            msg = "O acesso à câmera requer HTTPS.";
        }

        setErrorMessage(msg);
        setStatus('permission_denied');
    }
  };

  const onScanSuccess = (decodedText: string) => {
    if (html5QrCodeRef.current) {
        html5QrCodeRef.current.pause();
    }
    setScannedContent(decodedText);
    handleScanProcessing(decodedText);
  };

  const onScanFailure = () => {
    // Ignorar falhas de frame individual
  };

  const handleScanProcessing = async (content: string) => {
    setStatus('processing');
    try {
        console.log("Enviando scan:", content, "User:", user?.id);
        await DB.saveScan(content, user?.id);
        setStatus('success');
    } catch (error) {
        console.error("Erro ao salvar scan:", error);
        setErrorMessage("Erro de conexão. Tente novamente.");
        setStatus('permission_denied'); 
        cleanupScanner();
    }
  };

  const handleReset = async () => {
     setStatus('initializing');
     startCamera();
  };

  const handleTorch = async () => {
      setFlash(!flash);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-white font-bold text-xs tracking-widest uppercase">
          {status === 'processing' ? 'Enviando...' : 'Scanner QR'}
        </h2>
        <button 
          onClick={handleTorch}
          className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-colors ${flash ? 'bg-yellow-400 text-black' : 'bg-white/10 text-white'}`}
        >
          <Zap size={20} fill={flash ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
        <div id="reader" className={`w-full h-full object-cover ${status === 'success' ? 'opacity-20 blur-sm' : ''}`}></div>
        
        {status === 'initializing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-20">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-white font-bold text-lg">Iniciando câmera...</p>
            </div>
        )}

        {status === 'permission_denied' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/95 z-20 animate-in fade-in">
                <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
                    <AlertTriangle size={40} />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Ops!</h3>
                <p className="text-gray-400 text-sm mb-8">{errorMessage}</p>
                <button 
                    onClick={startCamera}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 py-4 rounded-2xl active:scale-95 transition-all shadow-lg flex items-center gap-2"
                >
                    <Camera size={20} />
                    Tentar Novamente
                </button>
            </div>
        )}

        {status === 'scanning' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
             <div className="relative w-72 h-72">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <div className="absolute left-6 right-6 h-1 bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,1)] rounded-full animate-[scan_2.5s_ease-in-out_infinite]"></div>
             </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative mb-6">
                <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" strokeWidth={3} />
                <QrCode className="absolute inset-0 m-auto text-white opacity-40" size={32} />
            </div>
            <h3 className="text-white text-xl font-black uppercase tracking-widest">Processando...</h3>
          </div>
        )}

        {status === 'success' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center bg-black/80 backdrop-blur-md p-6 animate-in slide-in-from-bottom-10">
            <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40">
                <CheckCircle2 className="text-white" size={48} />
            </div>
            <h3 className="text-white text-3xl font-black mb-2 tracking-tight">Sucesso!</h3>
            <div className="bg-white/10 rounded-xl p-4 mb-8 max-w-[280px]">
                <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1">Conteúdo Lido</p>
                <p className="text-white text-sm break-all font-mono">{scannedContent}</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
                <button onClick={handleReset} className="bg-emerald-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95">
                    Escanear Novo
                </button>
                <button onClick={() => navigate('/')} className="bg-white/10 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all active:scale-95">
                    Voltar
                </button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-12 left-0 right-0 text-center z-10 pointer-events-none px-10">
        <p className="text-white font-black text-lg mb-1 drop-shadow-2xl">Aponte para o QR Code</p>
      </div>
      
      <style>{`
        #reader video {
            object-fit: cover;
            width: 100% !important;
            height: 100% !important;
        }
      `}</style>
    </div>
  );
};
