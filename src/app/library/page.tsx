import { redirect } from 'next/navigation';

export default function LibraryPage() {
  redirect('/renungan?source=library&intent=organic-entry');
}
