import { NextResponse } from "next/server";

import { MAX_MESSAGES_PER_USER } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  parseConversationId,
  parseMessagePayload,
} from "@/lib/validation";

type MessageRouteProps = {
  params: Promise<{ conversationId: string }>;
};

export async function POST(request: Request, { params }: MessageRouteProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { conversationId: rawConversationId } = await params;
    const conversationId = parseConversationId(rawConversationId);
    const { body } = parseMessagePayload(await request.json());

    const { count, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("conversation_id", conversationId)
      .eq("sender_id", user.id);

    if (countError) {
      throw new Error(countError.message);
    }

    if ((count ?? 0) >= MAX_MESSAGES_PER_USER) {
      throw new Error("You already used your 10 on-site messages. Continue on Discord.");
    }

    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        body,
        conversation_id: conversationId,
        sender_id: user.id,
      })
      .select("*")
      .single();

    if (insertError || !message) {
      throw new Error(insertError?.message ?? "Message send failed.");
    }

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not send the message.",
      },
      { status: 400 },
    );
  }
}
