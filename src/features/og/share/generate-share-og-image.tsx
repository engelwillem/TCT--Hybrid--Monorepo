import { ImageResponse } from "@vercel/og";
import type { ShareOGPayload } from "./types";

const OG_SIZE = { width: 840, height: 440 } as const;

const sansStack =
  "Geist, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, Arial, sans-serif";

async function loadSerifFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      "https://fonts.gstatic.com/s/dmserifdisplay/v18/-nFnOHM81r4j6k0gjAW3mujVU2B2G_5x0vrx52M.woff2"
    );
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

/**
 * Premium Scripture OG — used for VerseHub share links.
 * Design: Light cream editorial, giant serif quote, accent line, glass-card footer.
 */
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
  const displayBody = body.length > 180 ? body.slice(0, 177) + "…" : body;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "72px 80px",
        justifyContent: "space-between",
      }}
    >
      {/* TOP: Brand mark */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Inline TCT Logo SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={36} height={36}>
          <defs>
            <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38E0FF" />
              <stop offset="100%" stopColor="#00A9D6" />
            </linearGradient>
          </defs>
          <rect x="116" y="150" width="280" height="70" rx="14" fill="url(#lg)" />
          <rect x="221" y="150" width="70" height="220" rx="14" fill="url(#lg)" />
          <circle cx="380" cy="350" r="26" fill="url(#lg)" />
        </svg>

        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(16, 34, 70, 0.35)",
            fontFamily: sansStack,
          }}
        >
          The Chosen Talks
        </span>

        {/* Eyebrow badge */}
        <div
          style={{
            display: "flex",
            marginLeft: 16,
            padding: "5px 14px",
            borderRadius: 100,
            background: "rgba(0, 169, 214, 0.08)",
            border: "1px solid rgba(0, 169, 214, 0.18)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(0, 130, 180, 0.8)",
              fontFamily: sansStack,
            }}
          >
            {eyebrow}
          </span>
        </div>
      </div>

        {/* MIDDLE: Verse content */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 960, gap: 0 }}>
        {/* The verse body */}
        <p
          style={{
            margin: 0,
            fontSize: 44,
            lineHeight: 1.18,
            letterSpacing: "-0.015em",
            color: "#0E1C38",
            fontFamily: serifFamily,
            fontWeight: 400,
          }}
        >
          {displayBody}
        </p>

        {/* Reference line */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 32 }}>
          <div
            style={{
              width: 40,
              height: 2,
              borderRadius: 99,
              background: "linear-gradient(90deg, #00A9D6, transparent)",
            }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#3A5B85",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: sansStack,
            }}
          >
            {title}
          </p>
          {meta && meta !== "The Chosen Talks" && (
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 500,
                color: "#56749B",
                letterSpacing: "0.06em",
                fontFamily: sansStack,
              }}
            >
              · {meta}
            </p>
          )}
        </div>
      </div>

      {/* BOTTOM: Invitation bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 16,
          borderTop: "1px solid #D9E8FB",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: "#4E709A",
            fontFamily: sansStack,
            letterSpacing: "0.04em",
          }}
        >
          thechoosentalks.org
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: "#5C7CA4",
            fontFamily: sansStack,
            letterSpacing: "0.06em",
          }}
        >
          Buka & Renungkan →
        </p>
      </div>
    </div>
  );
}

/**
 * Premium Media OG — used for Community / generic share cards.
 * Design: Clean light card with strong title hierarchy.
 */
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
  const displayBody = body.length > 180 ? body.slice(0, 177) + "…" : body;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "72px 80px",
        justifyContent: "space-between",
      }}
    >
      {/* TOP brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={36} height={36}>
          <defs>
            <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38E0FF" />
              <stop offset="100%" stopColor="#00A9D6" />
            </linearGradient>
          </defs>
          <rect x="116" y="150" width="280" height="70" rx="14" fill="url(#lg2)" />
          <rect x="221" y="150" width="70" height="220" rx="14" fill="url(#lg2)" />
          <circle cx="380" cy="350" r="26" fill="url(#lg2)" />
        </svg>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(16, 34, 70, 0.35)",
            fontFamily: sansStack,
          }}
        >
          The Chosen Talks
        </span>
        <div
          style={{
            display: "flex",
            marginLeft: 16,
            padding: "5px 14px",
            borderRadius: 100,
            background: "rgba(0, 169, 214, 0.08)",
            border: "1px solid rgba(0, 169, 214, 0.18)",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(0, 130, 180, 0.8)",
              fontFamily: sansStack,
            }}
          >
            {eyebrow}
          </span>
        </div>
      </div>

      {/* MIDDLE: Title + Body */}
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 960, gap: 20 }}>
        <p
          style={{
            margin: 0,
            fontSize: 62,
            lineHeight: 1.1,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#0E1C38",
            fontFamily: sansStack,
          }}
        >
          {title}
        </p>
        {displayBody && (
          <p
            style={{
              margin: 0,
              fontSize: 26,
              lineHeight: 1.5,
              color: "rgba(14, 28, 56, 0.55)",
              fontFamily: sansStack,
              fontWeight: 400,
            }}
          >
            {displayBody}
          </p>
        )}
      </div>

      {/* BOTTOM */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 16,
          borderTop: "1px solid rgba(16, 34, 70, 0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: "rgba(16, 34, 70, 0.3)",
            fontFamily: sansStack,
          }}
        >
          thechoosentalks.org
        </p>
        {meta && (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(16, 34, 70, 0.25)",
              fontFamily: sansStack,
            }}
          >
            {meta}
          </p>
        )}
      </div>
    </div>
  );
}

export async function generateShareOGImage(payload: ShareOGPayload) {
  const fallbackSansFont = await loadFallbackSansFont();
  const serifFontData = await loadSerifFont();
  const serifFamily = serifFontData ? "DM Serif Display" : "Geist";

  const bg = "#F4F8FF";

  const fonts = [
    ...(fallbackSansFont
      ? [{ name: "Geist", data: fallbackSansFont, weight: 400 as const, style: "normal" as const }]
      : []),
    ...(serifFontData
      ? [{ name: "DM Serif Display", data: serifFontData, weight: 400 as const, style: "normal" as const }]
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
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: bg,
          overflow: "hidden",
        }}
      >
        {/* Keep background low-complexity to reduce PNG file size */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, #F4F8FF 0%, #EEF5FF 100%)",
          }}
        />

        {/* Content — sits on top of all backgrounds */}
        <div style={{ position: "relative", display: "flex", width: "100%", height: "100%" }}>
          {payload.kind === "scripture" ? (
            <ScriptureBlock
              eyebrow={payload.eyebrow ?? "VerseHub"}
              title={payload.title}
              body={payload.body}
              meta={payload.meta}
              serifFamily={serifFamily}
            />
          ) : (
            <MediaBlock
              eyebrow={payload.eyebrow ?? "Community"}
              title={payload.title}
              body={payload.body}
              meta={payload.meta}
            />
          )}
        </div>
      </div>
    ),
    options
  );
}
