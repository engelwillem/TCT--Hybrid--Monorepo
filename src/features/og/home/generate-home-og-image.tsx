import { ImageResponse } from "@vercel/og";

const OG_SIZE = {
  width: 1200,
  height: 630,
} as const;

export function generateHomeOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background:
            "radial-gradient(1200px 450px at 18% -10%, rgba(47,102,214,0.24) 0%, rgba(47,102,214,0) 65%), linear-gradient(180deg, #F7FAFF 0%, #EEF4FF 100%)",
          color: "#13213F",
        }}
      >
        <div
          style={{
            fontSize: 20,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "rgba(30, 63, 122, 0.72)",
          }}
        >
          The Chosen Talks
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 960 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 74,
              lineHeight: 1.06,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#102246",
            }}
          >
            Renungan Harian Kristen
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: 1.22,
              fontWeight: 600,
              color: "rgba(16, 34, 70, 0.9)",
            }}
          >
            Terima Firman, Renungkan Ayat, Bertumbuh Bersama Komunitas Iman.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 12,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#1F4CA2",
            }}
          >
            thechoosentalks.org
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "rgba(16, 34, 70, 0.62)",
            }}
          >
            Mulai dari /renungan
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}

