import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect the front door to the English localized site
  redirect('/en');
}
