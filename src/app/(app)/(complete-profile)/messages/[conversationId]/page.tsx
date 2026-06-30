import { notFound } from "next/navigation";

import { ConversationView } from "@/components/messages/conversation-view";
import { BlockButton } from "@/components/social/block-button";
import { ReportDialog } from "@/components/social/report-dialog";
import { requireUser } from "@/lib/auth";
import { getConversationDetail } from "@/lib/data";
import { parseConversationId } from "@/lib/validation";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { conversationId } = await params;
  const { supabase, user } = await requireUser();
  const detail = await getConversationDetail(
    supabase,
    parseConversationId(conversationId),
    user.id,
  );

  if (!detail) {
    notFound();
  }

  return (
    <section className="page-stack">
      <div className="section-panel">
        <div className="section-header">
          <div>
            <span className="eyebrow">Conversation</span>
            <h1>{detail.other_user.name}</h1>
          </div>
          <div className="card-actions">
            <BlockButton blockedId={detail.other_user.id} redirectTo="/messages" />
          </div>
        </div>

        <p className="muted-copy">
          Discord handoff target: <strong>{detail.other_user.discord}</strong>
        </p>
        <ReportDialog
          reportedId={detail.other_user.id}
          conversationId={detail.conversation.id}
        />
      </div>

      <ConversationView
        conversationId={detail.conversation.id}
        currentUserId={user.id}
        initialMessages={detail.messages}
        otherUserDiscord={detail.other_user.discord}
        otherUserName={detail.other_user.name}
      />
    </section>
  );
}
