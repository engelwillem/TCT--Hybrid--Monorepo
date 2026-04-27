import { useRef, useState } from "react";
import type {
  ComposerSubmitResult,
  PostComposerMetadata,
  PostType,
} from "../components/post-composer/types";
import { MAX_COMPOSER_TOTAL_UPLOAD_BYTES } from "../components/post-composer/types";
import type { AsyncContractState } from "@/lib/async-state";

type SubmitSnapshot = {
  text: string;
  type: PostType;
  images: File[];
  metadata?: PostComposerMetadata;
  hasPendingCrop: boolean;
};

type UseComposerSubmitParams = {
  onPost: (
    text: string,
    type: PostType,
    images?: File[],
    metadata?: PostComposerMetadata
  ) => Promise<ComposerSubmitResult> | ComposerSubmitResult;
};

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_TOTAL_UPLOAD_SIZE_BYTES = MAX_COMPOSER_TOTAL_UPLOAD_BYTES;

type ComposerSubmitFailure = Exclude<ComposerSubmitResult, { ok: true }>;

function validateImages(images: File[]): ComposerSubmitFailure | null {
  if (images.length > MAX_UPLOAD_IMAGES) {
    return {
      ok: false,
      kind: "validation",
      message: `Maksimal ${MAX_UPLOAD_IMAGES} gambar per post.`,
      status: 422,
    };
  }

  for (let index = 0; index < images.length; index += 1) {
    const file = images[index];
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return {
        ok: false,
        kind: "validation",
        message: `Format gambar ke-${index + 1} tidak didukung. Gunakan PNG, JPG, atau WEBP.`,
        status: 422,
      };
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return {
        ok: false,
        kind: "validation",
        message: `Ukuran gambar ke-${index + 1} melebihi 5MB.`,
        status: 422,
      };
    }
  }

  const totalSize = images.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_UPLOAD_SIZE_BYTES) {
    return {
      ok: false,
      kind: "validation",
      message: "Total ukuran gambar terlalu besar. Kurangi jumlah gambar atau gunakan gambar yang lebih ringan.",
      status: 413,
    };
  }

  return null;
}

export function useComposerSubmit({ onPost }: UseComposerSubmitParams) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<AsyncContractState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submitLockRef = useRef(false);

  const clearSubmitError = () => {
    setSubmitError(null);
    setSubmitState((prev) => (prev === "retryable_error" || prev === "fatal_error" ? "idle" : prev));
  };

  const submit = async (snapshot: SubmitSnapshot) => {
    if (submitLockRef.current) return;
    if (!snapshot.text.trim() && snapshot.images.length === 0) return;

    if (snapshot.hasPendingCrop) {
      setSubmitError("Selesaikan editor gambar terlebih dahulu sebelum posting.");
      setSubmitState("retryable_error");
      return;
    }

    const fileValidation = validateImages(snapshot.images);
    if (fileValidation) {
      setSubmitError(fileValidation.message);
      setSubmitState("retryable_error");
      return false;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitState("submitting");
    setSubmitError(null);

    try {
      const result = await onPost(snapshot.text, snapshot.type, snapshot.images, snapshot.metadata);
      if (result.ok) {
        setSubmitState("ready");
        return true;
      }

      if (!result.ok) {
        setSubmitError(result.message);
        const hasFatalStatus = typeof result.status === "number" && result.status >= 500;
        setSubmitState(hasFatalStatus ? "fatal_error" : "retryable_error");
      }
    } catch (error) {
      const fallbackMessage = error instanceof Error && error.message
        ? error.message
        : "Terjadi gangguan saat mengirim post. Coba lagi.";
      setSubmitError(fallbackMessage);
      setSubmitState("retryable_error");
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
    return false;
  };

  return {
    isSubmitting,
    submitState,
    submitError,
    setSubmitError,
    clearSubmitError,
    submit,
  };
}
