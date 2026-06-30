"use client";

import { useState } from "react";

interface ReportDialogProps {
  conversationId?: string;
  reportedId: string;
}

export function ReportDialog({
  conversationId,
  reportedId,
}: ReportDialogProps) {
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reports", {
        body: JSON.stringify({
          conversationId,
          details,
          reportedId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Report failed.");
      }

      setDetails("");
      setMessage("Report submitted. Review it from your Supabase dashboard.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Report failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <details className="report-panel">
      <summary>Report</summary>
      <form onSubmit={handleSubmit} className="stack-form">
        <label className="field">
          <span>What happened?</span>
          <textarea
            rows={4}
            value={details}
            placeholder="Explain the issue so you can review it later in Supabase."
            onChange={(event) => setDetails(event.target.value)}
          />
        </label>
        {message ? <div className="status-banner">{message}</div> : null}
        <button type="submit" className="ghost-button" disabled={loading}>
          {loading ? "Sending..." : "Submit report"}
        </button>
      </form>
    </details>
  );
}
