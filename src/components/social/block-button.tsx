"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BlockButtonProps {
  blockedId: string;
  redirectTo?: string;
}

export function BlockButton({
  blockedId,
  redirectTo = "/browse",
}: BlockButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleBlock() {
    const confirmed = window.confirm(
      "Block this user? They will disappear from browse and messaging.",
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/blocks", {
        body: JSON.stringify({ blockedId }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Could not block this user.");
      }

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Block failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="danger-button" onClick={handleBlock}>
      {loading ? "Blocking..." : "Block"}
    </button>
  );
}
