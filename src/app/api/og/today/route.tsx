import { buildTodaySessionMock } from '@/features/today-ritual/content/today-session.mock';
import { loadRenunganSessionContentWithDiagnostics } from '@/features/today-ritual/data/today-session.loader';
import { generateOGImage } from '@/features/og/today/generate-og-image';

export const runtime = 'edge';
export const alt = 'Ayat harian The Chosen Talks';
export const contentType = 'image/png';
export const size = {
  width: 840,
  height: 440,
};

export async function GET() {
  try {
    const loaded = await loadRenunganSessionContentWithDiagnostics();
    return generateOGImage({
      verseText: loaded.content.verseText,
      reference: loaded.content.verseReference,
    });
  } catch {
    const fallback = buildTodaySessionMock();
    return generateOGImage({
      verseText: fallback.verseText,
      reference: fallback.verseReference,
    });
  }
}
