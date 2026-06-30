import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseConversationPayload } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { targetUserId } = parseConversationPayload(await request.json());

    if (targetUserId === user.id) {
      throw new Error("You cannot message yourself.");
    }

    const { data: currentConversations, error: currentError } = await supabase
      .from("conversations")
      .select("*")
      .or(`user_one_id.eq.${user.id},user_two_id.eq.${user.id}`);

    if (currentError) {
      throw new Error(currentError.message);
    }

    const existingConversation = (currentConversations ?? []).find(
      (conversation) =>
        conversation.user_one_id === targetUserId ||
        conversation.user_two_id === targetUserId,
    );

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id });
    }

    const [userOneId, userTwoId] =
      user.id < targetUserId ? [user.id, targetUserId] : [targetUserId, user.id];

    const { data: insertedConversation, error: insertError } = await supabase
      .from("conversations")
      .insert({
        user_one_id: userOneId,
        user_two_id: userTwoId,
      })
      .select("id")
      .single();

    if (insertError || !insertedConversation) {
      throw new Error(insertError?.message ?? "Conversation creation failed.");
    }

    return NextResponse.json({ conversationId: insertedConversation.id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not create the conversation.",
      },
      { status: 400 },
    );
  }
}
