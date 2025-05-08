'use client'; // Keep this if ResumeForm uses client-side hooks

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResumeForm from '@/components/resume-form';

function CreateResumeContent() {
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || 'modern';

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Optional: Add a header or back button here */}
      {/* <div className="mb-4">
        <Link href="/" className="text-accent hover:underline">
          &larr; Back to Templates
        </Link>
      </div> */}
      <ResumeForm initialTemplate={template} />
    </main>
  );
}

export default function CreateResumePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateResumeContent />
    </Suspense>
  );
}
