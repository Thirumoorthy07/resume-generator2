import React from 'react';

interface ResumeData {
  fullName: string;
  email: string;
  phoneNumber: string;
  fatherName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  languages: string[];
  address?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  careerObjective: string;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    year: string;
    gpa?: string;
    coursework?: string;
    honors?: string;
  }>;
  technicalSkills: Array<{ name: string; level?: string }>;
  otherSkills?: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies?: string;
    challenges?: string;
    results?: string;
  }>;
  achievements: string[];
  extraCurricular: string[];
}

export default function ResumeTemplateClassic({ data }: { data: ResumeData }) {
  function renderTechnicalSkills(skills: ResumeData['technicalSkills'] = []) {
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'disc inside', fontSize: 15 }}>
        {skills.map((s, i) => (
          <li key={i}><b>{s.name}</b>{s.level ? ` (${s.level})` : ''}</li>
        ))}
      </ul>
    );
  }
  function renderOtherSkills(skills: string[] = []) {
    if (!skills.length) return null;
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'circle inside', fontSize: 15 }}>
        {skills.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    );
  }
  return (
    <div style={{ fontFamily: 'Georgia, Times New Roman, serif', background: '#fff', color: '#222', padding: 32, maxWidth: 800, margin: '0 auto', border: '1px solid #bbb', borderRadius: 4 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#333', marginBottom: 6, letterSpacing: 1 }}>{data.fullName}</h1>
      <div style={{ marginBottom: 18, color: '#444', fontSize: 16 }}>
        <span>{data.email}</span> | <span>{data.phoneNumber}</span>
      </div>
      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, color: '#444', borderBottom: '1px solid #bbb', paddingBottom: 2, marginBottom: 6 }}>Objective</h2>
        <p style={{ fontSize: 15 }}>{data.careerObjective}</p>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, color: '#444', borderBottom: '1px solid #bbb', paddingBottom: 2, marginBottom: 6 }}>Education</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 15 }}>
          {data.education.map((edu, i) => (
            <li key={i}>
              <b>{edu.institution}</b> - {edu.degree} {edu.field ? `(${edu.field})` : ''}, {edu.year}
              {edu.gpa && <> | GPA: {edu.gpa}</>}
              {edu.coursework && <> | Coursework: {edu.coursework}</>}
              {edu.honors && <> | Honors: {edu.honors}</>}
            </li>
          ))}
        </ul>
      </section>
      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, color: '#444', borderBottom: '1px solid #bbb', paddingBottom: 2, marginBottom: 6 }}>Technical Skills</h2>
        {renderTechnicalSkills(data.technicalSkills)}
        {data.otherSkills && data.otherSkills.length > 0 && (
          <>
            <h2 style={{ fontSize: 20, color: '#444', borderBottom: '1px solid #bbb', paddingBottom: 2, marginBottom: 6, marginTop: 16 }}>Other Skills</h2>
            {renderOtherSkills(data.otherSkills)}
          </>
        )}
      </section>
      <section style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, color: '#444', borderBottom: '1px solid #bbb', paddingBottom: 2, marginBottom: 6 }}>Projects</h2>
        {data.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: '#333' }}>{p.title}</div>
            <div style={{ color: '#444' }}>{p.description}</div>
            {p.technologies && <div style={{ color: '#888', fontSize: 14 }}>Tech: {p.technologies}</div>}
            {p.challenges && <div style={{ color: '#888', fontSize: 14 }}>Challenges: {p.challenges}</div>}
            {p.results && <div style={{ color: '#888', fontSize: 14 }}>Results: {p.results}</div>}
          </div>
        ))}
      </section>
      <section>
        <h2 style={{ fontSize: 20, color: '#444', borderBottom: '1px solid #bbb', paddingBottom: 2, marginBottom: 6 }}>Achievements</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 15 }}>
          {data.achievements.map((a, i) => (
            <li key={i} style={{ marginBottom: 6, color: '#065f46' }}>- {a}</li>
          ))}
        </ul>
      </section>
    </div>
  );
} 