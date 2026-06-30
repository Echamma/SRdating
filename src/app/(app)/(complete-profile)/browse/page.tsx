import { BrowseFilters } from "@/components/browse/browse-filters";
import { ProfileCard } from "@/components/browse/profile-card";
import { requireUser } from "@/lib/auth";
import { getAllHeroes, getBrowseProfiles } from "@/lib/data";
import { getSingleParam } from "@/lib/utils";
import {
  parseBrowseGamemode,
  parseBrowsePlatform,
  parseBrowseRole,
  parseHeroId,
} from "@/lib/validation";

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { supabase, user } = await requireUser();
  const params = await searchParams;
  const selectedPlatform = parseBrowsePlatform(
    getSingleParam(params.platform),
  );
  const selectedRole = parseBrowseRole(getSingleParam(params.role));
  const selectedGamemode = parseBrowseGamemode(
    getSingleParam(params.gamemode),
  );
  const selectedHeroId = parseHeroId(getSingleParam(params.hero));

  const [heroes, profiles] = await Promise.all([
    getAllHeroes(supabase),
    getBrowseProfiles(supabase, user.id, {
      gamemode: selectedGamemode,
      heroId: selectedHeroId,
      platform: selectedPlatform,
      role: selectedRole,
    }),
  ]);

  return (
    <section className="page-stack">
      <div className="section-header">
        <div>
          <span className="eyebrow">Browse Roster</span>
          <h1>Find your next duo</h1>
        </div>
        <p className="section-subtitle">
          Filter by mode, role, platform, or a shared hero obsession.
        </p>
      </div>

      <BrowseFilters
        heroes={heroes}
        selectedGamemode={selectedGamemode}
        selectedHeroId={selectedHeroId}
        selectedPlatform={selectedPlatform}
        selectedRole={selectedRole}
      />

      {profiles.length > 0 ? (
        <div className="profile-grid">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="section-panel empty-state">
          No profiles matched those filters yet.
        </div>
      )}
    </section>
  );
}
