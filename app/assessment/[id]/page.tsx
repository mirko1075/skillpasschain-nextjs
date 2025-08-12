'use client';

import { AssessmentPage } from '@/components/assessment/assessment-page';

export default function Assessment({ params }: { params: { id: string } }) {
  return <AssessmentPage assessmentId={params.id} />;
}