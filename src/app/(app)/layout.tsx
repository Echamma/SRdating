import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getProfileById } from "@/lib/data";
import { getMissingProfileFields, isProfileComplete } from "@/lib/profile";
import { AppNav } from "@/components/site/app-nav";

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { supabase, user } = await requireUser();
  const profile = await getProfileById(supabase, user.id);
  const profileComplete = isProfileComplete(profile);
  const missing = getMissingProfileFields(profile);

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link href="/browse" className="brand-lockup">
          <span className="brand-mark">SR</span>
          <div>
            <strong>Overwatch Dating</strong>
            <span>{profile?.name || user.email || "Recruit pending"}</span>
          </div>
        </Link>

        <AppNav />

        <form action="/auth/signout" method="post">
          <button type="submit" className="ghost-button">
            Sign out
          </button>
        </form>
      </header>

      {!profileComplete ? (
        <div className="completion-banner">
          <span>Finish your profile before browsing or messaging.</span>
          <span>Missing: {missing.join(", ")}</span>
          <Link href="/profile/me" className="inline-link">
            Complete profile
          </Link>
        </div>
      ) : null}

      <main className="app-main">{children}</main>
    </div>
  );
}
