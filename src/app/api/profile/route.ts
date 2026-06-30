import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseProfilePayload } from "@/lib/validation";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const parsed = parseProfilePayload(await request.json());

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        bio: parsed.bio,
        discord: parsed.discord,
        gamemode: parsed.gamemode,
        name: parsed.name,
        platform: parsed.platform,
        role: parsed.role,
      })
      .eq("id", user.id);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: deleteError } = await supabase
      .from("profile_favorite_heroes")
      .delete()
      .eq("profile_id", user.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { error: insertError } = await supabase
      .from("profile_favorite_heroes")
      .insert(
        parsed.favoriteHeroIds.map((heroId) => ({
          hero_id: heroId,
          profile_id: user.id,
        })),
      );

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save the profile.",
      },
      { status: 400 },
    );
  }
}
