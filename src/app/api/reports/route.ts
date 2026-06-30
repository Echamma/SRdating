import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseReportPayload } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const parsed = parseReportPayload(await request.json());

    if (parsed.reportedId === user.id) {
      throw new Error("You cannot report yourself.");
    }

    const { error } = await supabase.from("reports").insert({
      conversation_id: parsed.conversationId,
      details: parsed.details,
      reported_id: parsed.reportedId,
      reporter_id: user.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not create the report.",
      },
      { status: 400 },
    );
  }
}
