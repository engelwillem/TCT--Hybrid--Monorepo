"use client";

import { useSearchParams } from "next/navigation";
import type { EmotionalEntryState } from "@/ai/core/contracts";
import type { ComposerSubmitResult, PostComposerMetadata } from "./post-composer/types";
import { PostComposer } from "./PostComposer";
import type { CommunityComposerType } from "../categories";
import type { CommunityUser } from "../types";

type CommunitySmartPostComposerProps = {
  onPost: (
    text: string,
    type: CommunityComposerType,
    images?: File[],
    metadata?: PostComposerMetadata,
  ) => Promise<ComposerSubmitResult>;
  currentUser?: CommunityUser;
};

export function CommunitySmartPostComposer({
  onPost,
  currentUser,
}: CommunitySmartPostComposerProps) {
  const searchParams = useSearchParams();
  const intent = searchParams?.get("intent");
  const text = searchParams?.get("text") || "";
  const entryStateRaw = searchParams?.get("entryState");
  const entryState: EmotionalEntryState | null =
    entryStateRaw === "overwhelmed" ||
    entryStateRaw === "disconnected" ||
    entryStateRaw === "clarity" ||
    entryStateRaw === "connect" ||
    entryStateRaw === "neutral"
      ? entryStateRaw
      : null;

  const isReflection = intent === "reflection";
  const initialExpanded = isReflection || text.length > 0;

  return (
    <PostComposer
      onPost={onPost}
      currentUser={currentUser}
      initialType={isReflection ? "reflection" : "user_post"}
      initialText={text}
      initialExpanded={initialExpanded}
      entryState={entryState}
    />
  );
}
