import { z } from 'zod';

const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.string().optional(),
  challenges: z.string().optional(),
  results: z.string().optional(),
});

const technicalSkillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  field: z.string().optional(),
  year: z.string(),
  gpa: z.string().optional(),
  coursework: z.string().optional(),
  honors: z.string().optional(),
});

// Schema matching the input for the formatResume GenAI flow
export const FormatResumeInputSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  fatherName: z.string().min(1, "Father's name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(['male', 'female', 'other'], { message: "Please select a valid gender" }),
  languages: z.array(z.string().min(1, "Language cannot be empty")).min(1, "At least one language is required"),
  address: z.string().optional(),
  linkedin: z.string().url("Invalid LinkedIn URL").optional(),
  github: z.string().url("Invalid GitHub URL").optional(),
  portfolio: z.string().url("Invalid portfolio URL").optional(),
  highestQualification: z.string().min(1, { message: "Highest qualification is required." }),
  achievements: z.array(z.string().min(1, { message: "Achievement cannot be empty." })).min(0).max(5, { message: "Maximum 5 achievements allowed." }),
  extraCurricular: z.array(z.string().min(1, { message: "Extra-curricular activity cannot be empty." })).min(0).max(5, { message: "Maximum 5 extra-curricular activities allowed." }),
  technicalSkills: z.array(technicalSkillSchema).min(1, "At least one technical skill is required"),
  otherSkills: z.array(z.string()).optional(),
  projects: z.array(projectSchema).min(1, { message: "At least one project is required." }).max(5, { message: "Maximum 5 projects allowed." }),
  education: z.array(educationSchema).min(1, "At least one education entry is required"),
  experience: z.array(z.string()).min(1, "At least one experience entry is required"),
  template: z.enum(['modern', 'creative', 'classic'], { message: "Please select a valid template." }),
  careerObjective: z.string().min(1, "Career objective is required"),
});

// This type will be inferred from the schema and exported from types/index.ts
// export type ResumeFormData = z.infer<typeof FormatResumeInputSchema>;

export const resumeSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  fatherName: z.string().min(1, "Father's name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  languages: z.array(z.string()).min(1, "At least one language is required"),
  highestQualification: z.string().min(1, "Highest qualification is required"),
  achievements: z.array(z.string()).min(0).optional(),
  extraCurricular: z.array(z.string()).min(0).optional(),
  technicalSkills: z.array(technicalSkillSchema).min(1, "At least one technical skill is required"),
  otherSkills: z.array(z.string()).optional(),
  projects: z.array(projectSchema).min(1, "At least one project is required"),
  education: z.array(educationSchema).min(1, "At least one education entry is required"),
  experience: z.array(z.string()).min(1, "At least one experience entry is required"),
  portfolio: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  template: z.enum(["modern", "creative", "classic"]),
});

export type ResumeData = z.infer<typeof resumeSchema>;
