import {
  GAMEMODE_OPTIONS,
  MAX_BIO_LENGTH,
  MAX_DISCORD_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  PLATFORM_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/constants";
import type { Gamemode, Platform, Role } from "@/types/database";

const platformValues = new Set(PLATFORM_OPTIONS.map((option) => option.value));
const roleValues = new Set(ROLE_OPTIONS.map((option) => option.value));
const gamemodeValues = new Set(GAMEMODE_OPTIONS.map((option) => option.value));
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function expectString(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string.`);
  }

  return value.trim();
}

function expectUuid(value: unknown, field: string) {
  const parsed = expectString(value, field);

  if (!uuidPattern.test(parsed)) {
    throw new Error(`${field} must be a valid UUID.`);
  }

  return parsed;
}

function parsePlatform(value: unknown): Platform {
  const parsed = expectString(value, "platform");

  if (!platformValues.has(parsed as Platform)) {
    throw new Error("platform is invalid.");
  }

  return parsed as Platform;
}

function parseRole(value: unknown): Role {
  const parsed = expectString(value, "role");

  if (!roleValues.has(parsed as Role)) {
    throw new Error("role is invalid.");
  }

  return parsed as Role;
}

function parseGamemode(value: unknown): Gamemode {
  const parsed = expectString(value, "gamemode");

  if (!gamemodeValues.has(parsed as Gamemode)) {
    throw new Error("gamemode is invalid.");
  }

  return parsed as Gamemode;
}

export function parseBrowsePlatform(value: string | undefined) {
  if (!value || !platformValues.has(value as Platform)) {
    return undefined;
  }

  return value as Platform;
}

export function parseBrowseRole(value: string | undefined) {
  if (!value || !roleValues.has(value as Role)) {
    return undefined;
  }

  return value as Role;
}

export function parseBrowseGamemode(value: string | undefined) {
  if (!value || !gamemodeValues.has(value as Gamemode)) {
    return undefined;
  }

  return value as Gamemode;
}

export function parseHeroId(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export function parseProfilePayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Profile payload is invalid.");
  }

  const candidate = payload as Record<string, unknown>;
  const name = expectString(candidate.name, "name");
  const discord = expectString(candidate.discord, "discord");
  const bio = expectString(candidate.bio, "bio");
  const favoriteHeroIds = Array.isArray(candidate.favoriteHeroIds)
    ? candidate.favoriteHeroIds
    : [];

  if (!name || name.length > MAX_NAME_LENGTH) {
    throw new Error(`name must be between 1 and ${MAX_NAME_LENGTH} characters.`);
  }

  if (!discord || discord.length > MAX_DISCORD_LENGTH) {
    throw new Error(
      `discord must be between 1 and ${MAX_DISCORD_LENGTH} characters.`,
    );
  }

  if (!bio || bio.length > MAX_BIO_LENGTH) {
    throw new Error(`bio must be between 1 and ${MAX_BIO_LENGTH} characters.`);
  }

  const heroIds = [...new Set(favoriteHeroIds.map((value) => Number(value)))].filter(
    (value) => Number.isInteger(value) && value > 0,
  );

  if (heroIds.length === 0) {
    throw new Error("Select at least one favorite hero.");
  }

  return {
    bio,
    discord,
    favoriteHeroIds: heroIds,
    gamemode: parseGamemode(candidate.gamemode),
    name,
    platform: parsePlatform(candidate.platform),
    role: parseRole(candidate.role),
  };
}

export function parseConversationPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Conversation payload is invalid.");
  }

  const candidate = payload as Record<string, unknown>;

  return {
    targetUserId: expectUuid(candidate.targetUserId, "targetUserId"),
  };
}

export function parseBlockPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Block payload is invalid.");
  }

  const candidate = payload as Record<string, unknown>;

  return {
    blockedId: expectUuid(candidate.blockedId, "blockedId"),
  };
}

export function parseReportPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Report payload is invalid.");
  }

  const candidate = payload as Record<string, unknown>;
  const details = expectString(candidate.details, "details");

  if (!details || details.length > 500) {
    throw new Error("details must be between 1 and 500 characters.");
  }

  return {
    conversationId:
      candidate.conversationId == null
        ? null
        : expectUuid(candidate.conversationId, "conversationId"),
    details,
    reportedId: expectUuid(candidate.reportedId, "reportedId"),
  };
}

export function parseMessagePayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Message payload is invalid.");
  }

  const candidate = payload as Record<string, unknown>;
  const body = expectString(candidate.body, "body");

  if (!body || body.length > MAX_MESSAGE_LENGTH) {
    throw new Error(
      `body must be between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
    );
  }

  return { body };
}

export function parseConversationId(value: string) {
  return expectUuid(value, "conversationId");
}
