import { ImageResponse } from '@vercel/og';
import { OGContainer, OGFooter, OGTopVisual, OGVerseBlock } from './layout';
import type { TodayOGData } from './types';

const OG_SIZE = {
  width: 840,
  height: 440,
} as const;

async function loadSerifFont(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(
      'https://fonts.gstatic.com/s/dmserifdisplay/v18/-nFnOHM81r4j6k0gjAW3mujVU2B2G_5x0vrx52M.woff2'
    );
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

async function loadFallbackSansFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(new URL('../Geist-Regular.ttf', import.meta.url));
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function generateOGImage(data: TodayOGData) {
  const fallbackSansFont = await loadFallbackSansFont();
  const serifFont = await loadSerifFont();
  const serifFamily = serifFont ? 'DM Serif Display' : 'Geist';

  const fonts = [
    ...(fallbackSansFont
      ? [
          {
            name: 'Geist',
            data: fallbackSansFont,
            style: 'normal' as const,
            weight: 400 as const,
          },
        ]
      : []),
    ...(serifFont
      ? [
          {
            name: 'DM Serif Display',
            data: serifFont,
            style: 'normal' as const,
            weight: 400 as const,
          },
        ]
      : []),
  ];

  const options = fonts.length > 0
    ? {
        ...OG_SIZE,
        fonts,
      }
    : OG_SIZE;

  return new ImageResponse(
    (
      <OGContainer>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <OGTopVisual imageUrl={data.imageUrl ?? null} />
          <OGVerseBlock
            verseText={data.verseText}
            reference={data.reference}
            serifFamily={serifFamily}
          />
        </div>
        <OGFooter />
      </OGContainer>
    ),
    options
  );
}
