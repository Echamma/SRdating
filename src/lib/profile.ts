import {
  GAMEMODE_OPTIONS,
  PLATFORM_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/constants";
import type { Gamemode, Platform, Role } from "@/types/database";
import type { ProfileWithHeroes } from "@/types/domain";

function getOptionLabel<T extends string>(
  options: Array<{ label: string; value: T }>,
  value: T | null,
) {
  if (!value) {
    return "Unset";
  }

  return options.find((option) => option.value === value)?.label ?? value;
}

export function isProfileComplete(profile: ProfileWithHeroes | null) {
  if (!profile) {
    return false;
  }

  return Boolean(
    profile.name.trim() &&
      profile.discord.trim() &&
      profile.platform &&
      profile.role &&
      profile.gamemode &&
      profile.bio.trim() &&
      profile.favorite_heroes.length > 0,
  );
}

export function getMissingProfileFields(profile: ProfileWithHeroes | null) {
  if (!profile) {
    return [
      "name",
      "discord",
      "platform",
      "role",
      "gamemode",
      "bio",
      "favorite heroes",
    ];
  }

  const missing: string[] = [];

  if (!profile.name.trim()) {
    missing.push("name");
  }

  if (!profile.discord.trim()) {
    missing.push("discord");
  }

  if (!profile.platform) {
    missing.push("platform");
  }

  if (!profile.role) {
    missing.push("role");
  }

  if (!profile.gamemode) {
    missing.push("gamemode");
  }

  if (!profile.bio.trim()) {
    missing.push("bio");
  }

  if (profile.favorite_heroes.length === 0) {
    missing.push("favorite heroes");
  }

  return missing;
}

export function formatPlatform(value: Platform | null) {
  return getOptionLabel(PLATFORM_OPTIONS, value);
}

export function formatRole(value: Role | null) {
  return getOptionLabel(ROLE_OPTIONS, value);
}

export function formatGamemode(value: Gamemode | null) {
  return getOptionLabel(GAMEMODE_OPTIONS, value);
}
