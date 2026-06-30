import type { SupabaseClient } from "@supabase/supabase-js";

import { isProfileComplete } from "@/lib/profile";
import type { Database } from "@/types/database";
import type {
  ConversationDetail,
  ConversationSummary,
  Hero,
  Message,
  Profile,
  ProfileWithHeroes,
} from "@/types/domain";

type Client = SupabaseClient<Database>;

export interface BrowseFilters {
  gamemode?: Database["public"]["Enums"]["gamemode_type"];
  heroId?: number;
  platform?: Database["public"]["Enums"]["platform_type"];
  role?: Database["public"]["Enums"]["role_type"];
}

function sortProfilesByFreshness(a: ProfileWithHeroes, b: ProfileWithHeroes) {
  return (
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

function attachFavoriteHeroes(
  profiles: Profile[],
  favoriteHeroesByProfileId: Map<string, Hero[]>,
) {
  return profiles
    .map<ProfileWithHeroes>((profile) => ({
      ...profile,
      favorite_heroes: favoriteHeroesByProfileId.get(profile.id) ?? [],
    }))
    .sort(sortProfilesByFreshness);
}

function getErrorMessage(message: string, error: { message: string } | null) {
  if (!error) {
    return message;
  }

  return `${message}: ${error.message}`;
}

async function getFavoriteHeroesByProfileId(client: Client, profileIds: string[]) {
  if (profileIds.length === 0) {
    return new Map<string, Hero[]>();
  }

  const { data: favoriteRows, error: favoriteError } = await client
    .from("profile_favorite_heroes")
    .select("profile_id, hero_id")
    .in("profile_id", profileIds);

  if (favoriteError) {
    throw new Error(
      getErrorMessage("Failed to load favorite hero selections", favoriteError),
    );
  }

  const heroIds = [...new Set((favoriteRows ?? []).map((row) => row.hero_id))];

  if (heroIds.length === 0) {
    return new Map<string, Hero[]>();
  }

  const { data: heroes, error: heroesError } = await client
    .from("heroes")
    .select("*")
    .in("id", heroIds)
    .order("name");

  if (heroesError) {
    throw new Error(getErrorMessage("Failed to load heroes", heroesError));
  }

  const heroById = new Map((heroes ?? []).map((hero) => [hero.id, hero]));
  const favoriteHeroesByProfileId = new Map<string, Hero[]>();

  for (const row of favoriteRows ?? []) {
    const hero = heroById.get(row.hero_id);

    if (!hero) {
      continue;
    }

    const currentHeroes = favoriteHeroesByProfileId.get(row.profile_id) ?? [];
    currentHeroes.push(hero);
    favoriteHeroesByProfileId.set(row.profile_id, currentHeroes);
  }

  for (const selectedHeroes of favoriteHeroesByProfileId.values()) {
    selectedHeroes.sort((a, b) => a.name.localeCompare(b.name));
  }

  return favoriteHeroesByProfileId;
}

export async function getAllHeroes(client: Client) {
  const { data, error } = await client.from("heroes").select("*").order("name");

  if (error) {
    throw new Error(getErrorMessage("Failed to load heroes", error));
  }

  return data ?? [];
}

export async function getProfileById(client: Client, profileId: string) {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    throw new Error(getErrorMessage("Failed to load profile", error));
  }

  if (!data) {
    return null;
  }

  const favoriteHeroesByProfileId = await getFavoriteHeroesByProfileId(client, [
    profileId,
  ]);

  return attachFavoriteHeroes([data], favoriteHeroesByProfileId)[0] ?? null;
}

export async function getBrowseProfiles(
  client: Client,
  viewerId: string,
  filters: BrowseFilters,
) {
  let matchingProfileIds: string[] | undefined;

  if (filters.heroId) {
    const { data: heroRows, error: heroFilterError } = await client
      .from("profile_favorite_heroes")
      .select("profile_id")
      .eq("hero_id", filters.heroId);

    if (heroFilterError) {
      throw new Error(
        getErrorMessage("Failed to filter profiles by hero", heroFilterError),
      );
    }

    matchingProfileIds = (heroRows ?? [])
      .map((row) => row.profile_id)
      .filter((id) => id !== viewerId);

    if (matchingProfileIds.length === 0) {
      return [];
    }
  }

  let query = client
    .from("profiles")
    .select("*")
    .neq("id", viewerId)
    .order("updated_at", { ascending: false });

  if (filters.platform) {
    query = query.eq("platform", filters.platform);
  }

  if (filters.role) {
    query = query.eq("role", filters.role);
  }

  if (filters.gamemode) {
    query = query.eq("gamemode", filters.gamemode);
  }

  if (matchingProfileIds) {
    query = query.in("id", matchingProfileIds);
  }

  const { data: profiles, error } = await query;

  if (error) {
    throw new Error(getErrorMessage("Failed to load browse profiles", error));
  }

  const favoriteHeroesByProfileId = await getFavoriteHeroesByProfileId(
    client,
    (profiles ?? []).map((profile) => profile.id),
  );

  return attachFavoriteHeroes(profiles ?? [], favoriteHeroesByProfileId).filter(
    isProfileComplete,
  );
}

export async function getConversationSummaries(client: Client, viewerId: string) {
  const { data: conversations, error } = await client
    .from("conversations")
    .select("*")
    .or(`user_one_id.eq.${viewerId},user_two_id.eq.${viewerId}`)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(getErrorMessage("Failed to load conversations", error));
  }

  if (!conversations || conversations.length === 0) {
    return [] satisfies ConversationSummary[];
  }

  const otherUserIds = conversations.map((conversation) =>
    conversation.user_one_id === viewerId
      ? conversation.user_two_id
      : conversation.user_one_id,
  );

  const { data: otherUsers, error: otherUsersError } = await client
    .from("profiles")
    .select("*")
    .in("id", otherUserIds);

  if (otherUsersError) {
    throw new Error(
      getErrorMessage("Failed to load conversation participants", otherUsersError),
    );
  }

  const favoriteHeroesByProfileId = await getFavoriteHeroesByProfileId(
    client,
    otherUserIds,
  );

  const otherUserById = new Map(
    attachFavoriteHeroes(otherUsers ?? [], favoriteHeroesByProfileId).map(
      (profile) => [profile.id, profile] as const,
    ),
  );

  const conversationIds = conversations.map((conversation) => conversation.id);
  const { data: messages, error: messageError } = await client
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: true });

  if (messageError) {
    throw new Error(getErrorMessage("Failed to load messages", messageError));
  }

  const messagesByConversationId = new Map<string, Message[]>();

  for (const message of messages ?? []) {
    const currentMessages =
      messagesByConversationId.get(message.conversation_id) ?? [];
    currentMessages.push(message);
    messagesByConversationId.set(message.conversation_id, currentMessages);
  }

  return conversations
    .map<ConversationSummary | null>((conversation) => {
      const otherUserId =
        conversation.user_one_id === viewerId
          ? conversation.user_two_id
          : conversation.user_one_id;
      const otherUser = otherUserById.get(otherUserId);

      if (!otherUser) {
        return null;
      }

      const conversationMessages =
        messagesByConversationId.get(conversation.id) ?? [];
      const ownMessageCount = conversationMessages.filter(
        (message) => message.sender_id === viewerId,
      ).length;

      return {
        conversation,
        last_message: conversationMessages.at(-1) ?? null,
        other_message_count: conversationMessages.length - ownMessageCount,
        other_user: otherUser,
        own_message_count: ownMessageCount,
      };
    })
    .filter((summary): summary is ConversationSummary => Boolean(summary));
}

export async function getConversationDetail(
  client: Client,
  conversationId: string,
  viewerId: string,
) {
  const { data: conversation, error } = await client
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(getErrorMessage("Failed to load conversation", error));
  }

  if (!conversation) {
    return null;
  }

  const otherUserId =
    conversation.user_one_id === viewerId
      ? conversation.user_two_id
      : conversation.user_one_id;

  const otherUser = await getProfileById(client, otherUserId);

  if (!otherUser) {
    return null;
  }

  const { data: messages, error: messagesError } = await client
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(getErrorMessage("Failed to load chat history", messagesError));
  }

  return {
    conversation,
    messages: messages ?? [],
    other_user: otherUser,
  } satisfies ConversationDetail;
}
