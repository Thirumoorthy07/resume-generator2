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

export default function ResumeTemplateCreative({ data }: { data: ResumeData }) {
  function renderTechnicalSkills(skills: ResumeData['technicalSkills'] = []) {
    return (
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 14, margin: 0, padding: 0, listStyle: 'none' }}>
        {skills.map((s, i) => (
          <li key={i} style={{ background: '#a7f3d0', color: '#065f46', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15 }}>{s.name} <span style={{ color: '#7c3aed', fontWeight: 400 }}>{s.level ? `(${s.level})` : ''}</span></li>
        ))}
      </ul>
    );
  }
  function renderOtherSkills(skills: string[] = []) {
    if (!skills.length) return null;
    return (
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
        {skills.map((s, i) => (
          <li key={i} style={{ background: '#f3e8ff', color: '#7c3aed', borderRadius: 8, padding: '6px 14px', fontWeight: 500, fontSize: 14 }}>{s}</li>
        ))}
      </ul>
    );
  }
  return (
    <div style={{ fontFamily: 'Poppins, Arial, sans-serif', background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)', color: '#222', padding: 36, maxWidth: 850, margin: '0 auto', borderRadius: 18, boxShadow: '0 4px 24px #c0e0e0', border: '2px solid #a7f3d0' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: '#7c3aed', margin: 0 }}>{data.fullName}</h1>
          <div style={{ color: '#6366f1', fontWeight: 500 }}>{data.email} | {data.phoneNumber}</div>
        </div>
      </div>
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, color: '#7c3aed', marginBottom: 6, letterSpacing: 1 }}>Objective</h2>
        <p style={{ fontStyle: 'italic', color: '#374151' }}>{data.careerObjective}</p>
      </section>
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, color: '#7c3aed', marginBottom: 6, letterSpacing: 1 }}>Education</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
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
      <h2 style={{ fontSize: 24, color: '#7c3aed', marginBottom: 6, letterSpacing: 1 }}>Technical Skills</h2>
      {renderTechnicalSkills(data.technicalSkills)}
      {data.otherSkills && data.otherSkills.length > 0 && (
        <>
          <h2 style={{ fontSize: 24, color: '#7c3aed', marginBottom: 6, letterSpacing: 1, marginTop: 16 }}>Other Skills</h2>
          {renderOtherSkills(data.otherSkills)}
        </>
      )}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, color: '#7c3aed', marginBottom: 6, letterSpacing: 1 }}>Projects</h2>
        {data.projects.map((p, i) => (
          <div key={i} style={{ marginBottom: 14, background: '#ede9fe', borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 700, color: '#7c3aed' }}>{p.title}</div>
            <div style={{ color: '#374151' }}>{p.description}</div>
            {p.technologies && <div style={{ color: '#6366f1', fontSize: 14 }}>Tech: {p.technologies}</div>}
            {p.challenges && <div style={{ color: '#6366f1', fontSize: 14 }}>Challenges: {p.challenges}</div>}
            {p.results && <div style={{ color: '#6366f1', fontSize: 14 }}>Results: {p.results}</div>}
          </div>
        ))}
      </section>
      <section>
        <h2 style={{ fontSize: 24, color: '#7c3aed', marginBottom: 6, letterSpacing: 1 }}>Achievements</h2>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {data.achievements.map((a, i) => (
            <li key={i} style={{ marginBottom: 6, color: '#065f46' }}>- {a}</li>
          ))}
        </ul>
      </section>
    </div>
  );
} 