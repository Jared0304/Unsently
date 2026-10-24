import { Modal } from './Modal'
import { CloseIcon } from './Icons'

interface LightboxProps {
  src: string | null
  alt: string
  onClose: () => void
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  return (
    <Modal
      open={Boolean(src)}
      onClose={onClose}
      ariaLabel={alt}
      panelClassName="flex !w-auto max-h-[92vh] max-w-[94vw] flex-col items-center"
    >
      <button
        type="button"
        onClick={onClose}
        className="mb-3 inline-flex h-10 w-10 items-center justify-center self-end rounded-full border-[1.5px] border-ink/60 bg-cream text-ink shadow-paper transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-offset-4"
        aria-label="Close"
      >
        <CloseIcon size={19} />
      </button>
      {src ? (
        <div
          className="max-h-[80vh] max-w-[90vw] overflow-hidden rounded-[14px_10px_16px_11px] border-[1.5px] border-ink/60 bg-cream p-1.5 shadow-lift"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <img
            src={src}
            alt={alt}
            draggable={false}
            className="block max-h-[76vh] max-w-[84vw] object-contain"
          />
        </div>
      ) : null}
    </Modal>
  )
}
