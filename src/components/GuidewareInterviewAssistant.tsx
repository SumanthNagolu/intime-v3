'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, Loader2, MessageSquare, Sparkles,
  Circle, Trash2, Volume2, VolumeX, ChevronDown,
  AlertCircle, Zap, Clock, Copy, Check
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

// Extend Window for webkitSpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export const GuidewireInterviewAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [interimText, setInterimText] = useState('');
  const [accumulatedText, setAccumulatedText] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoDetect, setAutoDetect] = useState(true);
  const [manualInput, setManualInput] = useState('');

  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const answersEndRef = useRef<HTMLDivElement>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedRef = useRef('');

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText]);

  // Auto-scroll answers
  useEffect(() => {
    answersEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [answers]);

  const detectQuestion = useCallback((text: string): boolean => {
    const trimmed = text.trim();
    // Question mark
    if (trimmed.endsWith('?')) return true;
    // Question words at start
    const questionStarters = /^(what|how|why|when|where|who|which|can you|could you|tell me|explain|describe|walk me through|have you|do you|did you|are you|is there|what's|how's|would you)/i;
    if (questionStarters.test(trimmed)) return true;
    // Guidewire-specific question patterns
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

      const data = await response.json();

      setAnswers(prev => prev.map(a =>
        a.id === answerId
          ? { ...a, answer: data.answer || data.error || 'No response', loading: false }
          : a
      ));
    } catch {
      setAnswers(prev => prev.map(a =>
        a.id === answerId
          ? { ...a, answer: 'Failed to get answer. Check your connection.', loading: false }
          : a
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

  const startListening = useCallback(() => {
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

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          if (accumulatedRef.current.trim()) {
            processAccumulatedText(accumulatedRef.current);
            accumulatedRef.current = '';
            setAccumulatedText('');
          }
        }, 2000); // 2 second pause = end of utterance
      }

      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsSupported(false);
      }
      // Auto-restart on network errors
      if (event.error === 'network' || event.error === 'aborted') {
        setTimeout(() => {
          if (isListening) startListening();
        }, 1000);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListening) {
        try {
          recognition.start();
        } catch {
          // Already started
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, processAccumulatedText]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    // Process any remaining accumulated text
    if (accumulatedRef.current.trim()) {
      processAccumulatedText(accumulatedRef.current);
      accumulatedRef.current = '';
      setAccumulatedText('');
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsListening(false);
    setInterimText('');
  }, [processAccumulatedText]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Browser Not Supported</h2>
          <p className="text-stone-500">
            Speech recognition requires Chrome or Edge. Please switch browsers or allow microphone access.
          </p>
        </div>
      </div>
    );
  }

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
          </div>
          <h1 className="text-3xl font-serif font-bold text-charcoal italic">
            Guidewire Interview Assistant
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Captures your Zoom audio, detects questions, provides instant expert answers
          </p>
        </div>

        <div className="flex items-center gap-3">
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
                  <p className="text-sm">Start listening to see transcript</p>
                  <p className="text-xs text-stone-600 mt-1">Make sure Zoom audio is playing through speakers</p>
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

              {/* Accumulated text (building up) */}
              {accumulatedText && (
                <div className="px-3 py-2.5 rounded-xl bg-white/5 border border-dashed border-white/10">
                  <p className="text-sm text-stone-400 leading-relaxed">{accumulatedText.trim()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1 h-1 rounded-full bg-stone-500 animate-pulse" />
                    <span className="text-[10px] text-stone-600">listening...</span>
                  </div>
                </div>
              )}

              {/* Interim text (currently being spoken) */}
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
                  {/* Question */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare size={14} className="text-amber-600" />
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-600 mb-1">Question</div>
                      <p className="text-sm text-charcoal font-medium leading-relaxed">{entry.question}</p>
                    </div>
                  </div>

                  {/* Answer */}
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
