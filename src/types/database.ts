export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Platform = "ps" | "xbox" | "nintendo" | "pc";
export type Role = "dps" | "support" | "tank" | "flex";
export type Gamemode = "6v6" | "5v5";

export interface Database {
  public: {
    Tables: {
      blocks: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string;
          id: string;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string;
          id?: string;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
          user_one_id: string;
          user_two_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_one_id: string;
          user_two_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_one_id?: string;
          user_two_id?: string;
        };
        Relationships: [];
      };
      heroes: {
        Row: {
          id: number;
          image_url: string | null;
          name: string;
          slug: string;
        };
        Insert: {
          id?: number;
          image_url?: string | null;
          name: string;
          slug: string;
        };
        Update: {
          id?: number;
          image_url?: string | null;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profile_favorite_heroes: {
        Row: {
          created_at: string;
          hero_id: number;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          hero_id: number;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          hero_id?: number;
          profile_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          bio: string;
          created_at: string;
          discord: string;
          gamemode: Gamemode | null;
          id: string;
          name: string;
          platform: Platform | null;
          role: Role | null;
          updated_at: string;
        };
        Insert: {
          bio?: string;
          created_at?: string;
          discord?: string;
          gamemode?: Gamemode | null;
          id: string;
          name?: string;
          platform?: Platform | null;
          role?: Role | null;
          updated_at?: string;
        };
        Update: {
          bio?: string;
          created_at?: string;
          discord?: string;
          gamemode?: Gamemode | null;
          id?: string;
          name?: string;
          platform?: Platform | null;
          role?: Role | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          conversation_id: string | null;
          created_at: string;
          details: string;
          id: string;
          reported_id: string;
          reporter_id: string;
        };
        Insert: {
          conversation_id?: string | null;
          created_at?: string;
          details: string;
          id?: string;
          reported_id: string;
          reporter_id: string;
        };
        Update: {
          conversation_id?: string | null;
          created_at?: string;
          details?: string;
          id?: string;
          reported_id?: string;
          reporter_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gamemode_type: Gamemode;
      platform_type: Platform;
      role_type: Role;
    };
  };
}
