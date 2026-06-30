"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface StartConversationButtonProps {
  className?: string;
  label?: string;
  targetUserId: string;
}

export function StartConversationButton({
  className,
  label = "Start chat",
  targetUserId,
}: StartConversationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    try {
      const response = await fetch("/api/conversations", {
        body: JSON.stringify({ targetUserId }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as
        | { conversationId?: string; error?: string }
        | undefined;

      if (!response.ok || !payload?.conversationId) {
        throw new Error(payload?.error ?? "Could not open the conversation.");
      }

      router.push(`/messages/${payload.conversationId}`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Chat setup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={cn(className)}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Opening..." : label}
    </button>
  );
}
