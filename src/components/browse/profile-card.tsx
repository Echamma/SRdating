/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import {
  formatGamemode,
  formatPlatform,
  formatRole,
} from "@/lib/profile";
import type { ProfileWithHeroes } from "@/types/domain";
import { StartConversationButton } from "@/components/social/start-conversation-button";

interface ProfileCardProps {
  profile: ProfileWithHeroes;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <article className="profile-card">
      <div className="profile-card-header">
        <div>
          <span className="eyebrow">Open Queue</span>
          <h3>{profile.name}</h3>
        </div>
        <span className="stat-pill">{formatPlatform(profile.platform)}</span>
      </div>

      <div className="stat-row">
        <span className="stat-pill">{formatRole(profile.role)}</span>
        <span className="stat-pill">{formatGamemode(profile.gamemode)}</span>
      </div>

      <p className="card-bio">{profile.bio}</p>

      <div className="card-section">
        <span className="section-label">Favorite Heroes</span>
        <div className="hero-chip-row">
          {profile.favorite_heroes.map((hero) => (
            <div key={hero.id} className="hero-chip">
              {hero.image_url ? (
                <img src={hero.image_url} alt={hero.name} className="hero-thumb" />
              ) : (
                <div className="hero-thumb hero-face-fallback">
                  {hero.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span>{hero.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-actions">
        <Link href={`/profile/${profile.id}`} className="ghost-button">
          View profile
        </Link>
        <StartConversationButton
          targetUserId={profile.id}
          className="primary-button"
          label="Message"
        />
      </div>
    </article>
  );
}
