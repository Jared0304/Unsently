import type {
  DoodleStyle,
  FontStyle,
  InkStyle,
  NoteDesign,
  PaperStyle,
} from './types'

export const PAPERS: Array<{ key: PaperStyle; label: string; bg: string }> = [
  { key: 'cream', label: 'Cream', bg: '#fbf6ea' },
  { key: 'blush', label: 'Blush', bg: '#fbe9e3' },
  { key: 'sage', label: 'Sage', bg: '#e8f0e5' },
  { key: 'sky', label: 'Sky', bg: '#e6eff5' },
  { key: 'lilac', label: 'Lilac', bg: '#f0e9f7' },
  { key: 'white', label: 'White', bg: '#fffdf8' },
]

export const INKS: Array<{ key: InkStyle; label: string; color: string }> = [
  { key: 'ink', label: 'Ink', color: '#2c2a26' },
  { key: 'cocoa', label: 'Cocoa', color: '#604236' },
  { key: 'forest', label: 'Forest', color: '#345044' },
  { key: 'plum', label: 'Plum', color: '#574064' },
  { key: 'blue', label: 'Blue', color: '#34556c' },
]

export const FONTS: Array<{
  key: FontStyle
  label: string
  className: string
  noteClassName: string
}> = [
  {
    key: 'hand',
    label: 'Hand',
    className: 'font-hand',
    noteClassName: 'font-hand text-[1.55rem] leading-[1.35] sm:text-[1.7rem]',
  },
  {
    key: 'serif',
    label: 'Serif',
    className: 'font-note',
    noteClassName: 'font-note text-[0.98rem] leading-7 sm:text-[1.02rem]',
  },
  {
    key: 'sans',
    label: 'Sans',
    className: 'font-body',
    noteClassName: 'font-body text-[0.98rem] leading-7 sm:text-[1.02rem]',
  },
]

export const DOODLES: Array<{ key: DoodleStyle; label: string }> = [
  { key: 'none', label: 'None' },
  { key: 'star', label: 'Star' },
  { key: 'heart', label: 'Heart' },
  { key: 'flower', label: 'Flower' },
  { key: 'clip', label: 'Paperclip' },
]

export const DEFAULT_DESIGN: NoteDesign = {
  paper: 'cream',
  ink: 'ink',
  font: 'hand',
  doodle: 'star',
}

export function paperFor(key: PaperStyle) {
  return PAPERS.find((paper) => paper.key === key) ?? PAPERS[0]
}

export function inkFor(key: InkStyle) {
  return INKS.find((ink) => ink.key === key) ?? INKS[0]
}

export function fontFor(key: FontStyle) {
  return FONTS.find((font) => font.key === key) ?? FONTS[0]
}
