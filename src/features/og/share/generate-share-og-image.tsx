import { ImageResponse } from '@vercel/og';
import { OGContainer, OGFooter, OGTopVisual } from '@/features/og/today/layout';
import type { ShareOGPayload } from './types';
import type { CSSProperties } from 'react';

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

function ScriptureBlock({
  title,
  body,
  meta,
  eyebrow,
  serifFamily,
}: {
  title: string;
  body: string;
  meta: string;
  eyebrow: string;
  serifFamily: string;
}) {
  const wrapStyle: CSSProperties = {
    marginTop: '-102px',
    width: '100%',
    maxWidth: '860px',
    display: 'flex',
    flexDirection: 'column',
  };

  const eyebrowStyle: CSSProperties = {
    margin: 0,
    fontSize: 18,
    lineHeight: 1.2,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(92, 98, 108, 0.64)',
    fontFamily: 'Inter, sans-serif',
  };

  const titleStyle: CSSProperties = {
    margin: '20px 0 0 0',
    fontSize: 28,
    lineHeight: 1.2,
    color: 'rgba(26, 26, 26, 0.84)',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 700,
  };

  const bodyStyle: CSSProperties = {
    margin: '18px 0 0 0',
    fontSize: 48,
    lineHeight: 1.28,
    letterSpacing: '-0.01em',
    color: 'rgba(26, 26, 26, 0.92)',
    fontFamily: serifFamily,
    whiteSpace: 'pre-wrap',
  };

  const metaStyle: CSSProperties = {
    margin: '24px 0 0 0',
    fontSize: 19,
    lineHeight: 1.38,
    color: 'rgba(92, 98, 108, 0.68)',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.02em',
  };

  return (
    <div style={wrapStyle}>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <p style={titleStyle}>{title}</p>
      <p style={bodyStyle}>{`“${body}”`}</p>
      <p style={metaStyle}>{meta}</p>
    </div>
  );
}

function MediaBlock({
  title,
  body,
  meta,
  eyebrow,
}: {
  title: string;
  body: string;
  meta: string;
  eyebrow: string;
}) {
  const wrapStyle: CSSProperties = {
    marginTop: '-74px',
    width: '100%',
    maxWidth: '900px',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '30px',
    background: 'rgba(255,255,255,0.84)',
    padding: '28px 32px 30px 32px',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
  };

  const eyebrowStyle: CSSProperties = {
    margin: 0,
    fontSize: 17,
    lineHeight: 1.2,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'rgba(92, 98, 108, 0.64)',
    fontFamily: 'Inter, sans-serif',
  };

  const titleStyle: CSSProperties = {
    margin: '18px 0 0 0',
    fontSize: 32,
    lineHeight: 1.2,
    color: 'rgba(26, 26, 26, 0.92)',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800,
  };

  const bodyStyle: CSSProperties = {
    margin: '14px 0 0 0',
    fontSize: 22,
    lineHeight: 1.45,
    color: 'rgba(40, 44, 52, 0.76)',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'pre-wrap',
  };

  const metaStyle: CSSProperties = {
    margin: '18px 0 0 0',
    fontSize: 18,
    lineHeight: 1.38,
    color: 'rgba(92, 98, 108, 0.68)',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.02em',
  };

  return (
    <div style={wrapStyle}>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <p style={titleStyle}>{title}</p>
      <p style={bodyStyle}>{body}</p>
      <p style={metaStyle}>{meta}</p>
    </div>
  );
}

export async function generateShareOGImage(payload: ShareOGPayload) {
  const serifFont = await loadSerifFont();
  const serifFamily = serifFont ? 'DM Serif Display' : 'serif';

  return new ImageResponse(
    (
      <OGContainer>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <OGTopVisual imageUrl={payload.imageUrl ?? null} />
          {payload.kind === 'scripture' ? (
            <ScriptureBlock
              eyebrow={payload.eyebrow ?? 'The Chosen Talks'}
              title={payload.title}
              body={payload.body}
              meta={payload.meta}
              serifFamily={serifFamily}
            />
          ) : (
            <MediaBlock
              eyebrow={payload.eyebrow ?? 'The Chosen Talks'}
              title={payload.title}
              body={payload.body}
              meta={payload.meta}
            />
          )}
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
