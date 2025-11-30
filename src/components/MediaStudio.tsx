'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Wand2, Video, Image as ImageIcon, Loader2, Upload, AlertCircle, CheckCircle, Monitor, Smartphone, Briefcase, TrendingUp, Sparkles } from 'lucide-react';
import { editImage, generateVideo } from '@/services/geminiService';
import { useAppStore } from '@/lib/store';
import { useAcademyStore, useBiometric } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './academy/BiometricBackground';
import { cn } from '@/lib/utils';

type Mode = 'edit' | 'animate';
type AspectRatio = '16:9' | '9:16';

export const MediaStudio: React.FC = () => {
  const { hasKey, checkKey } = useAppStore();
  const { streakDays } = useAcademyStore();
  const { state, theme, statusMessage } = useBiometric();
  const [mode, setMode] = useState<Mode>('edit');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assetsCreated, setAssetsCreated] = useState(0);

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
      const win = window as unknown as { aistudio?: { openSelectKey?: () => Promise<void> } };
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
      setAssetsCreated(prev => prev + 1);
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred during generation.";
      setError(errorMessage);
      // If 404 or API key issue, might need to reset
      if (errorMessage.includes('Requested entity was not found')) {
        await handleConnectKey();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in pt-4 pb-12">

      {/* ============================================
          HERO HEADER - Mission Control Style
          ============================================ */}
      <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b-2 border-charcoal-100">
        <div>
          {/* Biometric Status */}
          <div className="mb-4">
            <BiometricStatusIndicator state={state} statusMessage={statusMessage} />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-heading font-black text-charcoal-900 mb-4 tracking-tight leading-none">
            Portfolio<br />Studio
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;Create professional visuals for your capstone project. Make your portfolio stand out.&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Assets Created - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {assetsCreated}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Assets Created
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>This session</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Mode</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-heading font-bold text-charcoal-900">
                    {mode === 'edit' ? 'Image Refine' : 'Video Generate'}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-charcoal-100">
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Streak Days</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-charcoal-700">
                    {streakDays}
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-body">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Warning */}
      {!hasKey && (
        <div
          className="p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-2"
          style={{
            background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
            borderColor: theme.gradientFrom,
          }}
        >
          <div className="flex items-center gap-4 text-white">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="font-heading font-bold">Unlock Creative Suite</p>
              <p className="text-white/70 text-sm font-body">Connect your API Key to use Gemini Flash Image & Veo Video.</p>
            </div>
          </div>
          <button
            onClick={handleConnectKey}
            className="bg-white text-charcoal-900 hover:bg-charcoal-100 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition whitespace-nowrap w-full sm:w-auto font-body"
          >
            Connect Key
          </button>
        </div>
      )}

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-8 shadow-elevation-sm border-2 border-charcoal-100 flex flex-col h-auto">

          {/* Mode Toggle */}
          <div className="flex p-1 bg-charcoal-100 rounded-xl mb-8">
            <button
              onClick={() => setMode('edit')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all font-body",
                mode === 'edit' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500 hover:text-charcoal-700'
              )}
            >
              <ImageIcon size={16} />
              Refine Asset
            </button>
            <button
              onClick={() => setMode('animate')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all font-body",
                mode === 'animate' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500 hover:text-charcoal-700'
              )}
            >
              <Video size={16} />
              Generate Promo
            </button>
          </div>

          {/* Upload */}
          <div className="mb-8">
            <label className="block text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-3 font-body">
              1. Source Material
            </label>
            <div className="relative border-2 border-dashed border-charcoal-200 rounded-2xl p-8 hover:border-charcoal-400 hover:bg-charcoal-50 transition-colors text-center cursor-pointer bg-charcoal-50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-3 text-charcoal-500">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-charcoal-100">
                  <Upload size={20} />
                </div>
                <span className="text-sm font-medium font-body">Upload Logo or Screenshot</span>
              </div>
            </div>
            {selectedFile && (
              <div className="mt-3 flex items-center gap-2 text-sm text-forest-700 font-medium bg-forest-50 p-3 rounded-xl border border-forest-100 font-body">
                <CheckCircle size={16} />
                {selectedFile.name}
              </div>
            )}
          </div>

          {/* Aspect Ratio for Video */}
          {mode === 'animate' && (
            <div className="mb-8">
              <label className="block text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-3 font-body">
                2. Format
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    aspectRatio === '16:9' ? 'border-charcoal-900 bg-charcoal-50 text-charcoal-900' : 'border-charcoal-100 text-charcoal-400 hover:border-charcoal-200'
                  )}
                >
                  <Monitor size={24} className="mb-2" />
                  <span className="text-xs font-bold font-body">Presentation (16:9)</span>
                </button>
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                    aspectRatio === '9:16' ? 'border-charcoal-900 bg-charcoal-50 text-charcoal-900' : 'border-charcoal-100 text-charcoal-400 hover:border-charcoal-200'
                  )}
                >
                  <Smartphone size={24} className="mb-2" />
                  <span className="text-xs font-bold font-body">Mobile (9:16)</span>
                </button>
              </div>
            </div>
          )}

          {/* Prompt */}
          <div className="mb-8 flex-1">
            <label className="block text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-3 font-body">
              {mode === 'animate' ? '3' : '2'}. Vision
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === 'edit' ? "e.g. 'Make this logo look like a modern tech startup, sleek, minimalist, on a dark background'" : "e.g. 'Cinematic drone shot zooming out from this house, sunset lighting, 4k resolution'"}
              className="w-full h-32 p-4 bg-charcoal-50 border-2 border-charcoal-100 rounded-xl focus:border-charcoal-900 outline-none resize-none text-sm leading-relaxed placeholder-charcoal-400 font-body"
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-400 font-body">
              <Wand2 size={12} />
              <span>Powered by {mode === 'edit' ? 'Gemini 2.5' : 'Veo 3.1'}</span>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handleGenerate}
            disabled={!selectedFile || !prompt || isProcessing || !hasKey}
            className="w-full bg-charcoal-900 hover:bg-charcoal-800 disabled:bg-charcoal-200 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-elevation-sm flex items-center justify-center gap-3 font-body"
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
            <div className="mt-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-start gap-2 font-body">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8 bg-charcoal-100 rounded-2xl p-2 overflow-hidden relative min-h-[500px] flex flex-col border-2 border-charcoal-100">
          <div className="flex-1 bg-white rounded-xl shadow-inner border border-charcoal-200 flex items-center justify-center p-8 overflow-hidden">
            {isProcessing ? (
              <div className="text-center">
                <div
                  className="w-20 h-20 border-4 border-charcoal-100 rounded-full animate-spin mx-auto mb-6"
                  style={{ borderTopColor: theme.pulseColor }}
                ></div>
                <h3 className="font-heading text-xl font-bold text-charcoal-900 mb-2">Generating Assets</h3>
                <p className="text-charcoal-500 font-medium font-body">AI is visualizing your prompt...</p>
                {mode === 'animate' && <p className="text-xs text-charcoal-400 mt-4 bg-charcoal-50 px-3 py-1 rounded-lg inline-block font-body">Estimated time: 45-60s</p>}
              </div>
            ) : resultUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className={cn(
                  "relative rounded-xl overflow-hidden shadow-elevation-lg",
                  aspectRatio === '9:16' && mode === 'animate' ? 'h-full aspect-[9/16]' : 'w-full aspect-video'
                )}>
                  {mode === 'animate' ? (
                    <video controls autoPlay loop className="w-full h-full object-cover">
                      <source src={resultUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <Image src={resultUrl} alt="Result" fill unoptimized className="object-contain bg-charcoal-900" />
                  )}
                </div>
                <div className="mt-8 flex gap-4">
                  <a href={resultUrl} download={`homeprotect-asset-${Date.now()}.${mode === 'animate' ? 'mp4' : 'png'}`} className="px-8 py-3 bg-charcoal-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-charcoal-800 transition-colors shadow-elevation-sm font-body">
                    Download for Portfolio
                  </a>
                  <button onClick={() => setResultUrl(null)} className="px-8 py-3 text-charcoal-500 hover:text-charcoal-900 font-bold text-xs uppercase tracking-widest transition font-body">
                    Discard
                  </button>
                </div>
              </div>
            ) : previewUrl ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image src={previewUrl} alt="Original Preview" fill unoptimized className="object-contain rounded-xl shadow-sm opacity-50 grayscale" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur px-6 py-2 rounded-xl text-sm font-bold text-charcoal-900 shadow-elevation-sm font-body">
                    Original Source
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-charcoal-400">
                <div className="w-24 h-24 bg-charcoal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-charcoal-200">
                  <Briefcase size={40} />
                </div>
                <p className="text-lg font-heading font-bold text-charcoal-600">Your canvas is empty.</p>
                <p className="text-sm font-body">Upload an asset to start building.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
