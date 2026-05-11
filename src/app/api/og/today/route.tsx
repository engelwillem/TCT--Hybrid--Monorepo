import { todaySessionMock } from '@/features/today-ritual/content/today-session.mock';
import { generateOGImage } from '@/features/og/today/generate-og-image';

export const runtime = 'edge';
export const alt = 'Ayat harian The Chosen Talks';
export const contentType = 'image/png';
export const size = {
  width: 840,
  height: 440,
};

export async function GET() {
  return generateOGImage({
    verseText: todaySessionMock.verseText,
    reference: todaySessionMock.verseReference,
  });
}
