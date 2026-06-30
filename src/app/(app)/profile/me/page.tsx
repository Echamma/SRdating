import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/lib/auth";
import { getAllHeroes, getProfileById } from "@/lib/data";
import { getSingleParam } from "@/lib/utils";

type ProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MyProfilePage({
  searchParams,
}: ProfilePageProps) {
  const { supabase, user } = await requireUser();
  const profile = await getProfileById(supabase, user.id);
  const heroes = await getAllHeroes(supabase);
  const params = await searchParams;
  const forcedCompletion = getSingleParam(params.complete) === "1";

  return (
    <section className="page-stack">
      {forcedCompletion ? (
        <div className="status-banner">
          Complete every field and pick at least one hero before browse and
          messaging unlock.
        </div>
      ) : null}
      <ProfileForm initialProfile={profile} heroes={heroes} />
    </section>
  );
}
