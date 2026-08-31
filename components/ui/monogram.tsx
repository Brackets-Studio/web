export function Monogram({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const initials = title
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted via-background-elevated to-background-elevated">
      <span
        className={className ?? "font-mono text-7xl font-bold tracking-tight text-foreground/15 select-none sm:text-8xl"}
      >
        {initials}
      </span>
    </div>
  );
}
