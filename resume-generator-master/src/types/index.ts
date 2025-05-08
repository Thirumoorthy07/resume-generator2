import type { z } from 'zod';
import type { FormatResumeInputSchema } from '@/schemas/resumeSchema'; // Corrected import path

// Derive the type from the Zod schema
export type ResumeFormData = z.infer<typeof FormatResumeInputSchema>;

// Keep specific types if needed elsewhere, otherwise the derived type is sufficient
export type Skill = {
  skill: string;
  proficiency: string;
};

export type Project = {
  title: string;
  description: string;
  technologies?: string;
};
