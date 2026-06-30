"use client";
/* eslint-disable @next/next/no-img-element */

import { useDeferredValue, useState } from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Hero } from "@/types/domain";

interface HeroPickerProps {
  heroes: Hero[];
  onClose: () => void;
  onToggle: (heroId: number) => void;
  open: boolean;
  selectedHeroIds: number[];
}

export function HeroPicker({
  heroes,
  onClose,
  onToggle,
  open,
  selectedHeroIds,
}: HeroPickerProps) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const selectedIds = new Set(selectedHeroIds);

  const filteredHeroes = heroes.filter((hero) =>
    hero.name.toLowerCase().includes(deferredQuery.trim().toLowerCase()),
  );

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Favorite hero picker"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Hero Selection</span>
            <h3>Choose your favorite heroes</h3>
          </div>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <label className="search-field">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search heroes..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <div className="hero-grid">
          {filteredHeroes.map((hero) => {
            const active = selectedIds.has(hero.id);

            return (
              <button
                key={hero.id}
                type="button"
                className={cn("hero-tile", active && "hero-tile-active")}
                onClick={() => onToggle(hero.id)}
              >
                {hero.image_url ? (
                  <img src={hero.image_url} alt={hero.name} className="hero-face" />
                ) : (
                  <div className="hero-face hero-face-fallback">
                    {hero.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span>{hero.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
