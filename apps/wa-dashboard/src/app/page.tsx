import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="card">
        <h1>WA Reminder Dashboard</h1>
        <p>Main frontend to manage reminders without editing spreadsheets.</p>
        <p>
          Continue to <Link className="link" href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}
