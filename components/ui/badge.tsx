export function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-sm border border-border px-2 py-1 font-mono text-xs text-foreground-muted">
      {children}
    </span>
  );
}
