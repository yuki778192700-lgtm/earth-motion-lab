import { useEarthLabStore } from '../../store/useEarthLabStore'
import type { LearningMode } from '../../types/education'

const MODES: Array<{ id: LearningMode; label: string }> = [
  { id: 'explore', label: '自由探索' },
  { id: 'teach', label: '教师演示' },
  { id: 'practice', label: '练习模式' },
]

export function LearningModeSwitcher() {
  const mode = useEarthLabStore((state) => state.learningMode)
  const setMode = useEarthLabStore((state) => state.setLearningMode)

  return (
    <div className="learning-mode-switcher" aria-label="学习模式">
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          data-active={mode === item.id}
          onClick={() => setMode(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
