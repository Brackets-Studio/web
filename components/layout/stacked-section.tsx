import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";

type StackedSectionProps = ComponentPropsWithoutRef<"section"> & {
  children: ReactNode;
  /** Renders as a <footer> for the last, semantically-footer block. */
  as?: "section" | "footer";
  /** Removes the bottom gap, for the last block in the page. */
  last?: boolean;
  ref?: Ref<HTMLElement>;
};

export function StackedSection({
  className,
  children,
  as: Tag = "section",
  last = false,
  ref,
  ...rest
}: StackedSectionProps) {
  return (
    <Tag
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.5rem]",
        !last && "mb-3 sm:mb-4",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
