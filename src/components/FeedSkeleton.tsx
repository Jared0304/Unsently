export function FeedSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6" aria-busy="true" aria-label="Loading notes">
      <span className="sr-only">Loading notes</span>
      {[0, 1, 2].map((item) => (
        <div key={item} className="paper-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-3 w-10" />
          </div>
          <div className="mt-5 space-y-2.5">
            <div className="skeleton h-4 w-[82%]" />
            <div className="skeleton h-4 w-[64%]" />
            <div className="skeleton h-4 w-[48%]" />
          </div>
          {item === 1 ? (
            <div className="skeleton mt-5 h-40 w-full !rounded-[14px]" />
          ) : null}
          <div className="mt-5 flex items-center justify-between">
            <div className="skeleton h-10 w-44 !rounded-[12px]" />
            <div className="skeleton h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}
