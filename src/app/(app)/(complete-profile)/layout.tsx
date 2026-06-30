import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getProfileById } from "@/lib/data";
import { isProfileComplete } from "@/lib/profile";

export default async function CompleteProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { supabase, user } = await requireUser();
  const profile = await getProfileById(supabase, user.id);

  if (!isProfileComplete(profile)) {
    redirect("/profile/me?complete=1");
  }

  return children;
}
