import { Loader2 } from 'lucide-react';

export function LoadingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 py-1"
      aria-label="AI is thinking"
    >
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-400" />
    </div>
  );
}

export function FullPageLoader({
  label = 'Loading…',
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc] dark:bg-[#0d111c]">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-primary-500/10 blur-lg" />

          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_8px_25px_rgba(15,23,42,0.10)] dark:border-white/[0.08] dark:bg-white/[0.04]">
            <img
              src="/logo.png"
              alt="Sova AI"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}

export function InlineLoader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label && <span>{label}</span>}
    </div>
  );
}