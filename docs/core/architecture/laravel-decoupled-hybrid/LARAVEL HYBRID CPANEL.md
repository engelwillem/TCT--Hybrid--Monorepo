# Architecture Plan: Next.js 15 + Firebase on cPanel

Implementing Next.js 15 on cPanel requires a specific configuration because cPanel is traditionally optimized for PHP. To get the "The Chosen" premium experience while keeping your current hosting, here is the best end-to-end planning.

## 1. Frontend Architecture: Next.js Standalone
cPanel's "Setup Node.js App" (Phusion Passenger) works best with a **Standalone Build**.

- **Mode**: `output: 'standalone'` in `next.config.js`.
- **Reason**: This bundles all necessary `node_modules` into a small package that can run efficiently on cPanel's limited Node.js environment.
- **Styling**: Tailwind CSS v4 for fast, modern styling.

## 2. Backend & Data Strategy: The Hybrid Model
Since you want Firebase but have a MySQL database on cPanel:

- **MySQL (cPanel)**: Keep this for large relational data (Bible Verses, User Profiles, History). Use **Prisma** to connect to it from Next.js API Routes.
- **Firebase Studio**:
    - **Authentication**: Use Firebase Auth for social login (Google/Email).
    - **Firestore**: Use for real-time features (Community Chat, Live Notifications).
    - **Remote Config**: Use for A/B testing Hero variants (A/B testing the "Bertumbuh Bersama" text).
- **API Routes**: Next.js `/api` folder will replace your Laravel Controllers.

## 3. Communication Layer (Bridge)
- **Environment Variables**: Managed via cPanel's Node.js App interface (replaces your `.env` file).
- **Database Connection**: Next.js will connect to `localhost:3306` (MySQL) directly since they live on the same cPanel server.

## 4. Deployment Workflow (CI/CD)
To maintain the "Zero-Downtime" logic we built in your `deploy.sh`:

1.  **Local/CI**: `npm run build` (Targeting Standalone).
2.  **GitHub Actions**:
    - Build the app.
    - Zip the `.next/standalone`, `.next/static`, and `public` folders.
    - **rsync** the zip to cPanel.
3.  **cPanel Side**:
    - Unzip to a `releases/TIMESTAMP` folder.
    - Update a `current` symlink.
    - Restart the Node.js App via `touch tmp/restart.txt`.

## 5. Security & Optimization
- **Proxy**: Use cPanel's Apache to proxy requests to the Node.js port.
- **Images**: Use Firebase Storage or Cloudinary for optimized media, as cPanel disk I/O can be slow for high-traffic media.
- **Genkit (AI)**: Run Genkit as part of your Next.js API routes on cPanel. It will use Gemini API (external), so it won't strain your cPanel CPU heavily.

---

### Comparison: Laravel vs Next.js on cPanel

| Feature | Laravel (Current) | Next.js (New) |
| :--- | :--- | :--- |
| **Engine** | PHP 8.x + Apache/LiteSpeed | Node.js 20+ (Passenger) |
| **Database** | Eloquent (SQL) | Prisma/Drizzle (SQL + Firestore) |
| **UI Updates** | Inertia.js (Partial) | React Server Components (Streaming) |
| **Speed** | Good (Fast PHP) | Premium (Instant Client Navigation) |
