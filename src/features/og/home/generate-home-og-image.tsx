import { ImageResponse } from "@vercel/og";

const OG_SIZE = { width: 1200, height: 630 } as const;

const sansStack =
  "Geist, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif";

async function loadFont(
  url: string
): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

async function loadFallbackSansFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(new URL("../Geist-Regular.ttf", import.meta.url));
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function generateHomeOGImage() {
  const fallbackSansFont = await loadFallbackSansFont();
  const serifFont = await loadFont(
    "https://fonts.gstatic.com/s/dmserifdisplay/v18/-nFnOHM81r4j6k0gjAW3mujVU2B2G_5x0vrx52M.woff2"
  );

  const serifFamily = serifFont ? "DM Serif Display" : "Geist";

  const fonts = [
    ...(fallbackSansFont
      ? [{ name: "Geist", data: fallbackSansFont, weight: 400 as const, style: "normal" as const }]
      : []),
    ...(serifFont ? [{ name: "DM Serif Display", data: serifFont, weight: 400 as const, style: "normal" as const }] : []),
  ];

  const options = fonts.length > 0
    ? {
        ...OG_SIZE,
        fonts,
      }
    : OG_SIZE;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: "#0F1A2E",
          color: "#F0F4FF",
          overflow: "hidden",
        }}
      >
        {/* === BACKGROUND LAYER: Radial Glow === */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,224,255,0.18) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 95% 110%, rgba(0,130,190,0.14) 0%, transparent 60%)",
          }}
        />

        {/* === BACKGROUND LAYER: Subtle grid === */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0, opacity: 0.06 }}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38E0FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* === CONTENT LAYER === */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "72px 80px",
          }}
        >
          {/* TOP: Wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* TCT Logo mark (inline SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width={44}
              height={44}
            >
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38E0FF" />
                  <stop offset="100%" stopColor="#00A9D6" />
                </linearGradient>
              </defs>
              <rect x="116" y="150" width="280" height="70" rx="14" fill="url(#logoGrad)" />
              <rect x="221" y="150" width="70" height="220" rx="14" fill="url(#logoGrad)" />
              <circle cx="380" cy="350" r="26" fill="url(#logoGrad)" />
            </svg>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(240,244,255,0.45)",
                  fontFamily: sansStack,
                }}
              >
                The Chosen Talks
              </p>
            </div>
          </div>

          {/* MIDDLE: Hero Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 900 }}>
            {/* Editorial Eyebrow */}
            <p
              style={{
                margin: "0 0 28px 0",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(56, 224, 255, 0.75)",
                fontFamily: sansStack,
              }}
            >
              Renungan Harian Kristen
            </p>

            {/* Serif Display Headline */}
            <h1
              style={{
                margin: 0,
                fontSize: 82,
                lineHeight: 1.04,
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "#EEF3FF",
                fontFamily: serifFamily,
              }}
            >
              Terima Firman.{"\n"}Renungkan. Bertumbuh.
            </h1>

            {/* Divider + Tagline */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                marginTop: 40,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 2,
                  borderRadius: 99,
                  background: "linear-gradient(90deg, #38E0FF, transparent)",
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: 22,
                  lineHeight: 1.5,
                  color: "rgba(200, 215, 255, 0.65)",
                  fontFamily: sansStack,
                  fontWeight: 500,
                }}
              >
                Bersama komunitas iman setiap hari.
              </p>
            </div>
          </div>

          {/* BOTTOM: Brand URL + CTA */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "rgba(200, 215, 255, 0.4)",
                fontFamily: sansStack,
                letterSpacing: "0.04em",
              }}
            >
              thechoosentalks.org
            </p>

            {/* "Invitation" badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                borderRadius: 100,
                border: "1px solid rgba(56, 224, 255, 0.25)",
                background: "rgba(56, 224, 255, 0.06)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(56, 224, 255, 0.85)",
                  fontFamily: sansStack,
                  letterSpacing: "0.06em",
                }}
              >
                Mulai hari ini →
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
    options
  );
}
