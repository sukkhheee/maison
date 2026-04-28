import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded bg-surface-2",
        className
      )}
    />
  );
}

export function ErrorBlock({
  message,
  onRetry
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card p-8 text-center space-y-3">
      <p className="text-rose-600 dark:text-rose-400 text-sm font-medium">
        Алдаа гарлаа
      </p>
      <p className="text-fg-muted text-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-medium text-accent hover:underline"
        >
          Дахин оролдох
        </button>
      )}
    </div>
  );
}
