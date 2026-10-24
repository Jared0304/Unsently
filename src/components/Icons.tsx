import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }
type BaseProps = IconProps & { children: ReactNode }

function Base({ children, size = 20, ...props }: BaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M5.5 10.2v9.3h13v-9.3" />
      <path d="M9.8 19.5v-5.2h4.4v5.2" />
    </Base>
  )
}

export function NotesIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 3.8h9.1l3 3v13.4H6V3.8Z" />
      <path d="M15 3.9v3.2h3.1" />
      <path d="M8.8 10.2h6.4M8.8 13.2h6.4M8.8 16.2h4.1" />
    </Base>
  )
}

export function AboutIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="9" r="3.3" />
      <path d="M5.3 19.5c.7-3.3 3.1-5 6.7-5s6 1.7 6.7 5" />
      <path d="M18.7 4.5c.8.5 1.3 1.2 1.4 2.1" />
    </Base>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  )
}

export function ImageIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3.5" y="4.7" width="17" height="14.6" rx="2" />
      <circle cx="8.6" cy="9.2" r="1.5" />
      <path d="m5 17.2 4.7-4.7 3.1 3.1 2.2-2.2 4 3.8" />
    </Base>
  )
}

export function CameraIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 8.5h3l1.4-2h7.2l1.4 2h3v10.1H4V8.5Z" />
      <circle cx="12" cy="13.3" r="3.2" />
    </Base>
  )
}

export function MusicIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M9 17.2V6.8l9-2v10.1" />
      <circle cx="6.8" cy="17.5" r="2.4" />
      <circle cx="15.8" cy="15.2" r="2.4" />
    </Base>
  )
}

export function PlayIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8.5 5.8 18 12l-9.5 6.2V5.8Z" />
    </Base>
  )
}

export function PauseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8.5 5.8v12.4M15.5 5.8v12.4" />
    </Base>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Base>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.8 7.2h14.4M9.2 7.2V4.8h5.6v2.4M6.5 7.2l.8 12h9.4l.8-12" />
      <path d="M10.1 10.5v5.6M13.9 10.5v5.6" />
    </Base>
  )
}

export function EditIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m5 16.9-.8 3.1 3.1-.8L18.4 8.1l-2.3-2.3L5 16.9Z" />
      <path d="m14.7 7.3 2.3 2.3" />
    </Base>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m4.8 12.4 4.5 4.4L19.2 6.9" />
    </Base>
  )
}

export function LockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="5" y="10.2" width="14" height="9.6" rx="2" />
      <path d="M8.2 10.2V7.9a3.8 3.8 0 0 1 7.6 0v2.3" />
      <path d="M12 14.1v2" />
    </Base>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="10.7" cy="10.7" r="5.7" />
      <path d="m15 15 4.3 4.3" />
    </Base>
  )
}

export function ResetIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.6 8.8A8 8 0 1 1 5 15" />
      <path d="M4.6 4.8v4.5H9" />
    </Base>
  )
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M19 12H5M10.5 6.5 5 12l5.5 5.5" />
    </Base>
  )
}

export function UploadIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 16V4.8M7.5 9.3 12 4.8l4.5 4.5" />
      <path d="M5 15.8v3.5h14v-3.5" />
    </Base>
  )
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="spinner inline-block"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}
