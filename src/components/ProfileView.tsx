'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, FileText, Download, Award, Plus, Trash2, Edit2, Save, Briefcase, GraduationCap, Github, Linkedin, Upload, TrendingUp } from 'lucide-react';
import { useAcademyStore, useBiometric, useGamification } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './academy/BiometricBackground';

interface Skill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Experience {
  id: number;
  role: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  id: number;
  degree: string;
  school: string;
  year: string;
}

interface Document {
  id: number;
  name: string;
  date: string;
  type: string;
}

export const ProfileView: React.FC = () => {
  const { streakDays } = useAcademyStore();
  const { state, theme, statusMessage } = useBiometric();
  const { xp, rank } = useGamification();
  const [isEditing, setIsEditing] = useState(false);

  // -- STATE MOCK DB --
  const [personalInfo, setPersonalInfo] = useState({
    name: "Priya Sharma",
    title: "Senior Developer Track",
    email: "priya.sharma@example.com",
    phone: "+1 (555) 123-4567",
    location: "Chicago, IL",
    bio: "Aspiring Guidewire Developer with a strong background in Java and SQL. Passionate about building scalable enterprise solutions. Currently enrolled in the InTime Academy Senior Developer Track.",
    github: "github.com/priya-dev",
    linkedin: "linkedin.com/in/priya-sharma"
  });

  const [skills, setSkills] = useState<Skill[]>([
    { name: "Guidewire PolicyCenter", level: "Intermediate" },
    { name: "Gosu Programming", level: "Advanced" },
    { name: "Java Core", level: "Expert" },
    { name: "SQL / Database", level: "Intermediate" },
    { name: "REST APIs", level: "Beginner" },
    { name: "Agile / Scrum", level: "Advanced" }
  ]);

  const [experience, setExperience] = useState<Experience[]>([
    { id: 1, role: "Junior Java Developer", company: "FinTech Solutions Inc.", duration: "2020 - 2023", description: "Developed backend microservices using Spring Boot. Optimized database queries reducing load times by 15%." },
    { id: 2, role: "Intern", company: "StartUp Hub", duration: "2019 - 2020", description: "Assisted in frontend development using React and TypeScript." }
  ]);

  const [education] = useState<Education[]>([
    { id: 1, degree: "B.S. Computer Science", school: "University of Illinois", year: "2019" }
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, name: "Resume_Priya_Sharma_v4.pdf", date: "Oct 15, 2024", type: "Resume" },
    { id: 2, name: "Enrollment_Agreement.pdf", date: "Oct 12, 2024", type: "Contract" }
  ]);

  // -- HANDLERS --
  const handleAddSkill = () => {
    setSkills([...skills, { name: "New Skill", level: "Beginner" }]);
  };

  const handleRemoveSkill = (idx: number) => {
    const newSkills = [...skills];
    newSkills.splice(idx, 1);
    setSkills(newSkills);
  };

  const handleSkillChange = (idx: number, field: keyof Skill, value: string) => {
    const newSkills = [...skills];
    newSkills[idx] = { ...newSkills[idx], [field]: value };
    setSkills(newSkills);
  };

  const handleAddExperience = () => {
    setExperience([...experience, { id: Date.now(), role: "Role", company: "Company", duration: "Duration", description: "Description" }]);
  };

  const handleRemoveExperience = (id: number) => {
    setExperience(experience.filter(e => e.id !== id));
  };

  const handleExperienceChange = (id: number, field: keyof Experience, value: string) => {
    setExperience(experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const handleAddDoc = () => {
    const newDoc = { id: Date.now(), name: "New_Document.pdf", date: new Date().toLocaleDateString(), type: "Generic" };
    setDocuments([...documents, newDoc]);
  };

  const levelColors = {
    Expert: 'bg-forest-100 text-forest-700 border-forest-200',
    Advanced: 'bg-gold-100 text-gold-700 border-gold-200',
    Intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
    Beginner: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200'
  };

  return (
    <div className="animate-fade-in pt-4 pb-12">

      {/* ============================================
          HERO HEADER - Mission Control Style
          ============================================ */}
      <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b-2 border-charcoal-100">
        <div>
          {/* Biometric Status */}
          <div className="mb-4">
            <BiometricStatusIndicator state={state} statusMessage={statusMessage} />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-heading font-black text-charcoal-900 mb-4 tracking-tight leading-none">
            My<br />Profile
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;Your comprehensive ATS view. Keep this updated for potential employers.&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Rank - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-4xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {rank.badge}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              {rank.title}
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>{xp.toLocaleString()} XP</span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Skills</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-heading font-black text-gold-600">
                    {skills.length}
                  </span>
                  <span className="text-xs text-charcoal-400 font-body">tracked</span>
                </div>
              </div>
              <div className="pt-2 border-t border-charcoal-100">
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Streak Days</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-charcoal-700">
                    {streakDays}
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-body">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`self-start px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-elevation-sm font-body ${isEditing ? 'bg-forest-600 text-white hover:bg-forest-700' : 'bg-charcoal-900 text-white hover:bg-charcoal-800'}`}
          >
            {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
          </button>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar - Personal Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-elevation-md border-2 border-charcoal-100 relative overflow-hidden">
            <div className="relative z-10 text-center">
              <div className="w-28 h-28 mx-auto bg-charcoal-900 text-white rounded-2xl flex items-center justify-center text-4xl font-heading font-black mb-6 border-4 border-white shadow-elevation-md relative group">
                P
                {isEditing && (
                  <button className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={24} className="text-white" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 mb-6">
                  <input
                    type="text"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="w-full text-center font-heading font-bold text-xl border-b-2 border-charcoal-200 focus:border-charcoal-900 focus:outline-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={personalInfo.title}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                    className="w-full text-center text-charcoal-500 text-sm border-b border-charcoal-200 focus:border-charcoal-900 focus:outline-none bg-transparent font-body"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-heading font-bold text-charcoal-900">{personalInfo.name}</h2>
                  <p className="text-charcoal-500 mb-6 font-body">{personalInfo.title}</p>
                </>
              )}

              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-forest-100 text-forest-700 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-forest-200 mb-8 font-body">
                <span className="w-1.5 h-1.5 bg-forest-500 rounded-full animate-pulse"></span>
                Active Student
              </div>

              <div className="space-y-4 text-left">
                <InfoField icon={Mail} label="Email" value={personalInfo.email} isEditing={isEditing} onChange={(v) => setPersonalInfo({ ...personalInfo, email: v })} />
                <InfoField icon={Phone} label="Phone" value={personalInfo.phone} isEditing={isEditing} onChange={(v) => setPersonalInfo({ ...personalInfo, phone: v })} />
                <InfoField icon={MapPin} label="Location" value={personalInfo.location} isEditing={isEditing} onChange={(v) => setPersonalInfo({ ...personalInfo, location: v })} />
                <InfoField icon={Github} label="GitHub" value={personalInfo.github} isEditing={isEditing} onChange={(v) => setPersonalInfo({ ...personalInfo, github: v })} />
                <InfoField icon={Linkedin} label="LinkedIn" value={personalInfo.linkedin} isEditing={isEditing} onChange={(v) => setPersonalInfo({ ...personalInfo, linkedin: v })} />
              </div>
            </div>
          </div>

          <div
            className="text-white p-8 rounded-2xl shadow-elevation-md border-2"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
              borderColor: theme.gradientFrom,
            }}
          >
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4 font-body">Bio / Summary</h3>
            {isEditing ? (
              <textarea
                value={personalInfo.bio}
                onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-white/40 resize-none font-body placeholder-white/40"
              />
            ) : (
              <p className="text-white/90 text-sm leading-relaxed font-body">&ldquo;{personalInfo.bio}&rdquo;</p>
            )}
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8 space-y-6">

          {/* Skills Matrix */}
          <div className="bg-white p-8 rounded-2xl shadow-elevation-sm border-2 border-charcoal-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-heading font-bold text-charcoal-900 flex items-center gap-2">
                <Award size={20} className="text-gold-600" />
                Skills Matrix
              </h3>
              {isEditing && (
                <button onClick={handleAddSkill} className="text-xs font-bold text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1 font-body">
                  <Plus size={12} /> Add Skill
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skills.map((skill, idx) => (
                <div key={idx} className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-100 flex justify-between items-center group">
                  {isEditing ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        value={skill.name}
                        onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                        className="flex-1 bg-white border border-charcoal-200 rounded-lg px-3 py-1.5 text-sm font-bold font-body"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => handleSkillChange(idx, 'level', e.target.value as Skill['level'])}
                        className="bg-white border border-charcoal-200 rounded-lg px-2 py-1.5 text-xs font-body"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Expert</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <p className="font-bold text-charcoal-900 text-sm font-heading">{skill.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border font-body ${levelColors[skill.level]}`}>
                        {skill.level}
                      </span>
                    </div>
                  )}

                  {isEditing && (
                    <button onClick={() => handleRemoveSkill(idx)} className="p-2 text-charcoal-400 hover:text-red-500 ml-2">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white p-8 rounded-2xl shadow-elevation-sm border-2 border-charcoal-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-heading font-bold text-charcoal-900 flex items-center gap-2">
                <Briefcase size={20} className="text-charcoal-600" />
                Experience
              </h3>
              {isEditing && (
                <button onClick={handleAddExperience} className="text-xs font-bold text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1 font-body">
                  <Plus size={12} /> Add Role
                </button>
              )}
            </div>

            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-charcoal-200">
                  {isEditing && (
                    <button onClick={() => handleRemoveExperience(exp.id)} className="absolute right-0 top-0 text-charcoal-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-charcoal-900"></div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input value={exp.role} onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} className="flex-1 font-bold text-charcoal-900 border-b border-charcoal-200 focus:outline-none font-heading" />
                        <input value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} className="flex-1 text-charcoal-600 border-b border-charcoal-200 focus:outline-none font-body" />
                      </div>
                      <input value={exp.duration} onChange={(e) => handleExperienceChange(exp.id, 'duration', e.target.value)} className="w-full text-xs text-charcoal-400 border-b border-charcoal-200 focus:outline-none font-mono" />
                      <textarea value={exp.description} onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)} className="w-full text-sm border border-charcoal-200 rounded-xl p-2 focus:outline-none resize-none font-body" />
                    </div>
                  ) : (
                    <>
                      <h4 className="font-bold text-charcoal-900 text-lg font-heading">{exp.role}</h4>
                      <div className="text-sm font-bold text-charcoal-600 mb-1 font-body">{exp.company}</div>
                      <p className="text-xs text-charcoal-400 mb-2 font-mono">{exp.duration}</p>
                      <p className="text-charcoal-500 text-sm leading-relaxed font-body">{exp.description}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <div className="bg-white p-8 rounded-2xl shadow-elevation-sm border-2 border-charcoal-100">
              <h3 className="text-lg font-heading font-bold text-charcoal-900 mb-6 flex items-center gap-2">
                <GraduationCap size={20} className="text-charcoal-600" />
                Education
              </h3>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i}>
                    <div className="font-bold text-charcoal-900 font-heading">{edu.degree}</div>
                    <div className="text-charcoal-500 text-sm font-body">{edu.school}</div>
                    <div className="text-xs text-charcoal-400 font-mono">{edu.year}</div>
                  </div>
                ))}
                {isEditing && <button className="text-xs text-charcoal-400 hover:text-charcoal-700 font-body">+ Add Education</button>}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white p-8 rounded-2xl shadow-elevation-sm border-2 border-charcoal-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-heading font-bold text-charcoal-900 flex items-center gap-2">
                  <FileText size={20} className="text-charcoal-600" />
                  Documents
                </h3>
                {isEditing && <button onClick={handleAddDoc} className="text-charcoal-600 hover:text-charcoal-900"><Plus size={16} /></button>}
              </div>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-xl border border-charcoal-100 hover:bg-white hover:shadow-elevation-sm transition-all cursor-pointer group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-charcoal-400 border border-charcoal-100">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-charcoal-900 text-xs truncate font-body">{doc.name}</p>
                        <p className="text-[10px] text-charcoal-400 font-body">{doc.date}</p>
                      </div>
                    </div>
                    {isEditing ? (
                      <button className="text-charcoal-300 hover:text-red-500"><Trash2 size={14} /></button>
                    ) : (
                      <button className="text-charcoal-300 hover:text-charcoal-700"><Download size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const InfoField = ({ icon: Icon, label, value, isEditing, onChange }: { icon: React.ElementType, label: string, value: string, isEditing: boolean, onChange: (val: string) => void }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-xl bg-charcoal-100 flex items-center justify-center text-charcoal-500 shrink-0">
      <Icon size={14} />
    </div>
    <div className="flex-1 overflow-hidden">
      <p className="text-[9px] text-charcoal-400 uppercase font-bold tracking-widest font-body">{label}</p>
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-medium text-charcoal-900 border-b border-charcoal-200 focus:outline-none focus:border-charcoal-900 bg-transparent font-body"
        />
      ) : (
        <p className="text-sm font-medium text-charcoal-900 truncate font-body">{value}</p>
      )}
    </div>
  </div>
);
