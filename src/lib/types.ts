export type PaperStyle = 'cream' | 'blush' | 'sage' | 'sky' | 'lilac' | 'white'
export type InkStyle = 'ink' | 'cocoa' | 'forest' | 'plum' | 'blue'
export type FontStyle = 'hand' | 'serif' | 'sans'
export type DoodleStyle = 'none' | 'star' | 'heart' | 'flower' | 'clip'

export interface NoteDesign {
  paper: PaperStyle
  ink: InkStyle
  font: FontStyle
  doodle: DoodleStyle
}

export interface MusicTrack {
  trackId: string
  title: string
  artist: string
  artworkUrl: string
  previewUrl: string
}

export interface Note {
  id: string
  text: string
  senderName: string | null
  recipientName: string | null
  imageUrl: string | null
  music: MusicTrack | null
  design: NoteDesign
  createdAt: string
  updatedAt: string
}

export interface About {
  text: string
  imageUrl: string | null
  canEdit: boolean
  updatedAt: string
}

export type Tab = 'home' | 'notes' | 'about'
