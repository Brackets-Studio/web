import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StackedSectionProps = {
  id?: string;
  className?: string;
  children: ReactNode;
  /** Renders as a <footer> for the last, semantically-footer block. */
  as?: "section" | "footer";
  /** Removes the bottom gap, for the last block in the page. */
  last?: boolean;
};

export function StackedSection({
  id,
  className,
  children,
  as: Tag = "section",
  last = false,
}: StackedSectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem]",
        !last && "mb-3 sm:mb-4",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
