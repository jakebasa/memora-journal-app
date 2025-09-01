import { cn } from '@/lib/utils';

interface ShimmerProps {
  className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded',
        className
      )}
    />
  );
}

// Specific shimmer components for common UI elements
export function ShimmerCard({ className }: ShimmerProps) {
  return (
    <div className={cn('p-6 border border-border/50 rounded-lg', className)}>
      <div className="flex items-center gap-3 mb-4">
        <Shimmer className="w-10 h-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ShimmerText({ className, lines = 1 }: ShimmerProps & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer 
          key={i} 
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )} 
        />
      ))}
    </div>
  );
}

export function ShimmerCalendar({ className }: ShimmerProps) {
  return (
    <div className={cn('p-6 border border-border/50 rounded-lg', className)}>
      <Shimmer className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Shimmer key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

export function ShimmerEntry({ className }: ShimmerProps) {
  return (
    <div className={cn('p-4 border border-border/50 rounded-lg', className)}>
      <div className="flex justify-between items-start mb-3">
        <Shimmer className="h-5 w-48" />
        <Shimmer className="h-4 w-20" />
      </div>
      <ShimmerText lines={2} className="mb-3" />
      <div className="flex gap-2">
        <Shimmer className="h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}
