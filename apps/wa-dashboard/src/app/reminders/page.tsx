import { Suspense } from "react";
import RemindersPageClient from "./page-client";

export default function RemindersPage() {
  return (
    <Suspense fallback={<main><div className="card"><p>Loading reminders...</p></div></main>}>
      <RemindersPageClient />
    </Suspense>
  );
}
