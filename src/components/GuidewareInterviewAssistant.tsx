'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Loader2, MessageSquare, Sparkles,
  Circle, Trash2, Volume2, VolumeX,
  AlertCircle, Zap, Clock, Copy, Check, Settings2
} from 'lucide-react';

interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: Date;
  type: 'question' | 'filler' | 'statement';
}

interface AnswerEntry {
  id: string;
  questionId: string;
  question: string;
  answer: string;
  timestamp: Date;
  loading?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface AudioDevice {
  deviceId: string;
  label: string;
}

export const GuidewireInterviewAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [interimText, setInterimText] = useState('');
  const [accumulatedText, setAccumulatedText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  const [manualInput, setManualInput] = useState('');

  // Audio device selection
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('default');
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [useWhisper, setUseWhisper] = useState(true); // Whisper for system audio, SpeechRecognition for mic

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const answersEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedRef = useRef('');

  // Whisper mode refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTranscribingRef = useRef(false);
  const chunksRef = useRef<Blob[]>([]);

  // SpeechRecognition mode ref
  const recognitionRef = useRef<any>(null);

  // Enumerate audio input devices
  useEffect(() => {
    async function loadDevices() {
      try {
        // Need a temporary stream to get device labels
        const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        tempStream.getTracks().forEach(t => t.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices
          .filter(d => d.kind === 'audioinput')
          .map(d => ({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`,
          }));
        setAudioDevices(audioInputs);

        // Auto-select a virtual audio device if found (BlackHole, VB-Cable, etc.)
        const virtual = audioInputs.find(d =>
          /blackhole|virtual|vb-cable|soundflower|loopback/i.test(d.label)
        );
        if (virtual) {
          setSelectedDeviceId(virtual.deviceId);
          setUseWhisper(true);
        }
      } catch {
        console.warn('Could not enumerate audio devices');
      }
    }
    loadDevices();
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText]);

  useEffect(() => {
    answersEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [answers]);

  const detectQuestion = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.endsWith('?')) return true;
    const questionStarters = /^(what|how|why|when|where|who|which|can you|could you|tell me|explain|describe|walk me through|have you|do you|did you|are you|is there|what's|how's|would you)/i;
    if (questionStarters.test(trimmed)) return true;
    const gwPatterns = /\b(difference between|what is|how does|experience with|familiar with|worked with|implemented|configured|customized)\b/i;
    if (gwPatterns.test(trimmed)) return true;
    return false;
  }, []);

  const fetchAnswer = useCallback(async (question: string, questionId: string) => {
    const answerId = `ans-${Date.now()}`;
    setAnswers(prev => [...prev, {
      id: answerId,
      questionId,
      question,
      answer: '',
      timestamp: new Date(),
      loading: true,
    }]);

    try {
      const response = await fetch('/api/ai/interview-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          conversationHistory: answers.slice(-4).map(a => ({
            role: 'Interviewer',
            content: a.question,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setAnswers(prev => prev.map(a =>
          a.id === answerId
            ? { ...a, answer: data.error || 'No response', loading: false }
            : a
        ));
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (!reader) {
        setAnswers(prev => prev.map(a =>
          a.id === answerId ? { ...a, answer: 'No response stream', loading: false } : a
        ));
        return;
      }

      setAnswers(prev => prev.map(a =>
        a.id === answerId ? { ...a, loading: false } : a
      ));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              accumulated += parsed.text;
              const text = accumulated;
              setAnswers(prev => prev.map(a =>
                a.id === answerId ? { ...a, answer: text } : a
              ));
            }
          } catch { /* skip */ }
        }
      }

      if (!accumulated) {
        setAnswers(prev => prev.map(a =>
          a.id === answerId ? { ...a, answer: 'No response generated', loading: false } : a
        ));
      }
    } catch {
      setAnswers(prev => prev.map(a =>
        a.id === answerId ? { ...a, answer: 'Failed to get answer.', loading: false } : a
      ));
    }
  }, [answers]);

  const processAccumulatedText = useCallback((text: string) => {
    if (!text.trim() || text.trim().length < 10) return;

    const isQuestion = detectQuestion(text);
    const entryId = `t-${Date.now()}`;

    const entry: TranscriptEntry = {
      id: entryId,
      text: text.trim(),
      timestamp: new Date(),
      type: isQuestion ? 'question' : 'statement',
    };

    setTranscript(prev => [...prev, entry]);

    if (isQuestion && autoDetect) {
      fetchAnswer(text.trim(), entryId);
    }
  }, [detectQuestion, autoDetect, fetchAnswer]);

  // ─── WHISPER MODE: getUserMedia + MediaRecorder + Whisper API ───
  const transcribeChunk = useCallback(async (blob: Blob) => {
    if (blob.size < 1000) return;

    // Allow overlapping transcriptions for speed
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'audio.webm');

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) return;

      const data = await res.json();
      const text = data.text?.trim();

      if (text && text.length > 5) {
        accumulatedRef.current += ' ' + text;
        setAccumulatedText(accumulatedRef.current);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (accumulatedRef.current.trim()) {
            processAccumulatedText(accumulatedRef.current);
            accumulatedRef.current = '';
            setAccumulatedText('');
          }
        }, 1500);
      }
    } catch (err) {
      console.error('[Whisper] Transcribe error:', err);
    }
  }, [processAccumulatedText]);

  const startWhisperListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start();
      setIsListening(true);
      setInterimText('Capturing audio...');

      // Every 4 seconds, flush and transcribe
      recordingIntervalRef.current = setInterval(() => {
        if (recorder.state === 'recording') {
          recorder.stop();

          const blob = new Blob(chunksRef.current, { type: mimeType });
          chunksRef.current = [];
          transcribeChunk(blob);

          recorder.start();
        }
      }, 4000);
    } catch (err: any) {
      console.error('[Whisper] Start error:', err);
      alert(`Could not access audio device. ${err.message || 'Check permissions.'}`);
    }
  }, [selectedDeviceId, transcribeChunk]);

  const stopWhisperListening = useCallback(() => {
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();

      // Transcribe final chunk
      const mimeType = mediaRecorderRef.current.mimeType;
      const blob = new Blob(chunksRef.current, { type: mimeType });
      chunksRef.current = [];
      if (blob.size > 1000) transcribeChunk(blob);

      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (accumulatedRef.current.trim()) {
      processAccumulatedText(accumulatedRef.current);
      accumulatedRef.current = '';
      setAccumulatedText('');
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsListening(false);
    setInterimText('');
  }, [processAccumulatedText, transcribeChunk]);

  // ─── SPEECH RECOGNITION MODE (browser mic) ─────────────────
  const startSpeechRecognition = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (finalTranscript) {
        accumulatedRef.current += ' ' + finalTranscript;
        setAccumulatedText(accumulatedRef.current);

        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (accumulatedRef.current.trim()) {
            processAccumulatedText(accumulatedRef.current);
            accumulatedRef.current = '';
            setAccumulatedText('');
          }
        }, 2000);
      }

      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'network' || event.error === 'aborted') {
        setTimeout(() => startSpeechRecognition(), 1000);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start(); } catch { /* already started */ }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, processAccumulatedText]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (accumulatedRef.current.trim()) {
      processAccumulatedText(accumulatedRef.current);
      accumulatedRef.current = '';
      setAccumulatedText('');
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsListening(false);
    setInterimText('');
  }, [processAccumulatedText]);

  // ─── UNIFIED TOGGLE ────────────────────────────────────────
  const toggleListening = () => {
    if (isListening) {
      useWhisper ? stopWhisperListening() : stopSpeechRecognition();
    } else {
      useWhisper ? startWhisperListening() : startSpeechRecognition();
    }
  };

  const clearAll = () => {
    setTranscript([]);
    setAnswers([]);
    setInterimText('');
    setAccumulatedText('');
    accumulatedRef.current = '';
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const entryId = `t-${Date.now()}`;
    setTranscript(prev => [...prev, {
      id: entryId,
      text: manualInput.trim(),
      timestamp: new Date(),
      type: 'question',
    }]);

    fetchAnswer(manualInput.trim(), entryId);
    setManualInput('');
  };

  const copyAnswer = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const forceAskQuestion = (entry: TranscriptEntry) => {
    fetchAnswer(entry.text, entry.id);
  };

  const selectedDeviceLabel = audioDevices.find(d => d.deviceId === selectedDeviceId)?.label || 'Default';

  return (
    <div className="animate-fade-in h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              isListening
                ? 'bg-red-500/10 text-red-500'
                : 'bg-stone-100 text-stone-400'
            }`}>
              <Circle size={8} className={isListening ? "fill-red-500 animate-pulse" : "fill-stone-400"} />
              {isListening ? "Listening" : "Standby"}
            </div>
            {isListening && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-rust rounded-full animate-pulse"
                    style={{
                      height: `${8 + Math.random() * 16}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: '0.5s',
                    }}
                  />
                ))}
              </div>
            )}
            {isListening && (
              <span className="text-[10px] text-stone-400 font-medium">
                {useWhisper ? 'Whisper' : 'Speech API'} · {selectedDeviceLabel}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-serif font-bold text-charcoal italic">
            Guidewire Interview Assistant
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Captures audio, detects interviewer questions, provides instant expert answers
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Device Picker */}
          <div className="relative">
            <button
              onClick={() => setShowDevicePicker(!showDevicePicker)}
              disabled={isListening}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all border ${
                isListening
                  ? 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed'
                  : 'bg-white text-charcoal border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Settings2 size={14} />
              <span className="max-w-[140px] truncate">{selectedDeviceLabel}</span>
            </button>

            {showDevicePicker && !isListening && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                  <p className="text-xs font-semibold text-charcoal uppercase tracking-wider">Audio Input Device</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Select your audio source (mic, BlackHole, virtual cable)</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {audioDevices.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => {
                        setSelectedDeviceId(device.deviceId);
                        setShowDevicePicker(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                        selectedDeviceId === device.deviceId
                          ? 'bg-rust/5 text-rust font-medium'
                          : 'text-charcoal hover:bg-stone-50'
                      }`}
                    >
                      <span className="truncate">{device.label}</span>
                      {selectedDeviceId === device.deviceId && (
                        <Check size={14} className="text-rust shrink-0" />
                      )}
                    </button>
                  ))}
                  {audioDevices.length === 0 && (
                    <p className="px-4 py-3 text-sm text-stone-400">No audio devices found. Allow mic access first.</p>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-stone-100 bg-stone-50">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useWhisper}
                      onChange={(e) => setUseWhisper(e.target.checked)}
                      className="rounded border-stone-300 text-rust focus:ring-rust"
                    />
                    <span className="text-xs text-stone-600">Use Whisper API (better for system audio / virtual devices)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setAutoDetect(!autoDetect)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              autoDetect
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-stone-50 text-stone-400 border border-stone-200'
            }`}
          >
            <Zap size={14} />
            Auto-detect
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-11 h-11 flex items-center justify-center rounded-full border border-stone-200 hover:bg-stone-50 text-stone-400 hover:text-charcoal transition-colors"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            onClick={clearAll}
            className="w-11 h-11 flex items-center justify-center rounded-full border border-stone-200 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>

          <button
            onClick={toggleListening}
            className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/30 animate-pulse'
                : 'bg-rust text-white hover:bg-[#B8421E] shadow-rust/30'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening ? 'Stop' : 'Start Listening'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden">

        {/* Left: Live Transcript */}
        <div className="w-[400px] shrink-0 flex flex-col">
          <div className="bg-charcoal rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-stone-400" />
                <span className="text-sm font-semibold text-white uppercase tracking-wider">Live Transcript</span>
              </div>
              <span className="text-[10px] text-stone-500 tabular-nums">{transcript.length} entries</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
              {transcript.length === 0 && !interimText && !accumulatedText && (
                <div className="flex flex-col items-center justify-center h-full text-stone-500">
                  <Mic size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">Click Start Listening to begin</p>
                  <p className="text-xs text-stone-600 mt-1">
                    {useWhisper
                      ? 'Using Whisper transcription with selected device'
                      : 'Using browser speech recognition with default mic'}
                  </p>
                </div>
              )}

              {transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`group relative px-3 py-2.5 rounded-xl text-sm transition-all ${
                    entry.type === 'question'
                      ? 'bg-amber-500/10 border border-amber-500/20 text-amber-100'
                      : 'bg-white/5 text-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {entry.type === 'question' && (
                      <span className="shrink-0 mt-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">Q</span>
                    )}
                    <p className="flex-1 leading-relaxed">{entry.text}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-stone-600">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {entry.type === 'statement' && (
                      <button
                        onClick={() => forceAskQuestion(entry)}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-rust hover:text-white transition-all px-2 py-0.5 rounded bg-rust/20 hover:bg-rust/40"
                      >
                        Get Answer
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {accumulatedText && (
                <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-dashed border-white/10">
                  <p className="text-sm text-stone-400 leading-relaxed">{accumulatedText.trim()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-stone-500 animate-pulse" />
                    <span className="text-[10px] text-stone-600">listening...</span>
                  </div>
                </div>
              )}

              {interimText && (
                <div className="px-3 py-2.5 rounded-xl bg-rust/10 border border-rust/20">
                  <p className="text-sm text-rust/70 leading-relaxed italic">{interimText}</p>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            {/* Manual input */}
            <form onSubmit={handleManualSubmit} className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Type a question manually..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-rust/50"
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="px-4 py-2.5 bg-rust text-white rounded-xl text-sm font-semibold disabled:opacity-30 hover:bg-rust/80 transition-colors"
                >
                  Ask
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right: AI Answers */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl shadow-stone-200/50 border border-stone-200 flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-rust" />
                <span className="text-sm font-semibold text-charcoal uppercase tracking-wider">Expert Answers</span>
              </div>
              <span className="text-[10px] text-stone-400 tabular-nums">{answers.length} answers</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              {answers.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-stone-400">
                  <Sparkles size={40} className="mb-4 opacity-20" />
                  <p className="text-lg font-serif italic">Waiting for questions...</p>
                  <p className="text-sm mt-2 text-stone-400 max-w-sm text-center">
                    Questions detected from the audio will automatically generate expert Guidewire answers
                  </p>
                </div>
              )}

              {answers.map((entry) => (
                <div key={entry.id} className="animate-fade-in">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare size={14} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-1">Question</div>
                      <p className="text-sm text-charcoal font-medium leading-relaxed">{entry.question}</p>
                    </div>
                  </div>

                  <div className="ml-10 relative">
                    {entry.loading ? (
                      <div className="flex items-center gap-3 py-4">
                        <Loader2 size={18} className="animate-spin text-rust" />
                        <span className="text-sm text-stone-400 italic">Generating expert answer...</span>
                      </div>
                    ) : (
                      <div className="group bg-stone-50 rounded-xl p-5 border border-stone-100 hover:border-stone-200 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="text-sm text-charcoal leading-relaxed prose prose-sm max-w-none prose-strong:text-charcoal prose-li:text-charcoal"
                            dangerouslySetInnerHTML={{
                              __html: formatAnswer(entry.answer)
                            }}
                          />
                          <button
                            onClick={() => copyAnswer(entry.id, entry.answer)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-stone-200 transition-all"
                          >
                            {copiedId === entry.id ? (
                              <Check size={14} className="text-emerald-500" />
                            ) : (
                              <Copy size={14} className="text-stone-400" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                          <Clock size={10} className="text-stone-400" />
                          <span className="text-[10px] text-stone-400">
                            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div ref={answersEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatAnswer(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n- /g, '<br/>• ')
    .replace(/\n\d\. /g, (match) => `<br/>${match.trim()} `)
    .replace(/\n/g, '<br/>');
}
