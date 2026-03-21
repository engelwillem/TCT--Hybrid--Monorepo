import type { CSSProperties, ReactNode } from 'react';

const sansStack =
  'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif';

export function OGContainer({ children }: { children: ReactNode }) {
  const style: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#FAFCFF',
    padding: '72px',
    color: 'rgba(26, 26, 26, 0.92)',
  };

  return <div style={style}>{children}</div>;
}

export function OGTopVisual({ imageUrl }: { imageUrl?: string | null }) {
  const wrapStyle: CSSProperties = {
    width: '100%',
    height: '55%',
    borderRadius: '28px',
    overflow: 'hidden',
    position: 'relative',
    background:
      'linear-gradient(180deg, rgba(227,235,224,0.52) 0%, rgba(239,242,234,0.18) 58%, rgba(250,252,255,0) 100%)',
  };

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.2,
  };

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(250,252,255,0.18) 0%, rgba(250,252,255,0.74) 64%, rgba(250,252,255,0.98) 100%)',
  };

  if (!imageUrl) {
    return (
      <div style={wrapStyle}>
        <div style={overlayStyle} />
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" style={imageStyle} />
      <div style={overlayStyle} />
    </div>
  );
}

export function OGVerseBlock({
  verseText,
  reference,
  serifFamily,
}: {
  verseText: string;
  reference: string;
  serifFamily: string;
}) {
  const wrapStyle: CSSProperties = {
    marginTop: '-102px',
    width: '100%',
    maxWidth: '840px',
    display: 'flex',
    flexDirection: 'column',
  };

  const verseStyle: CSSProperties = {
    margin: 0,
    fontSize: 50,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    color: 'rgba(26, 26, 26, 0.9)',
    fontFamily: serifFamily,
    whiteSpace: 'pre-wrap',
  };

  const refStyle: CSSProperties = {
    margin: '28px 0 0 0',
    fontSize: 19,
    lineHeight: 1.38,
    color: 'rgba(92, 98, 108, 0.62)',
    fontFamily: sansStack,
    letterSpacing: '0.02em',
  };

  return (
    <div style={wrapStyle}>
      <p style={verseStyle}>{`“${verseText}”`}</p>
      <p style={refStyle}>{reference}</p>
    </div>
  );
}

export function OGFooter() {
  const style: CSSProperties = {
    margin: 0,
    fontSize: 18,
    color: 'rgba(102, 102, 102, 0.46)',
    fontFamily: sansStack,
    letterSpacing: '0.08em',
  };

  return <p style={style}>The Chosen Talks</p>;
}

