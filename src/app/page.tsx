import Link from "next/link";
import { redirect } from "next/navigation";

import { getSignedInUser } from "@/lib/auth";
import { getProfileById } from "@/lib/data";
import { isProfileComplete } from "@/lib/profile";
import { getSingleParam } from "@/lib/utils";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getSigninErrorMessage(errorCode: string | undefined) {
  if (errorCode === "invalid_credentials") {
    return "Email or password is wrong.";
  }

  if (errorCode === "email_address_invalid") {
    return "Supabase rejected that email address format.";
  }

  if (errorCode === "email_provider_disabled") {
    return "Email auth is disabled in Supabase. Enable the Email provider in Authentication settings.";
  }

  if (errorCode === "email_not_confirmed") {
    return "This account is not confirmed yet. Check your inbox, or disable Confirm Email in Supabase for local development.";
  }

  if (errorCode === "over_email_send_rate_limit") {
    return "Supabase rate-limited auth emails. Wait a bit, or disable Confirm Email in Supabase for local development.";
  }

  return errorCode ? `Supabase sign-in error: ${errorCode}` : null;
}

function getSignupErrorMessage(
  errorCode: string | undefined,
  errorMessage: string | undefined,
) {
  if (errorCode === "weak_password") {
    return "Password is too weak. Use at least 6 characters.";
  }

  if (errorCode === "user_already_exists") {
    return "This account already exists. Sign in instead.";
  }

  if (errorCode === "email_address_invalid") {
    return "Supabase rejected that email address format.";
  }

  if (errorCode === "email_provider_disabled") {
    return "Email auth is disabled in Supabase. Enable the Email provider in Authentication settings.";
  }

  if (errorCode === "over_email_send_rate_limit") {
    return "Supabase rate-limited signup emails. Wait a bit, or disable Confirm Email in Supabase for local development.";
  }

  return errorMessage ?? (errorCode ? `Supabase sign-up error: ${errorCode}` : null);
}

function getStatusMessage(
  status: string | undefined,
  errorCode: string | undefined,
  errorMessage: string | undefined,
) {
  if (status === "signup-check-email") {
    return "Account created. Supabase is waiting for email confirmation before first login. For local testing, disable Confirm Email in Supabase if you want instant signup with no email step.";
  }

  if (status === "signedout") {
    return "You have been signed out.";
  }

  if (status === "invalid-email") {
    return "Enter a valid email address.";
  }

  if (status === "invalid-password") {
    return "Password must be at least 6 characters.";
  }

  if (status === "password-mismatch") {
    return "Passwords do not match.";
  }

  if (status === "signin-error") {
    return (
      getSigninErrorMessage(errorCode) ??
      errorMessage ??
      "Supabase could not sign you in."
    );
  }

  if (status === "signup-error") {
    return (
      getSignupErrorMessage(errorCode, errorMessage) ??
      "Supabase could not create the account."
    );
  }

  if (status === "callback-error") {
    return (
      errorMessage ??
      "The email confirmation link could not be verified. Try opening a fresh confirmation email."
    );
  }

  return null;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { supabase, user } = await getSignedInUser();

  if (user) {
    const profile = await getProfileById(supabase, user.id);

    redirect(isProfileComplete(profile) ? "/browse" : "/profile/me?complete=1");
  }

  const params = await searchParams;
  const status = getSingleParam(params.status);
  const errorCode = getSingleParam(params.error);
  const errorMessage = getSingleParam(params.message);
  const statusMessage = getStatusMessage(status, errorCode, errorMessage);

  return (
    <main className="marketing-shell">
      <section className="marketing-hero">
        <div className="marketing-copy">
          <span className="eyebrow">OVR//MATCH PROTOCOL</span>
          <h1>Build a duo worth queueing for.</h1>
          <p>
            Overwatch Dating is a clean roster-first space for finding people
            who match your role, platform, and preferred mode before you move to
            Discord.
          </p>
          <div className="marketing-points">
            <div className="feature-chip">Browse by platform, role, and mode</div>
            <div className="feature-chip">Hero-first profile builder</div>
            <div className="feature-chip">10-message on-site handoff to Discord</div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="panel-glow" />
          <div className="auth-card">
            <span className="eyebrow">ENTER THE WATCHPOINT</span>
            <h2>Sign in with email and password</h2>
            <p>
              Use standard credentials instead of magic links. If you want
              signup with no email confirmation during local testing, disable
              Confirm Email in Supabase.
            </p>

            {statusMessage ? (
              <div className="status-banner">{statusMessage}</div>
            ) : null}

            <div className="auth-form-stack">
              <form action="/auth/signin" method="post" className="stack-form auth-form-block">
                <h3>Sign in</h3>
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="supportmain@example.com"
                    required
                  />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </label>
                <button type="submit" className="primary-button">
                  Sign In
                </button>
              </form>

              <div className="auth-divider" />

              <form action="/auth/signup" method="post" className="stack-form auth-form-block">
                <h3>Create account</h3>
                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="newplayer@example.com"
                    required
                  />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </label>
                <label className="field">
                  <span>Confirm password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Repeat password"
                    minLength={6}
                    required
                  />
                </label>
                <button type="submit" className="ghost-button">
                  Create Account
                </button>
              </form>
            </div>

            <p className="muted-copy">
              After authentication, users land in profile setup and then unlock
              browse and messaging. Heroes are pulled from your Supabase seed
              table.
            </p>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-panel">
          <h3>Roster Identity</h3>
          <p>
            Each profile stores Discord, platform, role, mode, bio, and your
            favorite heroes.
          </p>
        </article>
        <article className="feature-panel">
          <h3>Signal, Then Handoff</h3>
          <p>
            Any user can start a chat. After 10 sent messages each, the app
            pushes both players to continue on Discord.
          </p>
        </article>
        <article className="feature-panel">
          <h3>Basic Safety</h3>
          <p>
            Block and report tools are built into every profile and
            conversation.
          </p>
        </article>
      </section>

      <footer className="marketing-footer">
        <span>Built with Next.js + Supabase</span>
        <Link href="https://supabase.com" target="_blank" rel="noreferrer">
          Supabase setup
        </Link>
      </footer>
    </main>
  );
}
