import { redirect } from "next/navigation";

export default function VerseHubRootRedirectPage() {
  redirect("/renungan?source=versehub&intent=organic-entry&pane=pendalaman-firman");
}
