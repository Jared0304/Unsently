import type { ComponentType, SVGProps } from 'react'
import type { Tab } from '../lib/types'
import {
  AboutIcon,
  HomeIcon,
  NotesIcon,
} from './Icons'
import { DoodleScribble, DoodleStar } from './Doodles'

interface NavBarProps {
  active: Tab
  onChange: (tab: Tab) => void
}

type TabIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

const TABS: Array<{ key: Tab; label: string; Icon: TabIcon }> = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'notes', label: 'Notes', Icon: NotesIcon },
  { key: 'about', label: 'About', Icon: AboutIcon },
]

export function NavBar({ active, onChange }: NavBarProps) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => onChange('home')}
            className="group relative flex items-baseline gap-1.5"
            aria-label="Unsently home"
          >
            <DoodleStar className="h-5 w-5 -rotate-6 text-ink/80 transition-transform group-hover:rotate-6" />
            <span className="font-hand text-[1.75rem] font-semibold leading-none tracking-wide">
              Unsently
            </span>
            <DoodleScribble className="absolute -bottom-1.5 left-4 h-2.5 w-[5.6rem] text-ink/25" />
          </button>

          <nav
            className="hidden items-center gap-1 rounded-[18px_14px_20px_15px] border-[1.5px] border-ink/30 bg-cream/60 p-1 md:flex"
            aria-label="Main"
          >
            {TABS.map(({ key, label, Icon }) => {
              const isActive = active === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange(key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 rounded-[12px_9px_14px_10px] border-[1.5px] px-3 py-1.5 text-[0.8rem] font-bold transition ${
                    isActive
                      ? 'border-ink/40 bg-butter text-ink shadow-[1px_2px_0_rgba(44,42,38,0.06)]'
                      : 'border-transparent text-softink hover:bg-white/55 hover:text-ink'
                  }`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/15 bg-paper/95 backdrop-blur-md md:hidden"
        aria-label="Main"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-1.5">
          {TABS.map(({ key, label, Icon }) => {
            const isActive = active === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange(key)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[0.66rem] font-bold transition ${
                  isActive ? 'text-ink' : 'text-softink'
                }`}
              >
                <span
                  className={`flex h-8 w-11 items-center justify-center rounded-[12px_9px_14px_10px] border-[1.5px] transition ${
                    isActive
                      ? '-rotate-1 border-ink/45 bg-butter'
                      : 'border-transparent'
                  }`}
                >
                  <Icon size={18} />
                </span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
