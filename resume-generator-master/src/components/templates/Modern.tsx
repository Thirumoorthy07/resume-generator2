import React from 'react';
import { marked } from 'marked';

// Google Fonts import (for web, add to _app.tsx or index.html in real app)
const fontLink = typeof document !== 'undefined' && !document.getElementById('modern-resume-font') ? (() => {
  const link = document.createElement('link');
  link.id = 'modern-resume-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Roboto:wght@400;500&display=swap';
  document.head.appendChild(link);
  return true;
})() : null;

function renderMarkdownListOrParagraph(md: string) {
  // If the markdown contains a list, render as <ul>...</ul>, else as <p>...</p>
  if (/^\s*[-*] /m.test(md)) {
    const html = marked.parse(md);
    return <div dangerouslySetInnerHTML={{ __html: html as string }} />;
  } else {
    return <p style={{ margin: 0 }}>{md}</p>;
  }
}

function renderSkills(skills: string[] = []) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'disc inside', fontSize: 15 }}>
      {skills.map((s: string, i: number) => {
        // Bold the first phrase (up to first period, colon, dash, or 6 words)
        const match = s.match(/^(.*?)([\.:\-]|\s+\*|\s{2,}|$)/);
        let boldPart = s, rest = '';
        if (match && match[1]) {
          boldPart = match[1].trim();
          rest = s.slice(match[0].length).trim();
        }
        return (
          <li key={i} style={{ marginBottom: 8 }}>
            <b>{boldPart}</b>{rest ? ' ' + rest : ''}
          </li>
        );
      })}
    </ul>
  );
}

function renderAchievements(achievements: string[] = []) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'disc inside', fontSize: 15 }}>
      {achievements.map((a: string, i: number) => {
        // Bold the first phrase (up to first period, colon, dash, or 6 words)
        const match = a.match(/^(.*?)([\.:\-]|\s+\*|\s{2,}|$)/);
        let boldPart = a, rest = '';
        if (match && match[1]) {
          boldPart = match[1].trim();
          rest = a.slice(match[0].length).trim();
        }
        return (
          <li key={i} style={{ marginBottom: 8 }}>
            <b>{boldPart}</b>{rest ? ' ' + rest : ''}
          </li>
        );
      })}
    </ul>
  );
}

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

const ResumeTemplateModern: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <div style={{ fontFamily: 'Roboto, Arial, sans-serif', background: '#fff', color: '#222', padding: '40px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 38, fontWeight: 900, color: '#008080', marginBottom: 8, letterSpacing: 1 }}>{data.fullName}</h1>
        <div style={{ marginBottom: 20, color: '#555', fontWeight: 500, fontSize: 16 }}>
          <span>{data.email}</span> | <span>{data.phoneNumber}</span>
          {data.linkedin && <> | <a href={data.linkedin} style={{ color: '#008080', textDecoration: 'none' }}>LinkedIn</a></>}
          {data.github && <> | <a href={data.github} style={{ color: '#008080', textDecoration: 'none' }}>GitHub</a></>}
          {data.portfolio && <> | <a href={data.portfolio} style={{ color: '#008080', textDecoration: 'none' }}>Portfolio</a></>}
        </div>
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 24, color: '#008080', marginBottom: 4, fontWeight: 700 }}>Objective</h2>
          {renderMarkdownListOrParagraph(data.careerObjective || '')}
        </section>
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 22, color: '#008080', marginBottom: 4, fontWeight: 700, borderBottom: '3px solid #00bcd4', display: 'inline-block', paddingBottom: 2 }}>Education</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 15 }}>
            {data.education.map((edu, i) => (
              <li key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: '#008080', fontSize: 16 }}>{edu.institution}</div>
                <div>{edu.degree} {edu.field ? `(${edu.field})` : ''}, {edu.year}</div>
                {edu.gpa && <div>GPA: {edu.gpa}</div>}
                {edu.coursework && <div>Coursework: {edu.coursework}</div>}
                {edu.honors && <div>Honors: {edu.honors}</div>}
              </li>
            ))}
          </ul>
        </section>
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 22, color: '#008080', marginBottom: 4, fontWeight: 700 }}>Technical Skills</h2>
          {renderTechnicalSkills(data.technicalSkills)}
          {data.otherSkills && data.otherSkills.length > 0 && (
            <>
              <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 22, color: '#008080', marginBottom: 4, fontWeight: 700, marginTop: 16 }}>Other Skills</h2>
              {renderOtherSkills(data.otherSkills)}
            </>
          )}
        </section>
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 22, color: '#008080', marginBottom: 4, fontWeight: 700, borderBottom: '3px solid #00bcd4', display: 'inline-block', paddingBottom: 2 }}>Projects</h2>
          {(data.projects || []).length === 0 && <p style={{ color: '#888' }}>No projects listed.</p>}
          {(data.projects || []).map((p: any, i: number) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#008080', fontSize: 17, marginBottom: 2 }}>{p.title}</div>
              <div style={{ marginBottom: 4 }}>{p.description}</div>
              {p.technologies && <div style={{ color: '#666', fontSize: 14 }}>Technologies: {p.technologies}</div>}
              {p.challenges && <div style={{ color: '#666', fontSize: 14 }}>Challenges: {p.challenges}</div>}
              {p.results && <div style={{ color: '#666', fontSize: 14 }}>Results: {p.results}</div>}
            </div>
          ))}
        </section>
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 22, color: '#008080', marginBottom: 4, fontWeight: 700 }}>Achievements</h2>
          {renderAchievements(data.achievements)}
        </section>
        {/* Extra Curricular Section */}
        {data.extraCurricular && data.extraCurricular.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 22, color: '#008080', marginBottom: 4, fontWeight: 700 }}>Extra Curricular</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: 'disc inside', fontSize: 15 }}>
              {data.extraCurricular.map((ec: string, i: number) => (
                <li key={i} style={{ marginBottom: 8 }}>{ec}</li>
              ))}
            </ul>
          </section>
        )}
        {/* Personal Info at the end */}
        <section style={{ marginTop: 28, borderTop: '1px solid #eee', paddingTop: 20 }}>
          <h2 style={{ fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 20, color: '#008080', marginBottom: 8, fontWeight: 700 }}>Personal Information</h2>
          <div style={{ fontSize: 14, color: '#666' }}>
            <p>Father's Name: {data.fatherName}</p>
            <p>Date of Birth: {new Date(data.dateOfBirth).toLocaleDateString()}</p>
            <p>Gender: {data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}</p>
            <p>Languages: {data.languages.join(', ')}</p>
            {data.address && <p>{data.address}</p>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResumeTemplateModern; 