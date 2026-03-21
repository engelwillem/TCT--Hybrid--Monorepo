import { ImageResponse } from '@vercel/og';
import { OGContainer, OGFooter, OGTopVisual, OGVerseBlock } from './layout';
import type { TodayOGData } from './types';

const OG_SIZE = {
  width: 1200,
  height: 630,
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

export async function generateOGImage(data: TodayOGData) {
  const serifFont = await loadSerifFont();
  const serifFamily = serifFont ? 'DM Serif Display' : 'serif';

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
    {
      ...OG_SIZE,
      fonts: serifFont
        ? [
            {
              name: 'DM Serif Display',
              data: serifFont,
              style: 'normal',
              weight: 400,
            },
          ]
        : [],
    }
  );
}

