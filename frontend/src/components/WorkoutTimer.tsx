import { useState, useEffect, useRef } from 'react'

const PRESETS = [60, 90, 120] as const

export default function WorkoutTimer() {
  const [duration, setDuration] = useState(60)
  const [remaining, setRemaining] = useState(60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  function selectDuration(d: number) {
    setDuration(d)
    setRemaining(d)
    setRunning(false)
  }

  function toggle() {
    if (remaining === 0) {
      setRemaining(duration)
      setRunning(true)
    } else {
      setRunning(prev => !prev)
    }
  }

  function reset() {
    setRunning(false)
    setRemaining(duration)
  }

  const pct = (remaining / duration) * 100
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="timer-card">
      <div className="timer-presets">
        {PRESETS.map(p => (
          <button
            key={p}
            className={`timer-preset${duration === p ? ' active' : ''}`}
            onClick={() => selectDuration(p)}
          >
            {p}초
          </button>
        ))}
      </div>
      <div className="timer-display">
        <div className="timer-ring" style={{ '--pct': `${pct}%` } as React.CSSProperties}>
          <div className="timer-ring-inner">
            <span className="timer-time">
              {mins}:{String(secs).padStart(2, '0')}
            </span>
            {remaining === 0 && <span className="timer-done">완료!</span>}
          </div>
        </div>
      </div>
      <div className="timer-controls">
        <button
          className="btn-secondary"
          onClick={reset}
          disabled={!running && remaining === duration}
        >
          초기화
        </button>
        <button className="btn-primary" onClick={toggle}>
          {running ? '일시정지' : remaining === 0 ? '다시 시작' : '시작'}
        </button>
      </div>
    </div>
  )
}
