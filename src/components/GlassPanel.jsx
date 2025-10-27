import clsx from 'clsx';

export default function GlassPanel({ className = '', children }) {
  return (
    <div
      className={clsx(
        'glass-surface rounded-[32px] border px-6 py-6 text-slate-900 shadow-glass-md transition-colors dark:text-white dark:shadow-glass-lg',
        'bg-glass-light/90 border-white/30 dark:bg-glass-dark/80 dark:border-white/10',
        className
      )}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
