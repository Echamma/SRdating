import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseBlockPayload } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { blockedId } = parseBlockPayload(await request.json());

    if (blockedId === user.id) {
      throw new Error("You cannot block yourself.");
    }

    const { error } = await supabase.from("blocks").upsert(
      {
        blocked_id: blockedId,
        blocker_id: user.id,
      },
      {
        ignoreDuplicates: true,
        onConflict: "blocker_id,blocked_id",
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not block this user.",
      },
      { status: 400 },
    );
  }
}
