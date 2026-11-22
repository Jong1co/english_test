import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { getSituation, situations } from '@/data/situations';
import { PracticeSession } from '@/features/practice/practice-session';

type Params = Promise<{ situationId: string }>;

export function generateStaticParams() {
  return situations.map((situation) => ({ situationId: situation.id }));
}

/** The id is read inside Suspense, so the route's shared App Shell doesn't depend on the URL. */
export default function PracticePage({ params }: { params: Params }) {
  return (
    <Suspense>
      <Practice params={params} />
    </Suspense>
  );
}

/** An unknown situation goes back to Home. */
async function Practice({ params }: { params: Params }) {
  const { situationId } = await params;
  const situation = getSituation(situationId);
  if (!situation) {
    redirect('/');
  }
  return <PracticeSession situation={situation} />;
}
