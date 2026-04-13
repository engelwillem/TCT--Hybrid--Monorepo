import type { CSSProperties, ReactNode } from 'react';

const sansStack =
  'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif';

/**
 * Premium OG Background with subtle noise texture
 */
export function OGContainer({ children, className }: { children: ReactNode; className?: string }) {
  const outerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#F5F9FF',
    color: '#13213F',
    overflow: 'hidden',
  };

  return (
    <div style={outerStyle}>
      <div style={{ position: 'absolute', inset: 0, background: '#F5F9FF' }} />

      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        width: '100%', 
        height: '100%',
        padding: '64px 72px'
      }}>
        {children}
      </div>
    </div>
  );
}

export function OGTopVisual({ imageUrl }: { imageUrl?: string | null }) {
  const wrapStyle: CSSProperties = {
    width: '100%',
    height: '44%',
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    border: '2px solid #D9E8FB',
  };

  return (
    <div
      style={{
        ...wrapStyle,
        background: 'linear-gradient(135deg, #DDEEFF 0%, #F1F7FF 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(239,246,255,0) 0%, rgba(239,246,255,0.08) 65%, rgba(239,246,255,1) 100%)',
        }}
      />
      {imageUrl ? (
        <div
          style={{
            position: 'absolute',
            right: 18,
            bottom: 14,
            fontSize: 16,
            color: '#2C4F7A',
            fontFamily: sansStack,
            fontWeight: 700,
          }}
        >
          Refleksi Harian
        </div>
      ) : null}
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '-42px' }}>
      <p style={{ 
        margin: 0, 
        fontSize: 46, 
        lineHeight: 1.2, 
        color: '#102246', 
        fontFamily: serifFamily, 
        fontWeight: 400 
      }}>
        {`“${verseText}”`}
      </p>
      <p style={{ 
        margin: '32px 0 0 0', 
        fontSize: 20, 
        fontWeight: 700, 
        color: '#3A5B85', 
        letterSpacing: '0.03em',
        fontFamily: sansStack 
      }}>
        {reference.toUpperCase()}
      </p>
    </div>
  );
}

export function OGFooter() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 2, backgroundColor: '#7EA8D8' }} />
      <p style={{ 
        margin: 0, 
        fontSize: 16, 
        fontWeight: 800, 
        color: '#4E709A', 
        fontFamily: sansStack, 
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      }}>
        The Chosen Talks
      </p>
    </div>
  );
}
