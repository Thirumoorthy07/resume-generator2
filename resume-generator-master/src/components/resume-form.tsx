"use client";

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { resumeSchema, ResumeData } from '../schemas/resumeSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { formatResume } from '@/ai/flows/format-resume';
import { Loader2, Trash2, PlusCircle, FileDown } from 'lucide-react';
import ResumeFormStepper from './resume-form-stepper';
import { useToast } from "@/hooks/use-toast";
import ResumeTemplateModern from './templates/Modern';
import ResumeTemplateCreative from './templates/Creative';
import ResumeTemplateClassic from './templates/Classic';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import './resume-a4.css'; // Import the new CSS for A4 and page breaks
import { marked } from 'marked';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormData extends ResumeData {
  template: "modern" | "creative" | "classic";
  careerObjective: string;
  achievements: string[];
  extraCurricular: string[];
}

const steps = [
  "Contact",
  "Education",
  "Skills",
  "Projects",
  "Achievements",
  "Extra Curricular",
  "Review",
];

interface ResumeFormProps {
  initialTemplate?: string;
}

interface RenderSelectedTemplateProps {
  template: "modern" | "creative" | "classic";
  data: FormData;
}

function RenderSelectedTemplate({ template, data }: RenderSelectedTemplateProps) {
  if (template === 'modern') return <ResumeTemplateModern data={data} />;
  if (template === 'creative') return <ResumeTemplateCreative data={data} />;
  if (template === 'classic') return <ResumeTemplateClassic data={data} />;
  return null;
}

// Helper: Parse AI Markdown into structured sections
function parseAIMarkdown(md: string) {
  if (!md) return {};

  // Extract name and contact
  const nameMatch = md.match(/^#\s*(.+)$/m);
  const contactMatch = md.match(/^([\w.]+@[\w.]+)\s*\|\s*([\d\-+ ]+)/m);
  
  const result: any = {
    name: nameMatch ? nameMatch[1].trim() : '',
    email: contactMatch ? contactMatch[1] : '',
    phone: contactMatch ? contactMatch[2] : '',
  };

  // Extract sections by heading
  const sectionRegex = /\*\*(.*?)\*\*\n([\s\S]*?)(?=\n\*\*|$)/g;
  let match;

  while ((match = sectionRegex.exec(md)) !== null) {
    const sectionName = match[1].trim().toLowerCase();
    const content = match[2].trim();

    switch (sectionName) {
      case 'career objective':
      case 'objective':
        result.summary = content;
        break;
      case 'technical skills':
        result.technicalSkills = content
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean)
          .map((line: string) => line.replace(/^[•\-*]\s*/, ''));
        break;
      case 'other skills':
        result.otherSkills = content
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean)
          .map((line: string) => line.replace(/^[•\-*]\s*/, ''));
        break;
      case 'projects':
        result.projects = content
          .split(/\n(?=[•\-*]|\d+\.)\s*/)
          .filter(Boolean)
          .map((project: string) => {
            const lines = project.split('\n');
            const titleLine = lines[0].replace(/^[•\-*]\s*/, '');
            const [title, ...rest] = titleLine.split(':');
            const description = rest.join(':').trim();
            
            // Extract additional details from the remaining lines
            const details: any = {
              title: title.trim(),
              description: description || '',
              technologies: '',
              challenges: '',
              results: ''
            };
            
            lines.slice(1).forEach(line => {
              const [key, value] = line.split(':').map(s => s.trim());
              if (key && value) {
                if (key.toLowerCase().includes('tech')) details.technologies = value;
                if (key.toLowerCase().includes('challenge')) details.challenges = value;
                if (key.toLowerCase().includes('result')) details.results = value;
              }
            });
            
            return details;
          });
        break;
      case 'achievements':
        result.achievements = content
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean)
          .map((line: string) => line.replace(/^[•\-*]\s*/, ''));
        break;
      case 'extra curricular':
      case 'extracurricular':
        result.extraCurricular = content
          .split('\n')
          .map((line: string) => line.trim())
          .filter(Boolean)
          .map((line: string) => line.replace(/^[•\-*]\s*/, ''));
        break;
    }
  }

  return result;
}

