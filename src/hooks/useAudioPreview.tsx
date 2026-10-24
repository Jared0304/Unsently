import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { MusicTrack } from '../lib/types'

const MAX_PREVIEW_SECONDS = 20

interface AudioPreviewValue {
  currentKey: string | null
  isPlaying: boolean
  isLoading: boolean
  errorKey: string | null
  toggle: (key: string, track: MusicTrack) => void
  stop: () => void
}

const AudioPreviewContext = createContext<AudioPreviewValue | null>(null)

export function AudioPreviewProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentKeyRef = useRef<string | null>(null)
  const playRequestRef = useRef(0)
  const [currentKey, setCurrentKey] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onTimeUpdate = () => {
      if (audio.currentTime >= MAX_PREVIEW_SECONDS) {
        audio.pause()
        audio.currentTime = 0
        setIsPlaying(false)
      }
    }
    const onPlaying = () => {
      setIsPlaying(true)
      setIsLoading(false)
    }
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onWaiting = () => {
      if (!audio.paused) setIsLoading(true)
    }
    const onError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      const key = currentKeyRef.current
      if (key) setErrorKey(key)
    }

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('error', onError)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    playRequestRef.current += 1
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    currentKeyRef.current = null
    setCurrentKey(null)
    setIsPlaying(false)
    setIsLoading(false)
  }, [])

  const toggle = useCallback((key: string, track: MusicTrack) => {
    const audio = audioRef.current
    if (!audio) return

    setErrorKey(null)

    if (currentKeyRef.current === key) {
      if (!audio.paused) {
        audio.pause()
        return
      }

      if (audio.currentTime >= MAX_PREVIEW_SECONDS - 0.05) {
        audio.currentTime = 0
      }

      setIsLoading(true)
      const request = ++playRequestRef.current
      audio
        .play()
        .then(() => {
          if (request === playRequestRef.current) setIsLoading(false)
        })
        .catch(() => {
          if (request === playRequestRef.current) {
            setIsLoading(false)
            setIsPlaying(false)
            setErrorKey(key)
          }
        })
      return
    }

    const request = ++playRequestRef.current
    currentKeyRef.current = key
    setCurrentKey(key)
    setIsLoading(true)
    setIsPlaying(false)
    setErrorKey(null)

    audio.pause()
    audio.src = track.previewUrl
    audio.currentTime = 0
    audio.load()

    audio
      .play()
      .then(() => {
        if (request === playRequestRef.current) setIsLoading(false)
      })
      .catch(() => {
        if (request === playRequestRef.current) {
          setIsLoading(false)
          setIsPlaying(false)
          setErrorKey(key)
        }
      })
  }, [])

  return (
    <AudioPreviewContext.Provider
      value={{ currentKey, isPlaying, isLoading, errorKey, toggle, stop }}
    >
      {children}
    </AudioPreviewContext.Provider>
  )
}

export function useAudioPreview(): AudioPreviewValue {
  const value = useContext(AudioPreviewContext)
  if (!value) {
    throw new Error('useAudioPreview must be used inside AudioPreviewProvider')
  }
  return value
}
