import { useRef, useState } from "react";
import type {
  ComposerSubmitResult,
  PostComposerMetadata,
  PostType,
} from "../components/post-composer/types";

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

  return null;
}

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

    const fileValidation = validateImages(snapshot.images);
    if (fileValidation) {
      setSubmitError(fileValidation.message);
      return false;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onPost(snapshot.text, snapshot.type, snapshot.images, snapshot.metadata);
      if (result.ok) {
        return true;
      }

      if (!result.ok) {
        setSubmitError(result.message);
      }
    } catch (error) {
      const fallbackMessage = error instanceof Error && error.message
        ? error.message
        : "Terjadi gangguan saat mengirim post. Coba lagi.";
      setSubmitError(fallbackMessage);
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
