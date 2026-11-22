import { notFound } from 'next/navigation';

import { TutorCheck } from '@/features/dev/tutor-check';

/** Development only: the page does not exist in a production build. */
export default function TutorCheckPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <TutorCheck />;
}
