'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface NarrationState {
  isPlaying: boolean
  isPaused: boolean
  progress: number
  currentTime: number
  duration: number
  spokenCharIndex: number
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const
export type NarrationSpeed = (typeof SPEEDS)[number]
export { SPEEDS as NARRATION_SPEEDS }

export function useNarration() {
  const [state, setState] = useState<NarrationState>({
    isPlaying: false,
    isPaused: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
    spokenCharIndex: -1,
  })

  const [rate, setRateState] = useState<NarrationSpeed>(1)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)
  const elapsedBeforePauseRef = useRef(0)
  const durationRef = useRef(0)
  const currentTextRef = useRef('')

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current)
      keepAliveRef.current = null
    }
  }, [])

  const startProgressTracking = useCallback(() => {
    clearTimers()

    intervalRef.current = setInterval(() => {
      const elapsed =
        elapsedBeforePauseRef.current +
        (Date.now() - startTimeRef.current) / 1000
      const dur = durationRef.current
      if (dur <= 0) return
      const pct = Math.min(99, (elapsed / dur) * 100)
      setState((s) => ({ ...s, currentTime: elapsed, progress: pct }))
    }, 200)

    // Chrome bug: speech stops after ~15s. Pause/resume keeps it alive.
    keepAliveRef.current = setInterval(() => {
      if (
        typeof window !== 'undefined' &&
        window.speechSynthesis.speaking &&
        !window.speechSynthesis.paused
      ) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, 10000)
  }, [clearTimers])

  const stop = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel()
    clearTimers()
    utteranceRef.current = null
    elapsedBeforePauseRef.current = 0
    currentTextRef.current = ''
    setState({
      isPlaying: false,
      isPaused: false,
      progress: 0,
      currentTime: 0,
      duration: 0,
      spokenCharIndex: -1,
    })
  }, [isSupported, clearTimers])

  const play = useCallback(
    (text: string) => {
      if (!isSupported || !text) return

      window.speechSynthesis.cancel()
      clearTimers()
      elapsedBeforePauseRef.current = 0
      currentTextRef.current = text

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate * 0.9 // Slightly slower for natural pacing
      utterance.pitch = 1.02 // Warmer tone

      // Select the most natural voice available
      const voices = window.speechSynthesis.getVoices()
      const preferred =
        voices.find(
          (v) => /enhanced|premium/i.test(v.name) && v.lang.startsWith('en')
        ) ||
        voices.find((v) => v.name.includes('Google US English')) ||
        voices.find((v) => v.name === 'Samantha') ||
        voices.find((v) => v.lang === 'en-US' && v.localService) ||
        voices.find((v) => v.lang.startsWith('en'))
      if (preferred) utterance.voice = preferred

      utteranceRef.current = utterance

      // Track spoken position for teleprompter sync
      utterance.onboundary = (e: SpeechSynthesisEvent) => {
        if (e.name === 'word') {
          setState((s) => ({ ...s, spokenCharIndex: e.charIndex }))
        }
      }

      const wordCount = text.split(/\s+/).length
      const estimatedDuration = ((wordCount / 160) * 60) / (rate * 0.9)
      durationRef.current = estimatedDuration

      utterance.onstart = () => {
        startTimeRef.current = Date.now()
        setState({
          isPlaying: true,
          isPaused: false,
          duration: estimatedDuration,
          progress: 0,
          currentTime: 0,
          spokenCharIndex: 0,
        })
        startProgressTracking()
      }

      utterance.onend = () => {
        clearTimers()
        setState((s) => ({
          ...s,
          isPlaying: false,
          isPaused: false,
          progress: 100,
          currentTime: s.duration,
          spokenCharIndex: -1,
        }))
      }

      utterance.onerror = () => {
        clearTimers()
        setState((s) => ({
          ...s,
          isPlaying: false,
          isPaused: false,
          spokenCharIndex: -1,
        }))
      }

      window.speechSynthesis.speak(utterance)
    },
    [isSupported, rate, clearTimers, startProgressTracking]
  )

  const pause = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.pause()
    clearTimers()
    elapsedBeforePauseRef.current +=
      (Date.now() - startTimeRef.current) / 1000
    setState((s) => ({ ...s, isPlaying: false, isPaused: true }))
  }, [isSupported, clearTimers])

  const resume = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.resume()
    startTimeRef.current = Date.now()
    setState((s) => ({ ...s, isPlaying: true, isPaused: false }))
    startProgressTracking()
  }, [isSupported, startProgressTracking])

  const togglePlayPause = useCallback(
    (text?: string) => {
      if (state.isPlaying) {
        pause()
      } else if (state.isPaused) {
        resume()
      } else if (text) {
        play(text)
      }
    },
    [state.isPlaying, state.isPaused, play, pause, resume]
  )

  const cycleSpeed = useCallback(() => {
    setRateState((current) => {
      const idx = SPEEDS.indexOf(current)
      return SPEEDS[(idx + 1) % SPEEDS.length]
    })
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel()
      clearTimers()
    }
  }, [isSupported, clearTimers])

  // Preload voices
  useEffect(() => {
    if (!isSupported) return
    window.speechSynthesis.getVoices()
    const handler = () => window.speechSynthesis.getVoices()
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    return () =>
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
  }, [isSupported])

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
    togglePlayPause,
    rate,
    setRate: setRateState,
    cycleSpeed,
    isSupported,
    hasText: currentTextRef.current.length > 0,
  }
}