interface FieldArrayField {
  id: string;
  value: string;
}

export default function ResumeForm({ initialTemplate = 'modern' }: ResumeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedResume, setFormattedResume] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplate);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      fatherName: "",
      dateOfBirth: "",
      gender: "male",
      languages: [""],
      highestQualification: "",
      achievements: [],
      extraCurricular: [],
      technicalSkills: [{ name: "", level: "" }],
      otherSkills: [""],
      projects: [{ title: "", description: "", technologies: "", challenges: "", results: "" }],
      education: [{ institution: "", degree: "", field: "", year: "", gpa: "", coursework: "", honors: "" }],
      experience: [""],
      portfolio: "",
      linkedin: "",
      github: "",
      template: "modern",
      careerObjective: "",
    },
  });

  const { fields: projectsFields, append: appendProject, remove: removeProject } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const { fields: achievementsFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control: form.control,
    name: "achievements" as any,
  });

  const { fields: extraCurricularFields, append: appendExtraCurricular, remove: removeExtraCurricular } = useFieldArray({
    control: form.control,
    name: "extraCurricular" as any,
  });

  // Trigger validation for the current step's fields
  const triggerValidation = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    switch (currentStep) {
      case 0: fieldsToValidate = ['fullName', 'email', 'phoneNumber', 'fatherName', 'dateOfBirth', 'gender', 'languages']; break;
      case 1: fieldsToValidate = ['highestQualification', 'education', 'experience']; break;
      case 2: fieldsToValidate = ['achievements', 'extraCurricular', 'technicalSkills', 'otherSkills', 'projects']; break;
      case 3: fieldsToValidate = ['portfolio', 'linkedin', 'github']; break;
    }
    return await form.trigger(fieldsToValidate);
  };


  const handleNext = async () => {
    const isValid = await triggerValidation();
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
       toast({
          title: "Validation Error",
          description: "Please fill in all required fields correctly before proceeding.",
          variant: "destructive",
        });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setFormattedResume(null);
    console.log("Submitting data:", data); // Log data being sent
    
    try {
      const result = await formatResume({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        fatherName: data.fatherName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        languages: data.languages.filter(l => l.trim()),
        address: (data as any).address,
        linkedin: data.linkedin,
        github: data.github,
        portfolio: data.portfolio,
        highestQualification: data.highestQualification,
        achievements: data.achievements.filter(a => a.trim()),
        extraCurricular: data.extraCurricular.filter(e => e.trim()),
        technicalSkills: data.technicalSkills.filter(s => s.name.trim()),
        otherSkills: data.otherSkills?.filter(s => s.trim()),
        projects: data.projects.filter(p => p.title.trim() || p.description.trim()),
        education: data.education.filter(e => e.institution.trim() || e.degree.trim()),
        experience: data.experience.filter(e => e.trim()),
        template: selectedTemplate as "modern" | "creative" | "classic",
        careerObjective: data.careerObjective
      });
      
      console.log("AI Response:", result);
      setFormattedResume(result.formattedResume);
      
      // Parse the AI response
      const aiSections = parseAIMarkdown(result.formattedResume);
      console.log("Parsed AI Sections:", aiSections);
      
      // Update form data with enhanced content
      if (aiSections.summary) {
        form.setValue('careerObjective', aiSections.summary);
      }
      if (aiSections.technicalSkills?.length) {
        const enhancedSkills = aiSections.technicalSkills.map(skill => {
          const [name, level] = skill.split(/\s*\(([^)]+)\)/).filter(Boolean);
          return { name: name.trim(), level: level?.trim() || '' };
        });
        form.setValue('technicalSkills', enhancedSkills);
      }
      if (aiSections.otherSkills?.length) {
        form.setValue('otherSkills', aiSections.otherSkills);
      }
      if (aiSections.projects?.length) {
        const enhancedProjects = aiSections.projects.map(project => ({
          title: project.title,
          description: project.description,
          technologies: project.technologies || '',
          challenges: project.challenges || '',
          results: project.results || ''
        }));
        form.setValue('projects', enhancedProjects);
      }
      if (aiSections.achievements?.length) {
        form.setValue('achievements', aiSections.achievements);
      }
      if (aiSections.extraCurricular?.length) {
        form.setValue('extraCurricular', aiSections.extraCurricular);
      }
      
      setCurrentStep(steps.length - 1);
      toast({
        title: "Resume Enhanced",
        description: "Your resume has been enhanced with AI suggestions.",
      });
    } catch (error) {
      console.error("Error formatting resume:", error);
      toast({
        title: "Error",
        description: "Failed to enhance resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

   // Function to handle downloading the resume
  const handleDownload = () => {
    if (!formattedResume) return;

    const blob = new Blob([formattedResume], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    // Sanitize filename - replace spaces and special chars
    const filename = (form.getValues('fullName') || 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${filename}_resume.txt`; // Suggest .txt for simplicity, PDF requires a library
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
     toast({
        title: "Download Started",
        description: "Your resume download should begin shortly.",
      });
  };

  // PDF Export
  const handleExportPDF = async () => {
    const element = document.getElementById('resume-template-preview');
    if (!element) return;
    const canvasList = [];
    const pageHeightPx = 1123; // A4 height in px at 96dpi
    const totalHeight = element.scrollHeight;
    let y = 0;
    while (y < totalHeight) {
      const canvas = await html2canvas(element, {
        scale: 2,
        y: y,
        height: Math.min(pageHeightPx, totalHeight - y),
        windowHeight: Math.min(pageHeightPx, totalHeight - y),
      });
      canvasList.push(canvas);
      y += pageHeightPx;
    }
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    canvasList.forEach((canvas, i) => {
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    });
    pdf.save(`${form.getValues('fullName') || 'resume'}_resume.pdf`);
  };

  // Word Export (Advanced, using docx)
  const handleExportWord = async () => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
    const aiSections = formattedResume ? parseAIMarkdown(formattedResume) : {};
    const data = {
      fullName: aiSections.name || form.getValues('fullName'),
      email: aiSections.email || form.getValues('email'),
      phoneNumber: aiSections.phone || form.getValues('phoneNumber'),
      fatherName: form.getValues('fatherName'),
      dateOfBirth: form.getValues('dateOfBirth'),
      gender: form.getValues('gender'),
      languages: form.getValues('languages'),
      education: aiSections.education || form.getValues('education'),
      technicalSkills: aiSections.skills ? aiSections.skills.map((s: string) => ({ name: s, level: '' })) : form.getValues('technicalSkills'),
      projects: aiSections.projects && aiSections.projects.length > 0 ? aiSections.projects : form.getValues('projects'),
      achievements: aiSections.achievements || form.getValues('achievements'),
      extraCurricular: form.getValues('extraCurricular'),
      otherSkills: aiSections.otherSkills || form.getValues('otherSkills'),
      linkedin: form.getValues('linkedin'),
      github: form.getValues('github'),
      portfolio: form.getValues('portfolio'),
      careerObjective: aiSections.summary || form.getValues('careerObjective'),
    };

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: data.fullName, bold: true, size: 48, color: '008080' }),
              ],
              heading: HeadingLevel.TITLE,
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${data.email} | ${data.phoneNumber}`, size: 24, color: '555555' }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: 'Summary',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            new Paragraph({
              text: data.careerObjective || '',
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: 'Education',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            ...((Array.isArray(data.education) ? data.education : []).map((edu) =>
              new Paragraph({
                text: `${edu.institution} - ${edu.degree}${edu.field ? ` (${edu.field})` : ''}, ${edu.year}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}${edu.coursework ? ` | Coursework: ${edu.coursework}` : ''}${edu.honors ? ` | Honors: ${edu.honors}` : ''}`,
                spacing: { after: 100 },
              })
            )),
            new Paragraph({
              text: 'Technical Skills',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            ...((Array.isArray(data.technicalSkills) ? data.technicalSkills : []).map((skill) =>
              new Paragraph({
                text: `${skill.name}${skill.level ? ` (${skill.level})` : ''}`,
                spacing: { after: 50 },
              })
            )),
            new Paragraph({
              text: 'Other Skills',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            ...((Array.isArray(data.otherSkills) ? data.otherSkills : []).map((skill) =>
              new Paragraph({
                text: skill,
                spacing: { after: 50 },
              })
            )),
            new Paragraph({
              text: 'Projects',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            ...((Array.isArray(data.projects) ? data.projects : []).map((proj) =>
              new Paragraph({
                text: `${proj.title}: ${proj.description}${proj.technologies ? ` | Tech: ${proj.technologies}` : ''}${proj.challenges ? ` | Challenges: ${proj.challenges}` : ''}${proj.results ? ` | Results: ${proj.results}` : ''}`,
                spacing: { after: 100 },
              })
            )),
            new Paragraph({
              text: 'Achievements',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            ...((Array.isArray(data.achievements) ? data.achievements : []).map((ach) =>
              new Paragraph({
                text: ach,
                spacing: { after: 50 },
              })
            )),
            new Paragraph({
              text: 'Extra Curricular',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            ...((Array.isArray(data.extraCurricular) ? data.extraCurricular : []).map((ec) =>
              new Paragraph({
                text: ec,
                spacing: { after: 50 },
              })
            )),
            new Paragraph({
              text: 'Personal Information',
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
            }),
            new Paragraph({ text: `Father's Name: ${data.fatherName}` }),
            new Paragraph({ text: `Date of Birth: ${data.dateOfBirth}` }),
            new Paragraph({ text: `Gender: ${data.gender}` }),
            new Paragraph({ text: `Languages: ${(data.languages || []).join(', ')}` }),
            ...(data.linkedin ? [new Paragraph({ text: `LinkedIn: ${data.linkedin}` })] : []),
            ...(data.github ? [new Paragraph({ text: `GitHub: ${data.github}` })] : []),
            ...(data.portfolio ? [new Paragraph({ text: `Portfolio: ${data.portfolio}` })] : []),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${form.getValues('fullName') || 'resume'}_resume.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
     <Card className="w-full max-w-3xl mx-auto my-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Resume Architect</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Build your professional resume step-by-step.
        </CardDescription>
         <ResumeFormStepper currentStep={currentStep} steps={steps} />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 0: Contact Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-accent mb-4">Contact Information</h3>
                 <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your father's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="careerObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Career Objective</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your career objective" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Languages</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value.map((_, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder={`Language ${index + 1}`}
                                value={field.value[index] || ""}
                                onChange={(e) => {
                                  const newLanguages = [...field.value];
                                  newLanguages[index] = e.target.value;
                                  field.onChange(newLanguages);
                                }}
                              />
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newLanguages = field.value.filter((_, i) => i !== index);
                                    field.onChange(newLanguages);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange([...field.value, ""])}
                          >
                            Add Language
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., https://linkedin.com/in/username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Profile (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., https://github.com/username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., https://your-portfolio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

             {/* Step 1: Education */}
            {currentStep === 1 && (
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-accent mb-4">Education</h3>
                 <FormField
                  control={form.control}
                  name="highestQualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Highest Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="Degree, Stream, University, Year (e.g., B.Tech CSE, XYZ University, 2022)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {field.value.map((edu, index) => (
                            <div key={index} className="flex flex-col gap-2 border p-2 rounded-md">
                              <Input
                                placeholder="Institution Name"
                                value={edu.institution}
                                onChange={e => {
                                  const newEdu = [...field.value];
                                  newEdu[index] = { ...newEdu[index], institution: e.target.value };
                                  field.onChange(newEdu);
                                }}
                              />
                              <Input
                                placeholder="Degree"
                                value={edu.degree}
                                onChange={e => {
                                  const newEdu = [...field.value];
                                  newEdu[index] = { ...newEdu[index], degree: e.target.value };
                                  field.onChange(newEdu);
                                }}
                              />
                              <Input
                                placeholder="Field of Study (optional)"
                                value={edu.field || ""}
                                onChange={e => {
                                  const newEdu = [...field.value];
                                  newEdu[index] = { ...newEdu[index], field: e.target.value };
                                  field.onChange(newEdu);
                                }}
                              />
                              <Input
                                placeholder="Year"
                                value={edu.year}
                                onChange={e => {
                                  const newEdu = [...field.value];
                                  newEdu[index] = { ...newEdu[index], year: e.target.value };
                                  field.onChange(newEdu);
                                }}
                              />
                              <Input
                                placeholder="GPA (optional)"
                                value={edu.gpa || ""}
                                onChange={e => {
                                  const newEdu = [...field.value];
                                  newEdu[index] = { ...newEdu[index], gpa: e.target.value };
                                  field.onChange(newEdu);
                                }}
                              />
                              <Input
                                placeholder="Relevant Coursework (optional)"
                                value={edu.coursework || ""}
                                onChange={e => {
                                  const newEdu = [...field.value];
                                  newEdu[index] = { ...newEdu[index], coursework: e.target.value };
                                  field.onChange(newEdu);
                                }}
                              />
                              <Input
                                placeholder="Honors/Awards (optional)"
                                value={edu.honors || ""}
                                onChange={e => {
                                  const newEdu = [...field.value];
                                  newEdu[index] = { ...newEdu[index], honors: e.target.value };
                                  field.onChange(newEdu);
                                }}
                              />
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newEdu = field.value.filter((_, i) => i !== index);
                                    field.onChange(newEdu);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange([...field.value, { institution: "", degree: "", field: "", year: "", gpa: "", coursework: "", honors: "" }])}
                          >
                            Add Education
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 2: Skills */}
            {currentStep === 2 && (
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-accent mb-4">Skills</h3>
                     <FormField
                      control={form.control}
                  name="technicalSkills"
                      render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Skills</FormLabel>
                          <FormControl>
                        <div className="space-y-2">
                          {field.value.map((skill, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Skill Name (e.g., Python, React)"
                                value={skill.name}
                                onChange={e => {
                                  const newSkills = [...field.value];
                                  newSkills[index] = { ...newSkills[index], name: e.target.value };
                                  field.onChange(newSkills);
                                }}
                              />
                              <Input
                                placeholder="Level (e.g., Advanced)"
                                value={skill.level || ""}
                                onChange={e => {
                                  const newSkills = [...field.value];
                                  newSkills[index] = { ...newSkills[index], level: e.target.value };
                                  field.onChange(newSkills);
                                }}
                              />
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newSkills = field.value.filter((_, i) => i !== index);
                                    field.onChange(newSkills);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange([...field.value, { name: "", level: "" }])}
                          >
                            Add Technical Skill
                          </Button>
                        </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                     <FormField
                      control={form.control}
                      name="otherSkills"
                       render={({ field }) => (
                        <FormItem>
                          <FormLabel>Other Skills</FormLabel>
                           <FormControl>
                            <div className="space-y-2">
                              {field.value && field.value.map((skill: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                  <Input
                                    placeholder="Other Skill (e.g., Communication)"
                                    value={skill}
                                    onChange={e => {
                                      const newSkills = [...(field.value || [])];
                                      newSkills[index] = e.target.value;
                                      field.onChange(newSkills);
                                    }}
                                  />
                                  {index > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const newSkills = (field.value || []).filter((_, i) => i !== index);
                                        field.onChange(newSkills);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => field.onChange([...(field.value || []), ""])}
                              >
                                Add Other Skill
                              </Button>
                            </div>
                           </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
              </div>
            )}

             {/* Step 3: Projects */}
             {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-accent mb-4">Projects</h3>
                         <FormField
                           control={form.control}
                  name="projects"
                           render={({ field }) => (
                            <FormItem>
                      <FormLabel>Projects</FormLabel>
                              <FormControl>
                        <div className="space-y-2">
                          {field.value.map((project, index) => (
                            <div key={index} className="flex flex-col gap-2 border p-2 rounded-md">
                              <Input
                                placeholder="Project Title"
                                value={project.title}
                                onChange={e => {
                                  const newProjects = [...field.value];
                                  newProjects[index] = { ...newProjects[index], title: e.target.value };
                                  field.onChange(newProjects);
                                }}
                              />
                              <Textarea
                                placeholder="Description"
                                value={project.description}
                                onChange={e => {
                                  const newProjects = [...field.value];
                                  newProjects[index] = { ...newProjects[index], description: e.target.value };
                                  field.onChange(newProjects);
                                }}
                              />
                              <Input
                                placeholder="Technologies Used"
                                value={project.technologies || ""}
                                onChange={e => {
                                  const newProjects = [...field.value];
                                  newProjects[index] = { ...newProjects[index], technologies: e.target.value };
                                  field.onChange(newProjects);
                                }}
                              />
                              <Input
                                placeholder="Challenges Faced"
                                value={project.challenges || ""}
                                onChange={e => {
                                  const newProjects = [...field.value];
                                  newProjects[index] = { ...newProjects[index], challenges: e.target.value };
                                  field.onChange(newProjects);
                                }}
                              />
                              <Input
                                placeholder="Results/Achievements"
                                value={project.results || ""}
                                onChange={e => {
                                  const newProjects = [...field.value];
                                  newProjects[index] = { ...newProjects[index], results: e.target.value };
                                  field.onChange(newProjects);
                                }}
                              />
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newProjects = field.value.filter((_, i) => i !== index);
                                    field.onChange(newProjects);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange([...field.value, { title: "", description: "", technologies: "", challenges: "", results: "" }])}
                          >
                            Add Project
                          </Button>
                        </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
              </div>
            )}

            {/* Step 4: Achievements */}
            {currentStep === 4 && (
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-accent mb-4">Achievements (3 to 5)</h3>
                 {achievementsFields.map((field, index) => (
                   <div key={field.id} className="flex gap-2">
                     <Controller
                       name={`achievements.${index}`}
                       control={form.control}
                       defaultValue=""
                       render={({ field: controllerField }) => (
                     <Input
                       placeholder={`Achievement ${index + 1}`}
                           {...controllerField}
                         />
                       )}
                     />
                     {index > 0 && (
                       <Button
                         type="button"
                         variant="ghost"
                         size="icon"
                         onClick={() => removeAchievement(index)}
                       >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       )}
                    </div>
                 ))}
                 {achievementsFields.length < 5 && (
                    <Button type="button" variant="outline" size="sm" onClick={() => appendAchievement("")} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Achievement
                    </Button>
                 )}
                 <FormMessage>{form.formState.errors.achievements?.message || form.formState.errors.achievements?.root?.message}</FormMessage>
              </div>
            )}

            {/* Step 5: Extra Curricular */}
             {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-accent mb-4">Extra Curricular Activities (up to 5)</h3>
                {extraCurricularFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Controller
                      name={`extraCurricular.${index}`}
                      control={form.control}
                      defaultValue=""
                      render={({ field: controllerField }) => (
                    <Input
                      placeholder={`Activity ${index + 1}`}
                          {...controllerField}
                        />
                      )}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExtraCurricular(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {extraCurricularFields.length < 5 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => appendExtraCurricular("")} className="mt-2">
                    Add Activity
                  </Button>
                )}
                <FormMessage>{form.formState.errors.extraCurricular?.message || form.formState.errors.extraCurricular?.root?.message}</FormMessage>
              </div>
            )}

             {/* Step 6: Review & Generate */}
             {currentStep === 6 && (
               <div className="space-y-4">
                <h3 className="text-lg font-semibold text-accent mb-4">Review & Generate</h3>
                 {isSubmitting && (
                    <div className="flex flex-col items-center justify-center p-8 border rounded-md bg-secondary/50">
                        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
                        <p className="text-muted-foreground">Generating your resume...</p>
                    </div>
                 )}
                 {formattedResume && !isSubmitting && (
                   <Card className="bg-secondary/30">
                      <CardHeader>
                        <CardTitle className="text-xl text-primary">Generated Resume</CardTitle>
                      </CardHeader>
                     <CardContent>
                       {/* Parse AI-enhanced Markdown and map to template */}
                       {(() => {
                         const aiSections = parseAIMarkdown(formattedResume);
                         const formData = form.getValues();
                         return (
                           <div id="resume-template-preview" className="a4-resume-preview">
                             {selectedTemplate === 'modern' && (
                             <ResumeTemplateModern
                               data={{
                                   fullName: formData.fullName,
                                   email: formData.email,
                                   phoneNumber: formData.phoneNumber,
                                   fatherName: formData.fatherName,
                                   dateOfBirth: formData.dateOfBirth,
                                   gender: formData.gender,
                                   languages: formData.languages,
                                   education: formData.education,
                                   technicalSkills: formData.technicalSkills,
                                   projects: formData.projects,
                                   achievements: formData.achievements || [],
                                   extraCurricular: formData.extraCurricular || [],
                                   otherSkills: formData.otherSkills || [],
                                   linkedin: formData.linkedin,
                                   github: formData.github,
                                   portfolio: formData.portfolio,
                                   careerObjective: aiSections.summary || formData.careerObjective
                                 }}
                               />
                             )}
                             {selectedTemplate === 'creative' && (
                               <ResumeTemplateCreative
                                 data={{
                                   fullName: formData.fullName,
                                   email: formData.email,
                                   phoneNumber: formData.phoneNumber,
                                   fatherName: formData.fatherName,
                                   dateOfBirth: formData.dateOfBirth,
                                   gender: formData.gender,
                                   languages: formData.languages,
                                   education: formData.education,
                                   technicalSkills: formData.technicalSkills,
                                   projects: formData.projects,
                                   achievements: formData.achievements || [],
                                   extraCurricular: formData.extraCurricular || [],
                                   otherSkills: formData.otherSkills || [],
                                   linkedin: formData.linkedin,
                                   github: formData.github,
                                   portfolio: formData.portfolio,
                                   careerObjective: aiSections.summary || formData.careerObjective
                                 }}
                               />
                             )}
                             {selectedTemplate === 'classic' && (
                               <ResumeTemplateClassic
                                 data={{
                                   fullName: formData.fullName,
                                   email: formData.email,
                                   phoneNumber: formData.phoneNumber,
                                   fatherName: formData.fatherName,
                                   dateOfBirth: formData.dateOfBirth,
                                   gender: formData.gender,
                                   languages: formData.languages,
                                   education: formData.education,
                                   technicalSkills: formData.technicalSkills,
                                   projects: formData.projects,
                                   achievements: formData.achievements || [],
                                   extraCurricular: formData.extraCurricular || [],
                                   otherSkills: formData.otherSkills || [],
                                   linkedin: formData.linkedin,
                                   github: formData.github,
                                   portfolio: formData.portfolio,
                                   careerObjective: aiSections.summary || formData.careerObjective
                                 }}
                               />
                             )}
                           </div>
                         );
                       })()}
                     </CardContent>
                     <CardFooter className="justify-end gap-2">
                       <Button type="button" onClick={handleDownload}>
                         <FileDown className="mr-2 h-4 w-4" /> Download Resume (.txt)
                       </Button>
                       <Button type="button" onClick={handleExportPDF} variant="secondary">
                         PDF
                       </Button>
                       <div className="flex flex-col items-end">
                         <span style={{ fontSize: '0.85em', color: '#888', marginBottom: 2 }}>For the best visual fidelity, use the PDF export.</span>
                       <Button type="button" onClick={handleExportWord} variant="secondary">
                         Word
                       </Button>
                       </div>
                     </CardFooter>
                   </Card>
                 )}
                 {!formattedResume && !isSubmitting && (
                    <div className="text-center p-4 border rounded-md bg-secondary/50">
                        <p className="text-muted-foreground">Click "Generate Resume" below to create your resume.</p>
                    </div>
                 )}
              </div>
            )}

             {/* Navigation Buttons */}
             <div className="flex justify-between pt-6 border-t mt-8">
                 <Button type="button" variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || isSubmitting}>
                   Previous
                 </Button>

                 {currentStep < steps.length - 2 ? ( // "Next" button for steps before the last input step
                    <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                        Next
                    </Button>
                 ) : currentStep === steps.length - 2 ? ( // "Generate" button on the last input step
                    <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         Generate Resume
                    </Button>
                 ) : ( // "Regenerate" button on the review step
                   <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                       Regenerate Resume
                   </Button>
                 )}
            </div>
           </form>
        </Form>
       </CardContent>
    </Card>
  );
}
