import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getConversationSummaries } from "@/lib/data";
import { formatTimestamp } from "@/lib/utils";

export default async function MessagesPage() {
  const { supabase, user } = await requireUser();
  const conversations = await getConversationSummaries(supabase, user.id);

  return (
    <section className="page-stack">
      <div className="section-header">
        <div>
          <span className="eyebrow">Inbox</span>
          <h1>Active conversations</h1>
        </div>
        <p className="section-subtitle">
          Each player gets 10 messages per conversation before the handoff to
          Discord.
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="conversation-list">
          {conversations.map((summary) => (
            <Link
              key={summary.conversation.id}
              href={`/messages/${summary.conversation.id}`}
              className="conversation-item"
            >
              <div className="conversation-meta">
                <div>
                  <span className="eyebrow">Open Thread</span>
                  <h3>{summary.other_user.name}</h3>
                </div>
                <span className="stat-pill">
                  You {summary.own_message_count}/10
                </span>
              </div>
              <p className="muted-copy">
                {summary.last_message?.body ?? "No messages yet."}
              </p>
              <small>
                {summary.last_message
                  ? formatTimestamp(summary.last_message.created_at)
                  : `Discord: ${summary.other_user.discord}`}
              </small>
            </Link>
          ))}
        </div>
      ) : (
        <div className="section-panel empty-state">
          No conversations yet. Start from the browse roster.
        </div>
      )}
    </section>
  );
}
