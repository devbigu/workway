import type { OrderStatus } from "@/generated/prisma/enums";

import { formatDate, labelStatus } from "@/features/account/presentation";

const stages: OrderStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function OrderTimeline({
  status,
  createdAt,
  history,
}: {
  status: OrderStatus;
  createdAt: Date;
  history: Array<{ id: string; toStatus: OrderStatus; createdAt: Date }>;
}) {
  const branch = ["CANCELLED", "RETURN_REQUESTED", "RETURNED", "REFUND_PROCESSING", "REFUNDED"].includes(status);
  const reached = new Map<OrderStatus, Date>();
  reached.set("PLACED", createdAt);
  for (const event of history) reached.set(event.toStatus, event.createdAt);
  const currentIndex = stages.indexOf(status);

  return (
    <ol className="mt-5 space-y-0" aria-label="Order progress">
      {stages.map((stage, index) => {
        const timestamp = reached.get(stage);
        const complete = Boolean(timestamp) || (!branch && currentIndex >= index);
        const current = status === stage;
        return (
          <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
            {index < stages.length - 1 && <span aria-hidden="true" className={`absolute left-[11px] top-6 h-full w-0.5 ${complete ? "bg-blue-400" : "bg-slate-200"}`} />}
            <span aria-hidden="true" className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-4 border-white ring-2 ${current ? "bg-blue-600 ring-blue-600" : complete ? "bg-blue-400 ring-blue-300" : "bg-white ring-slate-200"}`} />
            <div>
              <p className={`text-sm font-bold ${complete || current ? "text-slate-950" : "text-slate-400"}`}>{labelStatus(stage)}</p>
              {timestamp && <time className="mt-1 block text-xs text-slate-500">{formatDate(timestamp, true)}</time>}
              {current && <span className="mt-1 block text-xs font-semibold text-blue-700">Current status</span>}
            </div>
          </li>
        );
      })}
      {branch && (
        <li className="relative flex gap-4 pt-6">
          <span aria-hidden="true" className="relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-4 border-white bg-purple-600 ring-2 ring-purple-300" />
          <div><p className="text-sm font-bold text-purple-900">{labelStatus(status)}</p><p className="mt-1 text-xs text-slate-500">This order followed a separate {status.startsWith("REFUND") ? "refund" : status.startsWith("RETURN") ? "return" : "cancellation"} path.</p></div>
        </li>
      )}
    </ol>
  );
}
