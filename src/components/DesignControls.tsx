import type { NoteDesign } from '../lib/types'
import { DOODLES, FONTS, INKS, PAPERS } from '../lib/design'
import {
  DoodleClip,
  DoodleFlower,
  DoodleHeart,
  DoodleStar,
} from './Doodles'
import { CloseIcon, ResetIcon } from './Icons'

interface DesignControlsProps {
  design: NoteDesign
  onChange: (design: NoteDesign) => void
  onReset: () => void
}

export function DesignControls({
  design,
  onChange,
  onReset,
}: DesignControlsProps) {
  return (
    <div className="rounded-[13px_10px_15px_11px] border-[1.5px] border-ink/20 bg-white/20 p-3">
      <div className="flex flex-wrap items-start gap-x-5 gap-y-3.5">
        <fieldset className="m-0 border-0 p-0">
          <legend className="field-label !mb-1.5">Paper</legend>
          <div className="flex flex-wrap gap-1.5">
            {PAPERS.map((paper) => (
              <button
                key={paper.key}
                type="button"
                className="swatch"
                style={{ backgroundColor: paper.bg }}
                aria-label={`${paper.label} paper`}
                aria-pressed={design.paper === paper.key}
                onClick={() => onChange({ ...design, paper: paper.key })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="field-label !mb-1.5">Ink</legend>
          <div className="flex flex-wrap gap-1.5">
            {INKS.map((ink) => (
              <button
                key={ink.key}
                type="button"
                className="swatch"
                style={{ backgroundColor: ink.color }}
                aria-label={`${ink.label} ink`}
                aria-pressed={design.ink === ink.key}
                onClick={() => onChange({ ...design, ink: ink.key })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="field-label !mb-1.5">Font</legend>
          <div className="flex gap-1">
            {FONTS.map((font) => (
              <button
                key={font.key}
                type="button"
                className={`flex h-7 min-w-[2.1rem] items-center justify-center rounded-[8px_6px_9px_7px] border-[1.5px] px-1.5 text-[0.9rem] leading-none transition ${
                  design.font === font.key
                    ? 'border-ink/60 bg-butter text-ink'
                    : 'border-ink/20 bg-white/35 text-softink hover:bg-white/60'
                } ${font.className}`}
                aria-label={`${font.label} font`}
                aria-pressed={design.font === font.key}
                onClick={() => onChange({ ...design, font: font.key })}
              >
                Aa
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="field-label !mb-1.5">Doodle</legend>
          <div className="flex gap-1">
            {DOODLES.map((doodle) => {
              const active = design.doodle === doodle.key
              return (
                <button
                  key={doodle.key}
                  type="button"
                  className={`flex h-7 w-7 items-center justify-center rounded-[8px_6px_9px_7px] border-[1.5px] transition ${
                    active
                      ? 'border-ink/60 bg-butter text-ink'
                      : 'border-ink/20 bg-white/35 text-softink hover:bg-white/60'
                  }`}
                  aria-label={doodle.label}
                  aria-pressed={active}
                  onClick={() => onChange({ ...design, doodle: doodle.key })}
                >
                  <DoodleGlyph type={doodle.key} />
                </button>
              )
            })}
          </div>
        </fieldset>

        <div className="ml-auto self-end">
          <button
            type="button"
            className="icon-btn !h-7 !w-7"
            onClick={onReset}
            aria-label="Reset design"
            title="Reset design"
          >
            <ResetIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function DoodleGlyph({ type }: { type: NoteDesign['doodle'] }) {
  if (type === 'star') return <DoodleStar className="h-4 w-4" />
  if (type === 'heart') return <DoodleHeart className="h-4 w-4" />
  if (type === 'flower') return <DoodleFlower className="h-4 w-4" />
  if (type === 'clip') return <DoodleClip className="h-4 w-3" />
  return <CloseIcon size={14} />
}
