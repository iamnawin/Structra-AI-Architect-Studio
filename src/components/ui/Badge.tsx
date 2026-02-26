type BadgeProps = { status: string };

const colorMap: Record<string, string> = {
  queued: 'bg-amber-50 text-amber-700',
  running: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  active: 'bg-emerald-50 text-emerald-700',
};

export function StatusBadge({ status }: BadgeProps) {
  const color = colorMap[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${color}`}>
      {status === 'queued' && <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />}
      {status === 'running' && <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block" />}
      {status}
    </span>
  );
}
