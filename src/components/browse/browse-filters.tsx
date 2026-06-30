"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  GAMEMODE_OPTIONS,
  PLATFORM_OPTIONS,
  ROLE_OPTIONS,
} from "@/lib/constants";
import type { Hero } from "@/types/domain";

interface BrowseFiltersProps {
  heroes: Hero[];
  selectedGamemode?: string;
  selectedHeroId?: number;
  selectedPlatform?: string;
  selectedRole?: string;
}

export function BrowseFilters({
  heroes,
  selectedGamemode,
  selectedHeroId,
  selectedPlatform,
  selectedRole,
}: BrowseFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    startTransition(() => {
      router.replace(nextParams.toString() ? `${pathname}?${nextParams}` : pathname);
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <div className="section-panel">
      <div className="filter-grid">
        <label className="field">
          <span>Platform</span>
          <select
            value={selectedPlatform ?? ""}
            onChange={(event) => updateParam("platform", event.target.value)}
          >
            <option value="">All platforms</option>
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
            value={selectedRole ?? ""}
            onChange={(event) => updateParam("role", event.target.value)}
          >
            <option value="">All roles</option>
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
            value={selectedGamemode ?? ""}
            onChange={(event) => updateParam("gamemode", event.target.value)}
          >
            <option value="">All modes</option>
            {GAMEMODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Favorite hero</span>
          <select
            value={selectedHeroId?.toString() ?? ""}
            onChange={(event) => updateParam("hero", event.target.value)}
          >
            <option value="">Any hero</option>
            {heroes.map((hero) => (
              <option key={hero.id} value={hero.id}>
                {hero.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="ghost-button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>
    </div>
  );
}
