import { createClient } from '@supabase/supabase-js';
import { Module, Lesson, Persona, BlueprintItem } from '../types';
import { MOCK_MODULES, SENIOR_PERSONA, BLUEPRINT_ITEMS } from '../constants';

// --- CONFIGURATION ---
// We prioritize environment variables, but fall back to your specific project keys
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://tfrsssicjqmsegmxidrj.supabase.co";
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcnNzc2ljanFtc2VnbXhpZHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4Njg5MjEsImV4cCI6MjA3OTQ0NDkyMX0.d7ysvCpRnBqyXLf8IkYlC9dYMRLdzPdUInvGBu4jbN8";

// Set to false to attempt real DB connection. 
// The code below handles fallback if connection fails.
const USE_MOCK = true; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- API ---

export const fetchModules = async (): Promise<Module[]> => {
  if (USE_MOCK) return MOCK_MODULES;

  try {
    // 1. Fetch Modules
    const { data: modulesData, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('id');

    if (modulesError) throw modulesError;
    if (!modulesData || modulesData.length === 0) throw new Error("No data in DB");

    // 2. Fetch Lessons
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('*');

    if (lessonsError) throw lessonsError;

    // 3. Fetch User Progress (Mock user ID for now)
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*');

    // 4. Merge Data
    const fullModules: Module[] = modulesData.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      progress: m.progress || 0,
      week: m.week || `Week ${Math.ceil(m.id / 2)}`, // Fallback mapping if not in DB
      lessons: lessonsData
        .filter((l: any) => l.module_id === m.id)
        .map((l: any) => {
           // Find progress for this lesson
           const prog = progressData?.find((p: any) => p.lesson_id === l.id);
           const status = prog?.status || (l.id === 'm1-l1' ? 'current' : 'locked'); // Default first lesson to current
           
           return {
             id: l.id,
             title: l.title,
             description: l.description,
             duration: l.duration,
             type: l.type,
             status: status,
             content: l.content // JSONB content
           };
        })
    }));

    return fullModules;

  } catch (error) {
    console.warn("⚠️ Falling back to MOCK DATA. Supabase connection failed or empty.", error);
    // Graceful fallback so app doesn't crash
    return MOCK_MODULES;
  }
};

export const fetchPersona = async (): Promise<Persona> => {
  if (USE_MOCK) return SENIOR_PERSONA;
  
  try {
     const { data, error } = await supabase
       .from('profiles')
       .select('*')
       .limit(1)
       .single();
     
     if (error || !data) throw error;
     return data.persona_data; // Assuming JSONB column
  } catch (err) {
     return SENIOR_PERSONA;
  }
};

export const fetchBlueprint = async (): Promise<BlueprintItem[]> => {
    if (USE_MOCK) return BLUEPRINT_ITEMS;

    try {
        const { data, error } = await supabase
          .from('artifacts')
          .select('*');
        
        if (error || !data) throw error;
        return data.map((item: any) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            moduleRef: item.module_ref,
            description: item.description,
            deliverables: item.deliverables || []
        }));
    } catch (err) {
        return BLUEPRINT_ITEMS;
    }
};