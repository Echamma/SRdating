/* eslint-disable @next/next/no-img-element */

import { notFound, redirect } from "next/navigation";

import { BlockButton } from "@/components/social/block-button";
import { ReportDialog } from "@/components/social/report-dialog";
import { StartConversationButton } from "@/components/social/start-conversation-button";
import { requireUser } from "@/lib/auth";
import { getProfileById } from "@/lib/data";
import {
  formatGamemode,
  formatPlatform,
  formatRole,
} from "@/lib/profile";

type PublicProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  if (id === user.id) {
    redirect("/profile/me");
  }

  const profile = await getProfileById(supabase, id);

  if (!profile) {
    notFound();
  }

  return (
    <section className="page-stack">
      <article className="section-panel profile-detail">
        <div className="section-header">
          <div>
            <span className="eyebrow">Player Card</span>
            <h1>{profile.name}</h1>
          </div>
          <div className="stat-row">
            <span className="stat-pill">{formatPlatform(profile.platform)}</span>
            <span className="stat-pill">{formatRole(profile.role)}</span>
            <span className="stat-pill">{formatGamemode(profile.gamemode)}</span>
          </div>
        </div>

        <p className="lead-copy">{profile.bio}</p>

        <div className="detail-grid">
          <div className="detail-block">
            <span className="section-label">Discord</span>
            <strong>{profile.discord}</strong>
          </div>

          <div className="detail-block">
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
        </div>

        <div className="card-actions">
          <StartConversationButton
            targetUserId={profile.id}
            className="primary-button"
            label="Open chat"
          />
          <BlockButton blockedId={profile.id} />
        </div>

        <ReportDialog reportedId={profile.id} />
      </article>
    </section>
  );
}
