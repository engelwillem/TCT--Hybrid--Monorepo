import { useRef, useState } from "react";
import type { PostComposerMetadata, PostType } from "../components/post-composer/types";

type SubmitSnapshot = {
  text: string;
  type: PostType;
  images: File[];
  metadata?: PostComposerMetadata;
  hasPendingCrop: boolean;
};

type UseComposerSubmitParams = {
  onPost: (text: string, type: PostType, images?: File[], metadata?: PostComposerMetadata) => Promise<boolean | void> | boolean | void;
};

export function useComposerSubmit({ onPost }: UseComposerSubmitParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const clearSubmitError = () => {
    setSubmitError(null);
  };

  const submit = async (snapshot: SubmitSnapshot) => {
    if (submitLockRef.current) return;
    if (!snapshot.text.trim() && snapshot.images.length === 0) return;

    if (snapshot.hasPendingCrop) {
      setSubmitError("Selesaikan editor gambar terlebih dahulu sebelum posting.");
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onPost(snapshot.text, snapshot.type, snapshot.images, snapshot.metadata);
      if (result !== false) {
        return true;
      }

      setSubmitError("Belum berhasil membagikan post. Coba lagi.");
    } catch {
      setSubmitError("Terjadi gangguan saat mengirim post. Coba lagi.");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
    return false;
  };

  return {
    isSubmitting,
    submitError,
    setSubmitError,
    clearSubmitError,
    submit,
  };
}
