'use client';

import React, { useState } from 'react';
import { Wand2, Video, Image as ImageIcon, Loader2, Upload, AlertCircle, CheckCircle, Monitor, Smartphone, Briefcase } from 'lucide-react';
import { editImage, generateVideo } from '@/services/geminiService';
import { useAppStore } from '@/lib/store';

type Mode = 'edit' | 'animate';
type AspectRatio = '16:9' | '9:16';

export const MediaStudio: React.FC = () => {
  const { hasKey, checkKey } = useAppStore();
  const [mode, setMode] = useState<Mode>('edit');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setResultUrl(null); // Reset result
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConnectKey = async () => {
      try {
        const win = window as any;
        if (win.aistudio?.openSelectKey) {
            await win.aistudio.openSelectKey();
            // Wait a moment for the state to propagate
            setTimeout(() => {
                checkKey();
            }, 1000);
        } else {
            setError("API Key selection is not available in this environment.");
        }
      } catch (err) {
          console.error(err);
          setError("Failed to open API key dialog.");
      }
  };

  const handleGenerate = async () => {
    if (!hasKey) {
        await handleConnectKey();
        return;
    }

    if (!selectedFile || !previewUrl) return;

    setIsProcessing(true);
    setError(null);
    setResultUrl(null);

    try {
      if (mode === 'edit') {
        // Gemini 2.5 Flash Image
        const editedImage = await editImage(previewUrl, prompt);
        setResultUrl(editedImage);
      } else {
        // Veo 3.1 Video
        const videoUrl = await generateVideo(previewUrl, prompt, aspectRatio);
        setResultUrl(videoUrl);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during generation.");
      // If 404 or API key issue, might need to reset
      if (err.message?.includes('Requested entity was not found')) {
         await handleConnectKey();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Capstone Project</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Portfolio Asset Studio</h1>
            <p className="text-stone-500 text-lg font-light max-w-2xl">
                Create professional visuals for your "HomeProtect" final presentation. 
                Employers look for polish. Use Generative AI to make your project stand out.
            </p>
        </div>
      </div>

      {!hasKey && (
        <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between shadow-lg gap-4">
           <div className="flex items-center gap-4 text-white">
             <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
                 <AlertCircle size={20} />
             </div>
             <div>
                 <p className="font-bold">Unlock Creative Suite</p>
                 <p className="text-stone-400 text-sm">Connect your API Key to use Gemini Flash Image & Veo Video.</p>
             </div>
           </div>
           <button 
             onClick={handleConnectKey}
             className="bg-white text-charcoal hover:bg-stone-100 px-6 py-3 rounded-full text-sm font-bold transition whitespace-nowrap w-full sm:w-auto"
           >
             Connect Key
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] p-8 shadow-xl shadow-stone-200/50 border border-stone-100 flex flex-col h-auto">
          
          {/* Mode Toggle */}
          <div className="flex p-1 bg-stone-100 rounded-xl mb-8">
             <button 
               onClick={() => setMode('edit')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'edit' ? 'bg-white text-charcoal shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
             >
               <ImageIcon size={16} />
               Refine Asset
             </button>
             <button 
               onClick={() => setMode('animate')}
               className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${mode === 'animate' ? 'bg-white text-charcoal shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
             >
               <Video size={16} />
               Generate Promo
             </button>
          </div>

          {/* Upload */}
          <div className="mb-8">
            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
              1. Source Material
            </label>
            <div className="relative border-2 border-dashed border-stone-200 rounded-2xl p-8 hover:border-rust hover:bg-rust/5 transition-colors text-center cursor-pointer bg-stone-50">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3 text-stone-500">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                    <Upload size={20} />
                </div>
                <span className="text-sm font-medium">Upload Logo or Screenshot</span>
              </div>
            </div>
            {selectedFile && (
               <div className="mt-3 flex items-center gap-2 text-sm text-forest font-medium bg-forest/5 p-3 rounded-lg border border-forest/10">
                 <CheckCircle size={16} />
                 {selectedFile.name}
               </div>
            )}
          </div>

          {/* Aspect Ratio for Video */}
          {mode === 'animate' && (
             <div className="mb-8">
               <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                 2. Format
               </label>
               <div className="flex gap-3">
                 <button
                   onClick={() => setAspectRatio('16:9')}
                   className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${aspectRatio === '16:9' ? 'border-rust bg-rust/5 text-rust' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}
                 >
                    <Monitor size={24} className="mb-2" />
                    <span className="text-xs font-bold">Presentation (16:9)</span>
                 </button>
                 <button
                   onClick={() => setAspectRatio('9:16')}
                   className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${aspectRatio === '9:16' ? 'border-rust bg-rust/5 text-rust' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}
                 >
                    <Smartphone size={24} className="mb-2" />
                    <span className="text-xs font-bold">Mobile (9:16)</span>
                 </button>
               </div>
             </div>
          )}

          {/* Prompt */}
          <div className="mb-8 flex-1">
             <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
               3. Vision
             </label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder={mode === 'edit' ? "e.g. 'Make this logo look like a modern tech startup, sleek, minimalist, on a dark background'" : "e.g. 'Cinematic drone shot zooming out from this house, sunset lighting, 4k resolution'"}
               className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rust focus:border-transparent outline-none resize-none text-sm leading-relaxed placeholder-stone-400"
             />
             <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                <Wand2 size={12} />
                <span>Powered by {mode === 'edit' ? 'Gemini 2.5' : 'Veo 3.1'}</span>
             </div>
          </div>

          {/* Action */}
          <button 
            onClick={handleGenerate}
            disabled={!selectedFile || !prompt || isProcessing || !hasKey}
            className="w-full bg-charcoal hover:bg-rust disabled:bg-stone-200 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Rendering Asset...
              </>
            ) : (
              <>
                {mode === 'edit' ? 'Enhance Image' : 'Generate Video'}
              </>
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8 bg-stone-100 rounded-[2rem] p-2 overflow-hidden relative min-h-[500px] flex flex-col">
          <div className="flex-1 bg-white rounded-[1.5rem] shadow-inner border border-stone-200 flex items-center justify-center p-8 overflow-hidden">
            {isProcessing ? (
               <div className="text-center">
                  <div className="w-20 h-20 border-4 border-stone-100 border-t-rust rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Generating Assets</h3>
                  <p className="text-stone-500 font-medium">AI is visualizing your prompt...</p>
                  {mode === 'animate' && <p className="text-xs text-stone-400 mt-4 bg-stone-50 px-3 py-1 rounded-full inline-block">Estimated time: 45-60s</p>}
               </div>
            ) : resultUrl ? (
               <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className={`relative rounded-lg overflow-hidden shadow-2xl ${aspectRatio === '9:16' && mode === 'animate' ? 'h-full aspect-[9/16]' : 'w-full aspect-video'}`}>
                     {mode === 'animate' ? (
                       <video controls autoPlay loop className="w-full h-full object-cover">
                          <source src={resultUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                       </video>
                     ) : (
                       <img src={resultUrl} alt="Result" className="w-full h-full object-contain bg-stone-900" />
                     )}
                  </div>
                  <div className="mt-8 flex gap-4">
                     <a href={resultUrl} download={`homeprotect-asset-${Date.now()}.${mode === 'animate' ? 'mp4' : 'png'}`} className="px-8 py-3 bg-charcoal text-white rounded-full font-bold hover:bg-rust transition-colors shadow-lg">
                       Download for Portfolio
                     </a>
                     <button onClick={() => setResultUrl(null)} className="px-8 py-3 text-stone-500 hover:text-charcoal font-bold transition">
                       Discard
                     </button>
                  </div>
               </div>
            ) : previewUrl ? (
               <div className="relative w-full h-full flex items-center justify-center">
                  <img src={previewUrl} alt="Original Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-sm opacity-50 grayscale" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-full text-sm font-bold text-charcoal shadow-lg">
                        Original Source
                     </div>
                  </div>
               </div>
            ) : (
               <div className="text-center text-stone-300">
                  <div className="w-24 h-24 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-stone-200">
                    <Briefcase size={40} />
                  </div>
                  <p className="text-lg font-serif">Your canvas is empty.</p>
                  <p className="text-sm">Upload an asset to start building.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};