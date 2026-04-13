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
    backgroundColor: '#FAFCFF',
    color: '#13213F',
    overflow: 'hidden',
  };

  return (
    <div style={outerStyle}>
      {/* Noise Texture Layer */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0.15 }}
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
      
      {/* Subtle Gradient Overlay */}
      <div 
        style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'radial-gradient(circle at 100% 0%, rgba(56, 224, 255, 0.08) 0%, transparent 45%), radial-gradient(circle at 0% 100%, rgba(0, 169, 214, 0.05) 0%, transparent 40%)'
        }} 
      />

      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        width: '100%', 
        height: '100%',
        padding: '80px 84px'
      }}>
        {children}
      </div>
    </div>
  );
}

export function OGTopVisual({ imageUrl }: { imageUrl?: string | null }) {
  const wrapStyle: CSSProperties = {
    width: '100%',
    height: '48%',
    borderRadius: '32px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)',
    border: '1px solid rgba(255,255,255,0.6)',
  };

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(239,246,255,0) 0%, rgba(239,246,255,0.4) 60%, rgba(239,246,255,1) 100%)',
    zIndex: 2,
  };

  if (!imageUrl) {
    return (
      <div style={{ ...wrapStyle, background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)' }}>
        <div style={overlayStyle} />
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={imageUrl} 
        alt="" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />
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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '-60px' }}>
      <p style={{ 
        margin: 0, 
        fontSize: 54, 
        lineHeight: 1.25, 
        color: '#102246', 
        fontFamily: serifFamily, 
        fontWeight: 400 
      }}>
        {`“${verseText}”`}
      </p>
      <p style={{ 
        margin: '32px 0 0 0', 
        fontSize: 22, 
        fontWeight: 600, 
        color: 'rgba(16, 34, 70, 0.5)', 
        letterSpacing: '0.04em',
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
      <div style={{ width: 40, height: 1, backgroundColor: 'rgba(16, 34, 70, 0.2)' }} />
      <p style={{ 
        margin: 0, 
        fontSize: 16, 
        fontWeight: 800, 
        color: 'rgba(16, 34, 70, 0.35)', 
        fontFamily: sansStack, 
        letterSpacing: '0.2em',
        textTransform: 'uppercase'
      }}>
        The Chosen Talks
      </p>
    </div>
  );
}

