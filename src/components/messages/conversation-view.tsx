"use client";

import {
  startTransition,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  MAX_MESSAGE_LENGTH,
  MAX_MESSAGES_PER_USER,
} from "@/lib/constants";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatTimestamp } from "@/lib/utils";
import type { Message } from "@/types/domain";

interface ConversationViewProps {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherUserDiscord: string;
  otherUserName: string;
}

export function ConversationView({
  conversationId,
  currentUserId,
  initialMessages,
  otherUserDiscord,
  otherUserName,
}: ConversationViewProps) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const ownCount = messages.filter(
    (message) => message.sender_id === currentUserId,
  ).length;
  const otherCount = messages.length - ownCount;
  const ownMessagesRemaining = MAX_MESSAGES_PER_USER - ownCount;
  const otherMessagesRemaining = MAX_MESSAGES_PER_USER - otherCount;
  const ownLimitReached = ownCount >= MAX_MESSAGES_PER_USER;
  const otherLimitReached = otherCount >= MAX_MESSAGES_PER_USER;

  function appendMessage(message: Message) {
    setMessages((current) =>
      current.some((existing) => existing.id === message.id)
        ? current
        : [...current, message],
    );
  }

  useEffect(() => {
    const client = createSupabaseBrowserClient();
    const channel = client
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          filter: `conversation_id=eq.${conversationId}`,
          schema: "public",
          table: "messages",
        },
        (payload) => {
          appendMessage(payload.new as Message);
        },
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (ownLimitReached) {
      setStatus(`You have used your 10 on-site messages. Continue on Discord: ${otherUserDiscord}`);
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        body: JSON.stringify({ body: draft }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: Message }
        | null;

      if (!response.ok || !payload?.message) {
        throw new Error(payload?.error ?? "Message failed.");
      }

      appendMessage(payload.message);
      setDraft("");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Message failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="section-panel message-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">Direct Chat</span>
          <h2>{otherUserName}</h2>
        </div>
        <div className="message-counter">
          <span>You: {ownCount}/10</span>
          <span>Them: {otherCount}/10</span>
        </div>
      </div>

      <div className="message-helper">
        {ownLimitReached ? (
          <span>Message limit reached. Continue on Discord: {otherUserDiscord}</span>
        ) : otherLimitReached ? (
          <span>{otherUserName} reached their 10-message limit. Continue on Discord: {otherUserDiscord}</span>
        ) : (
          <span>
            {ownMessagesRemaining} sends left for you, {otherMessagesRemaining} for {otherUserName}.
          </span>
        )}
      </div>

      <div className="message-list">
        {messages.length > 0 ? (
          messages.map((message) => {
            const ownMessage = message.sender_id === currentUserId;

            return (
              <article
                key={message.id}
                className={`message-bubble ${
                  ownMessage ? "message-bubble-own" : "message-bubble-other"
                }`}
              >
                <p>{message.body}</p>
                <time>{formatTimestamp(message.created_at)}</time>
              </article>
            );
          })
        ) : (
          <div className="empty-state">
            No messages yet. Open with something better than “hey”.
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form className="message-composer" onSubmit={handleSubmit}>
        <label className="field">
          <span>Your message</span>
          <textarea
            rows={3}
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Start the conversation."
            onChange={(event) => setDraft(event.target.value)}
            disabled={ownLimitReached || sending}
          />
        </label>
        {status ? <div className="status-banner">{status}</div> : null}
        <div className="form-actions">
          <small>{MAX_MESSAGE_LENGTH - draft.length} characters left</small>
          <button
            type="submit"
            className="primary-button"
            disabled={sending || ownLimitReached}
          >
            {sending ? "Sending..." : "Send message"}
          </button>
        </div>
      </form>
    </div>
  );
}
