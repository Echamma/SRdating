import type { Database } from "@/types/database";

export type Hero = Database["public"]["Tables"]["heroes"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type Block = Database["public"]["Tables"]["blocks"]["Row"];

export interface ProfileWithHeroes extends Profile {
  favorite_heroes: Hero[];
}

export interface ConversationSummary {
  conversation: Conversation;
  last_message: Message | null;
  other_user: ProfileWithHeroes;
  own_message_count: number;
  other_message_count: number;
}

export interface ConversationDetail {
  conversation: Conversation;
  messages: Message[];
  other_user: ProfileWithHeroes;
}
