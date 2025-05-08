'use server';

/**
 * @fileOverview Formats resume data into a professional-looking resume using an AI model,
 * enhancing it with a generated summary and potentially refining details.
 *
 * - formatResume - A function that formats and enhances resume information.
 * - FormatResumeInput - The input type for the formatResume function.
 * - FormatResumeOutput - The return type for the formatResume function.
 */

import { FormatResumeInputSchema } from '@/schemas/resumeSchema';
import { generateContent } from '../gemini';
import { z } from 'zod';

export type FormatResumeInput = z.infer<typeof FormatResumeInputSchema>;

const FormatResumeOutputSchema = z.object({
  formattedResume: z.string().describe('The formatted and enhanced resume in a clean, modern layout. Use markdown for basic formatting like headings (#, ##), bold (**text**), and bullet points (- item). Ensure proper spacing and alignment for readability. Includes a generated professional summary and potentially refined descriptions.'),
});

export type FormatResumeOutput = z.infer<typeof FormatResumeOutputSchema>;

export async function formatResume(input: FormatResumeInput): Promise<FormatResumeOutput> {
  const prompt = `You are a professional resume writer and ATS optimization expert. Your task is to ENHANCE and EXPAND the provided resume content, not just format it. For each section:

1. Career Objective (MOST IMPORTANT):
   - Take the provided objective and completely rewrite it to be more professional and specific
   - Add industry-specific goals and aspirations
   - Include relevant skills and experience
   - Add measurable career objectives
   - Make it specific to the candidate's field and experience
   - Use action verbs and power words
   - Include quantifiable achievements
   - Make it compelling and unique
   - Example format: "Seeking a [position] role in [industry] where I can leverage my [specific skills] to [specific goal]. With [X years] of experience in [specific area], I aim to [specific achievement] while contributing to [company goal]."

2. Education:
   - For each education entry, add:
     * Detailed descriptions of key coursework
     * Academic achievements and honors
     * Relevant projects and research
     * Leadership roles and responsibilities
     * Skills developed during studies

3. Projects:
   - For each project, expand to include:
     * Detailed project objectives and scope
     * Specific technologies and tools used
     * Technical challenges and solutions
     * Quantifiable results and impact
     * Skills and learnings gained

4. Technical Skills:
   - Group related skills
   - Add proficiency levels
   - Include relevant certifications
   - Add industry-specific tools

5. Achievements and Extra Curricular:
   - Add quantifiable results
   - Include leadership roles
   - Highlight relevant skills
   - Show impact and outcomes

Generate a resume in Markdown format for:
Name: ${input.fullName}
Father's Name: ${input.fatherName}
Date of Birth: ${input.dateOfBirth}
Gender: ${input.gender}
Languages: ${input.languages.join(', ')}
Email: ${input.email}
Phone: ${input.phoneNumber}
${input.address ? `Address: ${input.address}` : ''}
${input.linkedin ? `LinkedIn: ${input.linkedin}` : ''}
${input.github ? `GitHub: ${input.github}` : ''}
${input.portfolio ? `Portfolio: ${input.portfolio}` : ''}

Career Objective: COMPLETELY REWRITE this objective to be more professional and specific:
${input.careerObjective}

Education: EXPAND each entry with detailed information:
${input.education.map(e => `- ${e.institution}, ${e.degree}${e.field ? ` (${e.field})` : ''}, ${e.year}${e.gpa ? ` | GPA: ${e.gpa}` : ''}${e.coursework ? ` | Coursework: ${e.coursework}` : ''}${e.honors ? ` | Honors: ${e.honors}` : ''}`).join('\n')}

Technical Skills: ENHANCE with proficiency levels and groupings:
${input.technicalSkills.map(s => `${s.name}${s.level ? ` (${s.level})` : ''}`).join(', ')}
${input.otherSkills && input.otherSkills.length ? `Other Skills: ${input.otherSkills.join(', ')}` : ''}

Projects: EXPAND each project with detailed information:
${input.projects.map(p => `- ${p.title}: ${p.description}${p.technologies ? ` (Technologies: ${p.technologies})` : ''}${p.challenges ? ` (Challenges: ${p.challenges})` : ''}${p.results ? ` (Results: ${p.results})` : ''}`).join('\n')}

Achievements: ENHANCE with quantifiable results:
${input.achievements.map(a => `- ${a}`).join('\n')}

Extra Curricular: EXPAND with leadership roles and impact:
${input.extraCurricular.map(e => `- ${e}`).join('\n')}

IMPORTANT: For each section, you MUST:
1. Add new, relevant details that enhance the original content
2. Include specific examples and achievements
3. Add quantifiable results where possible
4. Use industry-specific terminology
5. Maintain a professional tone
6. Keep the original information while expanding it

The enhanced resume should be significantly more detailed and professional than the input, while maintaining accuracy and relevance.

Format the response in the following structure:
# [Full Name]

[Email] | [Phone]

**Career Objective**
[COMPLETELY REWRITTEN objective with specific details, goals, and measurable achievements]

**Education**
[Enhanced education entries with detailed information]

**Technical Skills**
[Enhanced skills with proficiency levels and groupings]

**Projects**
[Enhanced project descriptions with detailed information]

**Achievements**
[Enhanced achievements with quantifiable results]

**Extra Curricular**
[Enhanced extra curricular activities with leadership roles and impact]`;

  try {
    const formattedResume = await generateContent(prompt);
    return { formattedResume };
  } catch (error) {
    console.error('Error formatting resume:', error);
    throw error;
  }
}
