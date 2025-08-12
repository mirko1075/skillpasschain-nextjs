'use client';

import { AssessmentPage } from '@/components/assessment/assessment-page';

export async function generateStaticParams() {
  // For static export, we need to define which assessment IDs to pre-generate
  // In a real app, you might fetch this from your API or database
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function Assessment({ params }: { params: { id: string } }) {
  return <AssessmentPage assessmentId={params.id} />;
}