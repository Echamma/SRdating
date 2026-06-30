"use client";
/* eslint-disable @next/next/no-img-element */

import { startTransition, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  GAMEMODE_OPTIONS,
  MAX_BIO_LENGTH,
  PLATFORM_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Hero, ProfileWithHeroes } from "@/types/domain";
import { HeroPicker } from "@/components/profile/hero-picker";

interface ProfileFormProps {
  heroes: Hero[];
  initialProfile: ProfileWithHeroes | null;
}

export function ProfileForm({ heroes, initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    bio: initialProfile?.bio ?? "",
    discord: initialProfile?.discord ?? "",
    gamemode: initialProfile?.gamemode ?? "",
    name: initialProfile?.name ?? "",
    platform: initialProfile?.platform ?? "",
    role: initialProfile?.role ?? "",
  });
  const [selectedHeroIds, setSelectedHeroIds] = useState<number[]>(
    initialProfile?.favorite_heroes.map((hero) => hero.id) ?? [],
  );
  const selectedHeroes = heroes.filter((hero) => selectedHeroIds.includes(hero.id));

  function updateField<Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleHero(heroId: number) {
    setSelectedHeroIds((current) =>
      current.includes(heroId)
        ? current.filter((id) => id !== heroId)
        : [...current, heroId],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/profile", {
        body: JSON.stringify({
          ...form,
          favoriteHeroIds: selectedHeroIds,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Profile save failed.");
      }

      setStatus("Profile saved. Your roster is live.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form className="section-panel form-layout" onSubmit={handleSubmit}>
        <div className="section-header">
          <div>
            <span className="eyebrow">Profile Loadout</span>
            <h1>Build your public card</h1>
          </div>
          <p className="section-subtitle">
            This is the information other players will browse before starting a
            limited on-site chat.
          </p>
        </div>

        {status ? <div className="status-banner">{status}</div> : null}

        <div className="field-grid">
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              value={form.name}
              maxLength={40}
              placeholder="MercyMainMina"
              onChange={(event) => updateField("name", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Discord</span>
            <input
              type="text"
              value={form.discord}
              maxLength={40}
              placeholder="mina.support"
              onChange={(event) => updateField("discord", event.target.value)}
            />
          </label>

          <label className="field">
            <span>Platform</span>
            <select
              value={form.platform}
              onChange={(event) => updateField("platform", event.target.value)}
            >
              <option value="">Choose a platform</option>
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Role</span>
            <select
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
            >
              <option value="">Choose a role</option>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Gamemode</span>
            <select
              value={form.gamemode}
              onChange={(event) => updateField("gamemode", event.target.value)}
            >
              <option value="">Choose a mode</option>
              {GAMEMODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Bio</span>
          <textarea
            value={form.bio}
            maxLength={MAX_BIO_LENGTH}
            rows={5}
            placeholder="Tell people what kind of queue partner, chaos duo, or ranked energy you bring."
            onChange={(event) => updateField("bio", event.target.value)}
          />
          <small>{MAX_BIO_LENGTH - form.bio.length} characters left</small>
        </label>

        <div className="hero-selection-panel">
          <div className="section-header">
            <div>
              <span className="eyebrow">Favorite Heroes</span>
              <h2>Pick the roster faces that define you</h2>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => setPickerOpen(true)}
              disabled={heroes.length === 0}
            >
              <Plus size={16} />
              Select Heroes
            </button>
          </div>

          {heroes.length === 0 ? (
            <div className="empty-state">
              Seed the `heroes` table in Supabase first, then reopen this page.
            </div>
          ) : null}

          <div className="selected-heroes">
            {selectedHeroes.length > 0 ? (
              selectedHeroes.map((hero) => (
                <button
                  key={hero.id}
                  type="button"
                  className={cn("selected-hero", "hero-removal")}
                  onClick={() => toggleHero(hero.id)}
                >
                  {hero.image_url ? (
                    <img src={hero.image_url} alt={hero.name} className="hero-thumb" />
                  ) : (
                    <div className="hero-thumb hero-face-fallback">
                      {hero.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span>{hero.name}</span>
                </button>
              ))
            ) : (
              <div className="empty-state">
                No heroes selected yet. Open the picker and build your signature
                lineup.
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>

      <HeroPicker
        heroes={heroes}
        open={pickerOpen}
        selectedHeroIds={selectedHeroIds}
        onClose={() => setPickerOpen(false)}
        onToggle={toggleHero}
      />
    </>
  );
}
