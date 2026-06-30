import type { Gamemode, Platform, Role } from "@/types/database";

export const PLATFORM_OPTIONS: Array<{ label: string; value: Platform }> = [
  { label: "PlayStation", value: "ps" },
  { label: "Xbox", value: "xbox" },
  { label: "Nintendo", value: "nintendo" },
  { label: "PC", value: "pc" },
];

export const ROLE_OPTIONS: Array<{ label: string; value: Role }> = [
  { label: "Damage", value: "dps" },
  { label: "Support", value: "support" },
  { label: "Tank", value: "tank" },
  { label: "Flex", value: "flex" },
];

export const GAMEMODE_OPTIONS: Array<{ label: string; value: Gamemode }> = [
  { label: "6v6", value: "6v6" },
  { label: "5v5", value: "5v5" },
];

export const MAX_BIO_LENGTH = 280;
export const MAX_DISCORD_LENGTH = 40;
export const MAX_MESSAGE_LENGTH = 280;
export const MAX_MESSAGES_PER_USER = 10;
export const MAX_NAME_LENGTH = 40;
