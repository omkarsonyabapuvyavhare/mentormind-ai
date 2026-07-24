export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div
      className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
      role="alert"
    >
      <div className="flex items-start justify-between gap-4">
        <p>{message}</p>
        {onDismiss ? (
          <button
            type="button"
            className="text-red-100 underline"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
