import { AlertTriangle } from "lucide-react";

export default function InlineError({ message = "Something went wrong. Please try again." }) {
  return (
    <div role="alert" className="inline-error">
      <AlertTriangle className="inline-error-icon" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
