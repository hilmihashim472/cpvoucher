import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}) {
  return (
    <div className="empty-state">
      <Inbox className="empty-state-icon" aria-hidden="true" />
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
