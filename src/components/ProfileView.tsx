'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, FileText, Download, Award, Clock, Shield, Plus, Trash2, Edit2, Save, X, Briefcase, GraduationCap, Github, Linkedin, Upload } from 'lucide-react';

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

  const [education, setEducation] = useState<Education[]>([
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

  return (
    <div className="animate-fade-in pt-4 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 pb-8 border-b border-stone-200">
        <div>
           <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-3">CRM / Student Record</div>
           <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">My Profile</h1>
           <p className="text-stone-500 max-w-xl">
             Comprehensive ATS view of your candidate profile. Keep this updated for potential employers.
           </p>
        </div>
        <button 
           onClick={() => setIsEditing(!isEditing)}
           className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg ${isEditing ? 'bg-forest text-white hover:bg-forest/90' : 'bg-charcoal text-white hover:bg-rust'}`}
        >
           {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar - Personal Info */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-stone-100 to-white z-0"></div>
               
               <div className="relative z-10 text-center">
                   <div className="w-32 h-32 mx-auto bg-charcoal text-white rounded-full flex items-center justify-center text-4xl font-serif font-bold mb-6 border-4 border-white shadow-xl relative group">
                       P
                       {isEditing && (
                         <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload size={24} className="text-white" />
                         </button>
                       )}
                   </div>
                   
                   {isEditing ? (
                      <div className="space-y-3 mb-6">
                         <input 
                           type="text" 
                           value={personalInfo.name} 
                           onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                           className="w-full text-center font-bold text-xl border-b border-stone-300 focus:border-rust focus:outline-none bg-transparent"
                         />
                         <input 
                           type="text" 
                           value={personalInfo.title} 
                           onChange={(e) => setPersonalInfo({...personalInfo, title: e.target.value})}
                           className="w-full text-center text-stone-500 text-sm border-b border-stone-300 focus:border-rust focus:outline-none bg-transparent"
                         />
                      </div>
                   ) : (
                      <>
                        <h2 className="text-2xl font-bold text-charcoal">{personalInfo.name}</h2>
                        <p className="text-stone-500 mb-6">{personalInfo.title}</p>
                      </>
                   )}

                   <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100 mb-8">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                       Active Student
                   </div>

                   <div className="space-y-4 text-left">
                       <InfoField icon={Mail} label="Email" value={personalInfo.email} isEditing={isEditing} onChange={(v) => setPersonalInfo({...personalInfo, email: v})} />
                       <InfoField icon={Phone} label="Phone" value={personalInfo.phone} isEditing={isEditing} onChange={(v) => setPersonalInfo({...personalInfo, phone: v})} />
                       <InfoField icon={MapPin} label="Location" value={personalInfo.location} isEditing={isEditing} onChange={(v) => setPersonalInfo({...personalInfo, location: v})} />
                       <InfoField icon={Github} label="GitHub" value={personalInfo.github} isEditing={isEditing} onChange={(v) => setPersonalInfo({...personalInfo, github: v})} />
                       <InfoField icon={Linkedin} label="LinkedIn" value={personalInfo.linkedin} isEditing={isEditing} onChange={(v) => setPersonalInfo({...personalInfo, linkedin: v})} />
                   </div>
               </div>
           </div>

           <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl">
               <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Bio / Summary</h3>
               {isEditing ? (
                   <textarea 
                     value={personalInfo.bio}
                     onChange={(e) => setPersonalInfo({...personalInfo, bio: e.target.value})}
                     className="w-full h-32 bg-stone-800 border border-stone-700 rounded-xl p-3 text-sm text-stone-200 focus:outline-none focus:border-rust resize-none"
                   />
               ) : (
                   <p className="text-stone-300 text-sm leading-relaxed font-serif">"{personalInfo.bio}"</p>
               )}
           </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Skills Matrix */}
            <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-stone-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif font-bold text-charcoal flex items-center gap-2">
                        <Award size={20} className="text-rust" />
                        Skills Matrix
                    </h3>
                    {isEditing && (
                        <button onClick={handleAddSkill} className="text-xs font-bold text-rust hover:underline flex items-center gap-1">
                            <Plus size={12} /> Add Skill
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map((skill, idx) => (
                        <div key={idx} className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center group">
                            {isEditing ? (
                                <div className="flex-1 flex gap-2">
                                    <input 
                                      value={skill.name}
                                      onChange={(e) => handleSkillChange(idx, 'name', e.target.value)}
                                      className="flex-1 bg-white border border-stone-200 rounded px-2 py-1 text-sm font-bold"
                                    />
                                    <select 
                                      value={skill.level}
                                      onChange={(e) => handleSkillChange(idx, 'level', e.target.value as any)}
                                      className="bg-white border border-stone-200 rounded px-2 py-1 text-xs"
                                    >
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                        <option>Expert</option>
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-bold text-charcoal text-sm">{skill.name}</p>
                                    <p className="text-xs text-stone-500">{skill.level}</p>
                                </div>
                            )}

                            {isEditing ? (
                                <button onClick={() => handleRemoveSkill(idx)} className="p-2 text-stone-400 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            ) : (
                                <div className={`w-2 h-2 rounded-full ${
                                    skill.level === 'Expert' ? 'bg-rust' : 
                                    skill.level === 'Advanced' ? 'bg-forest' : 
                                    skill.level === 'Intermediate' ? 'bg-yellow-500' : 'bg-stone-300'
                                }`}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience */}
            <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-stone-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-serif font-bold text-charcoal flex items-center gap-2">
                        <Briefcase size={20} className="text-rust" />
                        Experience
                    </h3>
                    {isEditing && (
                        <button onClick={handleAddExperience} className="text-xs font-bold text-rust hover:underline flex items-center gap-1">
                            <Plus size={12} /> Add Role
                        </button>
                    )}
                </div>
                
                <div className="space-y-6">
                    {experience.map((exp) => (
                        <div key={exp.id} className="relative pl-6 border-l-2 border-stone-100">
                            {isEditing && (
                                <button onClick={() => handleRemoveExperience(exp.id)} className="absolute right-0 top-0 text-stone-300 hover:text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-rust"></div>
                            
                            {isEditing ? (
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input value={exp.role} onChange={(e) => handleExperienceChange(exp.id, 'role', e.target.value)} className="flex-1 font-bold text-charcoal border-b border-stone-200 focus:outline-none" />
                                        <input value={exp.company} onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)} className="flex-1 text-rust border-b border-stone-200 focus:outline-none" />
                                    </div>
                                    <input value={exp.duration} onChange={(e) => handleExperienceChange(exp.id, 'duration', e.target.value)} className="w-full text-xs text-stone-400 border-b border-stone-200 focus:outline-none" />
                                    <textarea value={exp.description} onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)} className="w-full text-sm border border-stone-200 rounded p-2 focus:outline-none resize-none" />
                                </div>
                            ) : (
                                <>
                                    <h4 className="font-bold text-charcoal text-lg">{exp.role}</h4>
                                    <div className="text-sm font-bold text-rust mb-1">{exp.company}</div>
                                    <p className="text-xs text-stone-400 mb-2 font-mono">{exp.duration}</p>
                                    <p className="text-stone-600 text-sm leading-relaxed">{exp.description}</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Education */}
                <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-stone-100">
                    <h3 className="text-lg font-serif font-bold text-charcoal mb-6 flex items-center gap-2">
                        <GraduationCap size={20} className="text-rust" />
                        Education
                    </h3>
                    <div className="space-y-4">
                        {education.map((edu, i) => (
                            <div key={i}>
                                <div className="font-bold text-charcoal">{edu.degree}</div>
                                <div className="text-stone-500 text-sm">{edu.school}</div>
                                <div className="text-xs text-stone-400">{edu.year}</div>
                            </div>
                        ))}
                        {isEditing && <button className="text-xs text-stone-400 hover:text-rust">+ Add Education</button>}
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-stone-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-serif font-bold text-charcoal flex items-center gap-2">
                            <FileText size={20} className="text-rust" />
                            Documents
                        </h3>
                        {isEditing && <button onClick={handleAddDoc} className="text-rust"><Plus size={16}/></button>}
                    </div>
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 hover:bg-stone-100 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm text-stone-400">
                                        <FileText size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-charcoal text-xs truncate">{doc.name}</p>
                                        <p className="text-[10px] text-stone-400">{doc.date}</p>
                                    </div>
                                </div>
                                {isEditing ? (
                                    <button className="text-stone-300 hover:text-red-500"><Trash2 size={14}/></button>
                                ) : (
                                    <button className="text-stone-300 hover:text-rust"><Download size={14}/></button>
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

const InfoField = ({ icon: Icon, label, value, isEditing, onChange }: { icon: any, label: string, value: string, isEditing: boolean, onChange: (val: string) => void }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
            <Icon size={14} />
        </div>
        <div className="flex-1 overflow-hidden">
            <p className="text-[10px] text-stone-400 uppercase font-bold">{label}</p>
            {isEditing ? (
                <input 
                  value={value} 
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full text-sm font-medium text-charcoal border-b border-stone-200 focus:outline-none focus:border-rust bg-transparent"
                />
            ) : (
                <p className="text-sm font-medium text-charcoal truncate">{value}</p>
            )}
        </div>
    </div>
);