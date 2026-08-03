import { JetBrains_Mono } from "next/font/google";

const markFont = JetBrains_Mono({ subsets: ["latin"], weight: "700" });

/**
 * The Brackets Studio mark: a bare "{}" pair, set in mono and rendered in
 * currentColor so it inherits the surrounding text color in either theme.
 */
export function BracketMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`${markFont.className} ${className ?? ""}`}
    >
      {"{}"}
    </span>
  );
}
