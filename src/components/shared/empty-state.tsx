import type { ReactNode } from "react";

import { Icon } from "@/features/home/components/icon";
import type { IconName } from "@/features/home/types";

/** DESIGN.md §4.14: line-drawn vessel, serif title, one sentence, one primary action. */
export function EmptyState({
  title,
  text,
  action,
  icon = "glassware",
}: {
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="empty">
      <Icon name={icon} strokeWidth={1} />
      <h2 className="empty-title">{title}</h2>
      {text && <p className="empty-text">{text}</p>}
      {action && <div className="mt-3 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}
