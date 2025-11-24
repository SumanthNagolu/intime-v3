export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_agent_interactions: {
        Row: {
          agent_name: string
          cost_usd: number | null
          created_at: string
          error_message: string | null
          id: string
          input: string | null
          interaction_type: string
          latency_ms: number | null
          metadata: Json
          model_used: string | null
          org_id: string
          output: string | null
          success: boolean
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          agent_name: string
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input?: string | null
          interaction_type: string
          latency_ms?: number | null
          metadata?: Json
          model_used?: string | null
          org_id: string
          output?: string | null
          success?: boolean
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          agent_name?: string
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          input?: string | null
          interaction_type?: string
          latency_ms?: number | null
          metadata?: Json
          model_used?: string | null
          org_id?: string
          output?: string | null
          success?: boolean
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_interactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_agent_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          agent_type: string
          created_at: string
          id: string
          messages: Json
          metadata: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: string
          created_at?: string
          id?: string
          messages?: Json
          metadata?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string
          created_at?: string
          id?: string
          messages?: Json
          metadata?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_cost_tracking: {
        Row: {
          cost_usd: number
          created_at: string
          id: string
          input_tokens: number
          latency_ms: number
          metadata: Json
          model: string
          org_id: string
          output_tokens: number
          provider: string
          user_id: string | null
        }
        Insert: {
          cost_usd?: number
          created_at?: string
          id?: string
          input_tokens?: number
          latency_ms?: number
          metadata?: Json
          model: string
          org_id: string
          output_tokens?: number
          provider: string
          user_id?: string | null
        }
        Update: {
          cost_usd?: number
          created_at?: string
          id?: string
          input_tokens?: number
          latency_ms?: number
          metadata?: Json
          model?: string
          org_id?: string
          output_tokens?: number
          provider?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_cost_tracking_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_cost_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_embeddings: {
        Row: {
          content: string
          created_at: string
          embedding: string
          id: string
          metadata: Json
        }
        Insert: {
          content: string
          created_at?: string
          embedding: string
          id: string
          metadata?: Json
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      ai_mentor_chats: {
        Row: {
          conversation_context: Json | null
          cost_usd: number | null
          course_id: string | null
          created_at: string | null
          escalated_at: string | null
          escalated_to_trainer: boolean | null
          escalation_reason: string | null
          flagged_for_review: boolean | null
          id: string
          model: string
          prompt_variant_id: string | null
          question: string
          question_hash: string | null
          rated_at: string | null
          response: string
          response_time_ms: number
          student_feedback: string | null
          student_rating: number | null
          tokens_used: number
          topic_id: string | null
          user_id: string
        }
        Insert: {
          conversation_context?: Json | null
          cost_usd?: number | null
          course_id?: string | null
          created_at?: string | null
          escalated_at?: string | null
          escalated_to_trainer?: boolean | null
          escalation_reason?: string | null
          flagged_for_review?: boolean | null
          id?: string
          model?: string
          prompt_variant_id?: string | null
          question: string
          question_hash?: string | null
          rated_at?: string | null
          response: string
          response_time_ms?: number
          student_feedback?: string | null
          student_rating?: number | null
          tokens_used?: number
          topic_id?: string | null
          user_id: string
        }
        Update: {
          conversation_context?: Json | null
          cost_usd?: number | null
          course_id?: string | null
          created_at?: string | null
          escalated_at?: string | null
          escalated_to_trainer?: boolean | null
          escalation_reason?: string | null
          flagged_for_review?: boolean | null
          id?: string
          model?: string
          prompt_variant_id?: string | null
          question?: string
          question_hash?: string | null
          rated_at?: string | null
          response?: string
          response_time_ms?: number
          student_feedback?: string | null
          student_rating?: number | null
          tokens_used?: number
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentor_chats_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_prompt_variant_id_fkey"
            columns: ["prompt_variant_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_variant_performance"
            referencedColumns: ["variant_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_prompt_variant_id_fkey"
            columns: ["prompt_variant_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_mentor_escalations: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          auto_detected: boolean | null
          chat_id: string
          confidence: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          reason: string
          resolution_notes: string | null
          resolution_time_minutes: number | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          topic_id: string | null
          triggers: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          auto_detected?: boolean | null
          chat_id: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason: string
          resolution_notes?: string | null
          resolution_time_minutes?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          topic_id?: string | null
          triggers?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          auto_detected?: boolean | null
          chat_id?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string
          resolution_notes?: string | null
          resolution_time_minutes?: number | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          topic_id?: string | null
          triggers?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_mentor_rate_limits: {
        Row: {
          daily_count: number
          daily_reset_at: string
          hourly_count: number
          hourly_reset_at: string
          id: string
          monthly_cost_usd: number | null
          monthly_count: number
          monthly_reset_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          daily_count?: number
          daily_reset_at?: string
          hourly_count?: number
          hourly_reset_at?: string
          id?: string
          monthly_cost_usd?: number | null
          monthly_count?: number
          monthly_reset_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          daily_count?: number
          daily_reset_at?: string
          hourly_count?: number
          hourly_reset_at?: string
          id?: string
          monthly_cost_usd?: number | null
          monthly_count?: number
          monthly_reset_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_rate_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_mentor_sessions: {
        Row: {
          course_id: string | null
          ended_at: string | null
          id: string
          last_message_at: string | null
          message_count: number
          started_at: string | null
          title: string | null
          topic_id: string | null
          total_cost_usd: number | null
          total_tokens: number
          user_id: string
        }
        Insert: {
          course_id?: string | null
          ended_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number
          started_at?: string | null
          title?: string | null
          topic_id?: string | null
          total_cost_usd?: number | null
          total_tokens?: number
          user_id: string
        }
        Update: {
          course_id?: string | null
          ended_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number
          started_at?: string | null
          title?: string | null
          topic_id?: string | null
          total_cost_usd?: number | null
          total_tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentor_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_patterns: {
        Row: {
          created_at: string
          description: string
          first_seen: string
          id: string
          last_seen: string
          metadata: Json
          occurrence_count: number
          pattern_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          first_seen?: string
          id: string
          last_seen?: string
          metadata?: Json
          occurrence_count?: number
          pattern_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          first_seen?: string
          id?: string
          last_seen?: string
          metadata?: Json
          occurrence_count?: number
          pattern_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_patterns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_prompt_variants: {
        Row: {
          avg_rating: number | null
          avg_response_time_ms: number | null
          avg_tokens_used: number | null
          created_at: string | null
          deactivated_at: string | null
          escalation_count: number | null
          id: string
          is_active: boolean | null
          system_prompt: string
          total_uses: number | null
          traffic_percentage: number | null
          variant_name: string
        }
        Insert: {
          avg_rating?: number | null
          avg_response_time_ms?: number | null
          avg_tokens_used?: number | null
          created_at?: string | null
          deactivated_at?: string | null
          escalation_count?: number | null
          id?: string
          is_active?: boolean | null
          system_prompt: string
          total_uses?: number | null
          traffic_percentage?: number | null
          variant_name: string
        }
        Update: {
          avg_rating?: number | null
          avg_response_time_ms?: number | null
          avg_tokens_used?: number | null
          created_at?: string | null
          deactivated_at?: string | null
          escalation_count?: number | null
          id?: string
          is_active?: boolean | null
          system_prompt?: string
          total_uses?: number | null
          traffic_percentage?: number | null
          variant_name?: string
        }
        Relationships: []
      }
      ai_prompts: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          variables: Json
          version: number
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          variables?: Json
          version?: number
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          variables?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_question_patterns: {
        Row: {
          avg_response_quality: number | null
          canonical_question: string
          category: string | null
          escalation_rate: number | null
          first_seen: string | null
          id: string
          last_seen: string | null
          occurrence_count: number | null
          pattern_hash: string
          topic_id: string | null
          unique_students: number | null
        }
        Insert: {
          avg_response_quality?: number | null
          canonical_question: string
          category?: string | null
          escalation_rate?: number | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          occurrence_count?: number | null
          pattern_hash: string
          topic_id?: string | null
          unique_students?: number | null
        }
        Update: {
          avg_response_quality?: number | null
          canonical_question?: string
          category?: string | null
          escalation_rate?: number | null
          first_seen?: string | null
          id?: string
          last_seen?: string | null
          occurrence_count?: number | null
          pattern_hash?: string
          topic_id?: string | null
          unique_students?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_question_patterns_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_question_patterns_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_question_patterns_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_question_patterns_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_question_patterns_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_question_patterns_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_question_patterns_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      ai_test: {
        Row: {
          id: string
        }
        Insert: {
          id?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      audit_log_retention_policy: {
        Row: {
          archive_after_months: number | null
          created_at: string
          id: string
          retention_months: number
          table_name: string
          updated_at: string
        }
        Insert: {
          archive_after_months?: number | null
          created_at?: string
          id?: string
          retention_months?: number
          table_name: string
          updated_at?: string
        }
        Update: {
          archive_after_months?: number | null
          created_at?: string
          id?: string
          retention_months?: number
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          record_id: string | null
          request_id: string | null
          request_method: string | null
          request_path: string | null
          session_id: string | null
          severity: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_ip_address: unknown
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      audit_logs_2025_11: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          record_id: string | null
          request_id: string | null
          request_method: string | null
          request_path: string | null
          session_id: string | null
          severity: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_ip_address: unknown
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Relationships: []
      }
      audit_logs_2025_12: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          record_id: string | null
          request_id: string | null
          request_method: string | null
          request_path: string | null
          session_id: string | null
          severity: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_ip_address: unknown
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Relationships: []
      }
      audit_logs_2026_01: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          record_id: string | null
          request_id: string | null
          request_method: string | null
          request_path: string | null
          session_id: string | null
          severity: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_ip_address: unknown
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Relationships: []
      }
      audit_logs_2026_02: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          org_id: string | null
          record_id: string | null
          request_id: string | null
          request_method: string | null
          request_path: string | null
          session_id: string | null
          severity: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_ip_address: unknown
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          org_id?: string | null
          record_id?: string | null
          request_id?: string | null
          request_method?: string | null
          request_path?: string | null
          session_id?: string | null
          severity?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_ip_address?: unknown
        }
        Relationships: []
      }
      badge_progress: {
        Row: {
          badge_id: string
          current_value: number | null
          id: string
          last_updated: string | null
          target_value: number
          user_id: string
        }
        Insert: {
          badge_id: string
          current_value?: number | null
          id?: string
          last_updated?: string | null
          target_value: number
          user_id: string
        }
        Update: {
          badge_id?: string
          current_value?: number | null
          id?: string
          last_updated?: string | null
          target_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_progress_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_completion_stats"
            referencedColumns: ["badge_id"]
          },
          {
            foreignKeyName: "badge_progress_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "rare_achievements"
            referencedColumns: ["badge_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      badge_trigger_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          id: string
          processed: boolean | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          id?: string
          processed?: boolean | null
          trigger_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          id?: string
          processed?: boolean | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_trigger_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string | null
          description: string
          display_order: number | null
          icon_url: string | null
          id: string
          is_hidden: boolean | null
          name: string
          rarity: string
          slug: string
          trigger_threshold: number | null
          trigger_type: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_hidden?: boolean | null
          name: string
          rarity: string
          slug: string
          trigger_threshold?: number | null
          trigger_type: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          display_order?: number | null
          icon_url?: string | null
          id?: string
          is_hidden?: boolean | null
          name?: string
          rarity?: string
          slug?: string
          trigger_threshold?: number | null
          trigger_type?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      candidate_embeddings: {
        Row: {
          availability: string | null
          candidate_id: string
          created_at: string | null
          embedding: string | null
          experience_level: string | null
          id: string
          org_id: string
          resume_text: string
          skills: string[] | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          candidate_id: string
          created_at?: string | null
          embedding?: string | null
          experience_level?: string | null
          id?: string
          org_id: string
          resume_text: string
          skills?: string[] | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          candidate_id?: string
          created_at?: string | null
          embedding?: string | null
          experience_level?: string | null
          id?: string
          org_id?: string
          resume_text?: string
          skills?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_embeddings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_embeddings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      capstone_submissions: {
        Row: {
          avg_peer_rating: number | null
          course_id: string
          created_at: string | null
          demo_video_url: string | null
          description: string | null
          enrollment_id: string
          feedback: string | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          peer_review_count: number | null
          repository_url: string
          revision_count: number | null
          rubric_scores: Json | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_peer_rating?: number | null
          course_id: string
          created_at?: string | null
          demo_video_url?: string | null
          description?: string | null
          enrollment_id: string
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          peer_review_count?: number | null
          repository_url: string
          revision_count?: number | null
          rubric_scores?: Json | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_peer_rating?: number | null
          course_id?: string
          created_at?: string | null
          demo_video_url?: string | null
          description?: string | null
          enrollment_id?: string
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          peer_review_count?: number | null
          repository_url?: string
          revision_count?: number | null
          rubric_scores?: Json | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capstone_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "capstone_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      content_assets: {
        Row: {
          cdn_url: string | null
          created_at: string | null
          file_size_bytes: number
          file_type: string
          filename: string
          id: string
          is_current: boolean | null
          is_public: boolean | null
          lesson_id: string | null
          mime_type: string
          replaced_by: string | null
          searchable_content: string | null
          storage_path: string
          topic_id: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          cdn_url?: string | null
          created_at?: string | null
          file_size_bytes: number
          file_type: string
          filename: string
          id?: string
          is_current?: boolean | null
          is_public?: boolean | null
          lesson_id?: string | null
          mime_type: string
          replaced_by?: string | null
          searchable_content?: string | null
          storage_path: string
          topic_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          cdn_url?: string | null
          created_at?: string | null
          file_size_bytes?: number
          file_type?: string
          filename?: string
          id?: string
          is_current?: boolean | null
          is_public?: boolean | null
          lesson_id?: string | null
          mime_type?: string
          replaced_by?: string | null
          searchable_content?: string | null
          storage_path?: string
          topic_id?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "topic_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "content_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "content_assets_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "content_assets_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "content_assets_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "content_assets_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "content_assets_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string | null
          description: string | null
          estimated_duration_hours: number | null
          id: string
          is_published: boolean | null
          module_number: number
          prerequisite_module_ids: string[] | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          id?: string
          is_published?: boolean | null
          module_number: number
          prerequisite_module_ids?: string[] | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          id?: string
          is_published?: boolean | null
          module_number?: number
          prerequisite_module_ids?: string[] | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string
          estimated_duration_weeks: number
          id: string
          is_featured: boolean | null
          is_included_in_all_access: boolean | null
          is_published: boolean | null
          prerequisite_course_ids: string[] | null
          price_monthly: number | null
          price_one_time: number | null
          promo_video_url: string | null
          skill_level: string | null
          slug: string
          subtitle: string | null
          thumbnail_url: string | null
          title: string
          total_modules: number
          total_topics: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description: string
          estimated_duration_weeks: number
          id?: string
          is_featured?: boolean | null
          is_included_in_all_access?: boolean | null
          is_published?: boolean | null
          prerequisite_course_ids?: string[] | null
          price_monthly?: number | null
          price_one_time?: number | null
          promo_video_url?: string | null
          skill_level?: string | null
          slug: string
          subtitle?: string | null
          thumbnail_url?: string | null
          title: string
          total_modules?: number
          total_topics?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string
          estimated_duration_weeks?: number
          id?: string
          is_featured?: boolean | null
          is_included_in_all_access?: boolean | null
          is_published?: boolean | null
          prerequisite_course_ids?: string[] | null
          price_monthly?: number | null
          price_one_time?: number | null
          promo_video_url?: string | null
          skill_level?: string | null
          slug?: string
          subtitle?: string | null
          thumbnail_url?: string | null
          title?: string
          total_modules?: number
          total_topics?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employee_screenshots: {
        Row: {
          active_window_title: string | null
          activity_category: string | null
          analyzed: boolean | null
          analyzed_at: string | null
          captured_at: string
          confidence: number | null
          created_at: string | null
          deleted_at: string | null
          file_size: number
          filename: string
          id: string
          machine_name: string | null
          os_type: string | null
          storage_bucket: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_window_title?: string | null
          activity_category?: string | null
          analyzed?: boolean | null
          analyzed_at?: string | null
          captured_at: string
          confidence?: number | null
          created_at?: string | null
          deleted_at?: string | null
          file_size: number
          filename: string
          id?: string
          machine_name?: string | null
          os_type?: string | null
          storage_bucket?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_window_title?: string | null
          activity_category?: string | null
          analyzed?: boolean | null
          analyzed_at?: string | null
          captured_at?: string
          confidence?: number | null
          created_at?: string | null
          deleted_at?: string | null
          file_size?: number
          filename?: string
          id?: string
          machine_name?: string | null
          os_type?: string | null
          storage_bucket?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_screenshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employee_twin_interactions: {
        Row: {
          context: Json | null
          cost_usd: number | null
          created_at: string | null
          dismissed: boolean | null
          id: string
          interaction_type: string
          latency_ms: number | null
          model_used: string | null
          org_id: string
          prompt: string | null
          response: string
          tokens_used: number | null
          twin_role: string
          updated_at: string | null
          user_feedback: string | null
          user_id: string
          was_helpful: boolean | null
        }
        Insert: {
          context?: Json | null
          cost_usd?: number | null
          created_at?: string | null
          dismissed?: boolean | null
          id?: string
          interaction_type: string
          latency_ms?: number | null
          model_used?: string | null
          org_id: string
          prompt?: string | null
          response: string
          tokens_used?: number | null
          twin_role: string
          updated_at?: string | null
          user_feedback?: string | null
          user_id: string
          was_helpful?: boolean | null
        }
        Update: {
          context?: Json | null
          cost_usd?: number | null
          created_at?: string | null
          dismissed?: boolean | null
          id?: string
          interaction_type?: string
          latency_ms?: number | null
          model_used?: string | null
          org_id?: string
          prompt?: string | null
          response?: string
          tokens_used?: number | null
          twin_role?: string
          updated_at?: string | null
          user_feedback?: string | null
          user_id?: string
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_twin_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      escalation_notifications: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          escalation_id: string
          id: string
          notification_type: string
          recipient_email: string | null
          recipient_id: string | null
          recipient_slack_id: string | null
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          escalation_id: string
          id?: string
          notification_type: string
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_slack_id?: string | null
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          escalation_id?: string
          id?: string
          notification_type?: string
          recipient_email?: string | null
          recipient_id?: string | null
          recipient_slack_id?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_notifications_escalation_id_fkey"
            columns: ["escalation_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_escalations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_escalation_id_fkey"
            columns: ["escalation_id"]
            isOneToOne: false
            referencedRelation: "escalation_queue"
            referencedColumns: ["escalation_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      event_delivery_log: {
        Row: {
          attempted_at: string
          duration_ms: number | null
          error_message: string | null
          event_id: string
          id: string
          org_id: string
          response_body: string | null
          response_code: number | null
          status: string
          subscription_id: string
        }
        Insert: {
          attempted_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_id: string
          id?: string
          org_id: string
          response_body?: string | null
          response_code?: number | null
          status: string
          subscription_id: string
        }
        Update: {
          attempted_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_id?: string
          id?: string
          org_id?: string
          response_body?: string | null
          response_code?: number | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_delivery_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_delivery_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_failed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_delivery_log_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_events_recent"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_delivery_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_delivery_log_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_delivery_log_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "event_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_subscriptions: {
        Row: {
          auto_disabled_at: string | null
          consecutive_failures: number | null
          created_at: string
          event_pattern: string
          failure_count: number | null
          handler_function: string | null
          id: string
          is_active: boolean | null
          last_failure_at: string | null
          last_failure_message: string | null
          last_triggered_at: string | null
          org_id: string
          subscriber_name: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          auto_disabled_at?: string | null
          consecutive_failures?: number | null
          created_at?: string
          event_pattern: string
          failure_count?: number | null
          handler_function?: string | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_failure_message?: string | null
          last_triggered_at?: string | null
          org_id: string
          subscriber_name: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          auto_disabled_at?: string | null
          consecutive_failures?: number | null
          created_at?: string
          event_pattern?: string
          failure_count?: number | null
          handler_function?: string | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_failure_message?: string | null
          last_triggered_at?: string | null
          org_id?: string
          subscriber_name?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          aggregate_id: string | null
          created_at: string
          error_message: string | null
          event_category: string
          event_type: string
          event_version: number | null
          failed_at: string | null
          id: string
          max_retries: number | null
          metadata: Json | null
          next_retry_at: string | null
          org_id: string
          payload: Json
          processed_at: string | null
          retry_count: number | null
          status: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          aggregate_id?: string | null
          created_at?: string
          error_message?: string | null
          event_category: string
          event_type: string
          event_version?: number | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          org_id: string
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          aggregate_id?: string | null
          created_at?: string
          error_message?: string | null
          event_category?: string
          event_type?: string
          event_version?: number | null
          failed_at?: string | null
          id?: string
          max_retries?: number | null
          metadata?: Json | null
          next_retry_at?: string | null
          org_id?: string
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      generated_resumes: {
        Row: {
          ats_keywords: string[] | null
          cost_usd: number | null
          created_at: string | null
          generation_latency_ms: number | null
          has_action_verbs: boolean | null
          has_quantified_achievements: boolean | null
          id: string
          interview_count: number | null
          length_appropriate: boolean | null
          model_used: string | null
          no_typos: boolean | null
          org_id: string
          placement_achieved: boolean | null
          quality_score: number | null
          resume_pdf_path: string | null
          resume_text: string
          student_feedback: string | null
          target_role: string
          tokens_used: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ats_keywords?: string[] | null
          cost_usd?: number | null
          created_at?: string | null
          generation_latency_ms?: number | null
          has_action_verbs?: boolean | null
          has_quantified_achievements?: boolean | null
          id?: string
          interview_count?: number | null
          length_appropriate?: boolean | null
          model_used?: string | null
          no_typos?: boolean | null
          org_id: string
          placement_achieved?: boolean | null
          quality_score?: number | null
          resume_pdf_path?: string | null
          resume_text: string
          student_feedback?: string | null
          target_role: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ats_keywords?: string[] | null
          cost_usd?: number | null
          created_at?: string | null
          generation_latency_ms?: number | null
          has_action_verbs?: boolean | null
          has_quantified_achievements?: boolean | null
          id?: string
          interview_count?: number | null
          length_appropriate?: boolean | null
          model_used?: string | null
          no_typos?: boolean | null
          org_id?: string
          placement_achieved?: boolean | null
          quality_score?: number | null
          resume_pdf_path?: string | null
          resume_text?: string
          student_feedback?: string | null
          target_role?: string
          tokens_used?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_resumes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      guru_interactions: {
        Row: {
          agent_type: string
          conversation_id: string | null
          cost_usd: number
          created_at: string
          id: string
          input: Json
          latency_ms: number
          model_used: string
          org_id: string
          output: Json
          student_id: string
          tokens_used: number
          user_feedback: string | null
          was_helpful: boolean | null
        }
        Insert: {
          agent_type: string
          conversation_id?: string | null
          cost_usd?: number
          created_at?: string
          id?: string
          input: Json
          latency_ms?: number
          model_used: string
          org_id: string
          output: Json
          student_id: string
          tokens_used?: number
          user_feedback?: string | null
          was_helpful?: boolean | null
        }
        Update: {
          agent_type?: string
          conversation_id?: string | null
          cost_usd?: number
          created_at?: string
          id?: string
          input?: Json
          latency_ms?: number
          model_used?: string
          org_id?: string
          output?: Json
          student_id?: string
          tokens_used?: number
          user_feedback?: string | null
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "guru_interactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guru_interactions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guru_interactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          average_score: number
          completed_at: string | null
          created_at: string
          duration: number | null
          guidewire_module: string | null
          id: string
          interview_type: string
          questions: Json
          started_at: string
          student_id: string
          updated_at: string
        }
        Insert: {
          average_score?: number
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          guidewire_module?: string | null
          id?: string
          interview_type: string
          questions?: Json
          started_at?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          average_score?: number
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          guidewire_module?: string | null
          id?: string
          interview_type?: string
          questions?: Json
          started_at?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lab_instances: {
        Row: {
          completed_at: string | null
          created_at: string | null
          enrollment_id: string
          expires_at: string | null
          forked_repo_name: string | null
          forked_repo_url: string
          github_username: string | null
          id: string
          lab_template_id: string | null
          last_activity_at: string | null
          original_template_url: string
          provisioning_metadata: Json | null
          started_at: string | null
          status: string | null
          time_spent_seconds: number | null
          topic_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id: string
          expires_at?: string | null
          forked_repo_name?: string | null
          forked_repo_url: string
          github_username?: string | null
          id?: string
          lab_template_id?: string | null
          last_activity_at?: string | null
          original_template_url: string
          provisioning_metadata?: Json | null
          started_at?: string | null
          status?: string | null
          time_spent_seconds?: number | null
          topic_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          enrollment_id?: string
          expires_at?: string | null
          forked_repo_name?: string | null
          forked_repo_url?: string
          github_username?: string | null
          id?: string
          lab_template_id?: string | null
          last_activity_at?: string | null
          original_template_url?: string
          provisioning_metadata?: Json | null
          started_at?: string | null
          status?: string | null
          time_spent_seconds?: number | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_instances_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_lab_template_id_fkey"
            columns: ["lab_template_id"]
            isOneToOne: false
            referencedRelation: "lab_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_instances_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_instances_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_instances_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_instances_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_instances_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_instances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lab_submissions: {
        Row: {
          attempt_number: number | null
          auto_grade_result: Json | null
          auto_grade_score: number | null
          auto_graded_at: string | null
          branch_name: string | null
          commit_sha: string | null
          created_at: string | null
          enrollment_id: string
          feedback: string | null
          final_score: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          lab_instance_id: string
          manual_grade_score: number | null
          passed: boolean | null
          previous_submission_id: string | null
          repository_url: string
          rubric_scores: Json | null
          status: string | null
          submitted_at: string | null
          topic_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attempt_number?: number | null
          auto_grade_result?: Json | null
          auto_grade_score?: number | null
          auto_graded_at?: string | null
          branch_name?: string | null
          commit_sha?: string | null
          created_at?: string | null
          enrollment_id: string
          feedback?: string | null
          final_score?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          lab_instance_id: string
          manual_grade_score?: number | null
          passed?: boolean | null
          previous_submission_id?: string | null
          repository_url: string
          rubric_scores?: Json | null
          status?: string | null
          submitted_at?: string | null
          topic_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attempt_number?: number | null
          auto_grade_result?: Json | null
          auto_grade_score?: number | null
          auto_graded_at?: string | null
          branch_name?: string | null
          commit_sha?: string | null
          created_at?: string | null
          enrollment_id?: string
          feedback?: string | null
          final_score?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          lab_instance_id?: string
          manual_grade_score?: number | null
          passed?: boolean | null
          previous_submission_id?: string | null
          repository_url?: string
          rubric_scores?: Json | null
          status?: string | null
          submitted_at?: string | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_lab_instance_id_fkey"
            columns: ["lab_instance_id"]
            isOneToOne: false
            referencedRelation: "lab_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_previous_submission_id_fkey"
            columns: ["previous_submission_id"]
            isOneToOne: false
            referencedRelation: "grading_queue"
            referencedColumns: ["submission_id"]
          },
          {
            foreignKeyName: "lab_submissions_previous_submission_id_fkey"
            columns: ["previous_submission_id"]
            isOneToOne: false
            referencedRelation: "lab_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lab_templates: {
        Row: {
          auto_grading_enabled: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          estimated_duration_minutes: number | null
          github_actions_workflow: string | null
          github_template_url: string
          id: string
          is_active: boolean | null
          name: string
          required_skills: string[] | null
          time_limit_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          auto_grading_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          github_actions_workflow?: string | null
          github_template_url: string
          id?: string
          is_active?: boolean | null
          name: string
          required_skills?: string[] | null
          time_limit_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_grading_enabled?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          estimated_duration_minutes?: number | null
          github_actions_workflow?: string | null
          github_template_url?: string
          id?: string
          is_active?: boolean | null
          name?: string
          required_skills?: string[] | null
          time_limit_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      module_topics: {
        Row: {
          content_type: string
          created_at: string | null
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          is_published: boolean | null
          is_required: boolean | null
          module_id: string
          prerequisite_topic_ids: string[] | null
          slug: string
          title: string
          topic_number: number
          updated_at: string | null
        }
        Insert: {
          content_type: string
          created_at?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          is_required?: boolean | null
          module_id: string
          prerequisite_topic_ids?: string[] | null
          slug: string
          title: string
          topic_number: number
          updated_at?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          is_required?: boolean | null
          module_id?: string
          prerequisite_topic_ids?: string[] | null
          slug?: string
          title?: string
          topic_number?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_unlock_requirements"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["module_id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          billing_email: string | null
          city: string | null
          country: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          features: Json | null
          id: string
          legal_name: string | null
          max_candidates: number | null
          max_storage_gb: number | null
          max_users: number | null
          name: string
          onboarding_completed: boolean | null
          onboarding_step: string | null
          phone: string | null
          postal_code: string | null
          settings: Json | null
          slug: string
          state: string | null
          status: string
          subscription_status: string
          subscription_tier: string
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          billing_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          features?: Json | null
          id?: string
          legal_name?: string | null
          max_candidates?: number | null
          max_storage_gb?: number | null
          max_users?: number | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          slug: string
          state?: string | null
          status?: string
          subscription_status?: string
          subscription_tier?: string
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          billing_email?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          features?: Json | null
          id?: string
          legal_name?: string | null
          max_candidates?: number | null
          max_storage_gb?: number | null
          max_users?: number | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_step?: string | null
          phone?: string | null
          postal_code?: string | null
          settings?: Json | null
          slug?: string
          state?: string | null
          status?: string
          subscription_status?: string
          subscription_tier?: string
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      peer_reviews: {
        Row: {
          comments: string
          created_at: string | null
          id: string
          improvements: string | null
          rating: number
          reviewed_at: string | null
          reviewer_id: string
          strengths: string | null
          submission_id: string
          updated_at: string | null
        }
        Insert: {
          comments: string
          created_at?: string | null
          id?: string
          improvements?: string | null
          rating: number
          reviewed_at?: string | null
          reviewer_id: string
          strengths?: string | null
          submission_id: string
          updated_at?: string | null
        }
        Update: {
          comments?: string
          created_at?: string | null
          id?: string
          improvements?: string | null
          rating?: number
          reviewed_at?: string | null
          reviewer_id?: string
          strengths?: string | null
          submission_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "capstone_grading_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "capstone_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          deleted_at: string | null
          description: string | null
          display_name: string
          id: string
          is_dangerous: boolean | null
          resource: string
          scope: string | null
        }
        Insert: {
          action: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_dangerous?: boolean | null
          resource: string
          scope?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_dangerous?: boolean | null
          resource?: string
          scope?: string | null
        }
        Relationships: []
      }
      productivity_reports: {
        Row: {
          created_at: string | null
          date: string
          id: string
          insights: Json
          productive_hours: number
          recommendations: Json
          summary: string
          top_activities: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          insights?: Json
          productive_hours: number
          recommendations?: Json
          summary: string
          top_activities?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          insights?: Json
          productive_hours?: number
          recommendations?: Json
          summary?: string
          top_activities?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productivity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      project_timeline: {
        Row: {
          actions_taken: Json | null
          agent_model: string | null
          agent_type: string | null
          ai_generated_summary: string | null
          assumptions: Json | null
          conversation_summary: string
          created_at: string | null
          decisions: Json | null
          deleted_at: string | null
          duration: string | null
          files_changed: Json | null
          future_notes: Json | null
          id: string
          is_archived: boolean | null
          key_learnings: string[] | null
          org_id: string
          related_commits: string[] | null
          related_docs: string[] | null
          related_prs: string[] | null
          results: Json | null
          search_vector: unknown
          session_date: string
          session_id: string
          tags: string[] | null
          updated_at: string | null
          user_intent: string | null
        }
        Insert: {
          actions_taken?: Json | null
          agent_model?: string | null
          agent_type?: string | null
          ai_generated_summary?: string | null
          assumptions?: Json | null
          conversation_summary: string
          created_at?: string | null
          decisions?: Json | null
          deleted_at?: string | null
          duration?: string | null
          files_changed?: Json | null
          future_notes?: Json | null
          id?: string
          is_archived?: boolean | null
          key_learnings?: string[] | null
          org_id: string
          related_commits?: string[] | null
          related_docs?: string[] | null
          related_prs?: string[] | null
          results?: Json | null
          search_vector?: unknown
          session_date?: string
          session_id: string
          tags?: string[] | null
          updated_at?: string | null
          user_intent?: string | null
        }
        Update: {
          actions_taken?: Json | null
          agent_model?: string | null
          agent_type?: string | null
          ai_generated_summary?: string | null
          assumptions?: Json | null
          conversation_summary?: string
          created_at?: string | null
          decisions?: Json | null
          deleted_at?: string | null
          duration?: string | null
          files_changed?: Json | null
          future_notes?: Json | null
          id?: string
          is_archived?: boolean | null
          key_learnings?: string[] | null
          org_id?: string
          related_commits?: string[] | null
          related_docs?: string[] | null
          related_prs?: string[] | null
          results?: Json | null
          search_vector?: unknown
          session_date?: string
          session_id?: string
          tags?: string[] | null
          updated_at?: string | null
          user_intent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_timeline_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_timeline_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          attempt_number: number
          correct_answers: number | null
          created_at: string
          enrollment_id: string
          id: string
          passed: boolean | null
          score: number | null
          started_at: string
          submitted_at: string | null
          time_taken_seconds: number | null
          topic_id: string
          total_questions: number
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          answers?: Json | null
          attempt_number?: number
          correct_answers?: number | null
          created_at?: string
          enrollment_id: string
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          time_taken_seconds?: number | null
          topic_id: string
          total_questions: number
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          answers?: Json | null
          attempt_number?: number
          correct_answers?: number | null
          created_at?: string
          enrollment_id?: string
          id?: string
          passed?: boolean | null
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          time_taken_seconds?: number | null
          topic_id?: string
          total_questions?: number
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_attempts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          code_language: string | null
          correct_answers: Json
          created_at: string
          created_by: string
          difficulty: string
          explanation: string | null
          id: string
          is_public: boolean
          options: Json
          points: number
          question_text: string
          question_type: string
          topic_id: string | null
          updated_at: string
        }
        Insert: {
          code_language?: string | null
          correct_answers: Json
          created_at?: string
          created_by: string
          difficulty?: string
          explanation?: string | null
          id?: string
          is_public?: boolean
          options: Json
          points?: number
          question_text: string
          question_type: string
          topic_id?: string | null
          updated_at?: string
        }
        Update: {
          code_language?: string | null
          correct_answers?: Json
          created_at?: string
          created_by?: string
          difficulty?: string
          explanation?: string | null
          id?: string
          is_public?: boolean
          options?: Json
          points?: number
          question_text?: string
          question_type?: string
          topic_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      quiz_settings: {
        Row: {
          allow_review: boolean
          created_at: string
          id: string
          max_attempts: number | null
          passing_threshold: number
          randomize_options: boolean
          randomize_questions: boolean
          show_correct_answers: boolean
          time_limit_minutes: number | null
          topic_id: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          allow_review?: boolean
          created_at?: string
          id?: string
          max_attempts?: number | null
          passing_threshold?: number
          randomize_options?: boolean
          randomize_questions?: boolean
          show_correct_answers?: boolean
          time_limit_minutes?: number | null
          topic_id: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          allow_review?: boolean
          created_at?: string
          id?: string
          max_attempts?: number | null
          passing_threshold?: number
          randomize_options?: boolean
          randomize_questions?: boolean
          show_correct_answers?: boolean
          time_limit_minutes?: number | null
          topic_id?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_settings_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: true
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_settings_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: true
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_settings_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: true
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_settings_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: true
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_settings_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: true
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_settings_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: true
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_settings_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: true
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      reading_progress: {
        Row: {
          content_length: number | null
          content_type: string | null
          created_at: string | null
          current_page: number | null
          enrollment_id: string
          id: string
          last_read_at: string | null
          last_scroll_position: number | null
          scroll_percentage: number
          session_count: number
          topic_id: string
          total_pages: number | null
          total_reading_time_seconds: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content_length?: number | null
          content_type?: string | null
          created_at?: string | null
          current_page?: number | null
          enrollment_id: string
          id?: string
          last_read_at?: string | null
          last_scroll_position?: number | null
          scroll_percentage?: number
          session_count?: number
          topic_id: string
          total_pages?: number | null
          total_reading_time_seconds?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content_length?: number | null
          content_type?: string | null
          created_at?: string | null
          current_page?: number | null
          enrollment_id?: string
          id?: string
          last_read_at?: string | null
          last_scroll_position?: number | null
          scroll_percentage?: number
          session_count?: number
          topic_id?: string
          total_pages?: number | null
          total_reading_time_seconds?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      requisition_embeddings: {
        Row: {
          created_at: string | null
          description: string
          embedding: string | null
          experience_level: string | null
          id: string
          nice_to_have_skills: string[] | null
          org_id: string
          required_skills: string[] | null
          requisition_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          embedding?: string | null
          experience_level?: string | null
          id?: string
          nice_to_have_skills?: string[] | null
          org_id: string
          required_skills?: string[] | null
          requisition_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          embedding?: string | null
          experience_level?: string | null
          id?: string
          nice_to_have_skills?: string[] | null
          org_id?: string
          required_skills?: string[] | null
          requisition_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requisition_embeddings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisition_embeddings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_matches: {
        Row: {
          availability_score: number | null
          candidate_id: string
          cost_usd: number | null
          created_at: string | null
          experience_score: number | null
          id: string
          interview_scheduled: boolean | null
          is_relevant: boolean | null
          match_score: number | null
          model_used: string | null
          org_id: string
          placement_achieved: boolean | null
          project_score: number | null
          reasoning: string | null
          recruiter_feedback: string | null
          requisition_id: string
          search_latency_ms: number | null
          skills_matched: string[] | null
          skills_missing: string[] | null
          skills_score: number | null
          submitted: boolean | null
          tokens_used: number | null
          updated_at: string | null
        }
        Insert: {
          availability_score?: number | null
          candidate_id: string
          cost_usd?: number | null
          created_at?: string | null
          experience_score?: number | null
          id?: string
          interview_scheduled?: boolean | null
          is_relevant?: boolean | null
          match_score?: number | null
          model_used?: string | null
          org_id: string
          placement_achieved?: boolean | null
          project_score?: number | null
          reasoning?: string | null
          recruiter_feedback?: string | null
          requisition_id: string
          search_latency_ms?: number | null
          skills_matched?: string[] | null
          skills_missing?: string[] | null
          skills_score?: number | null
          submitted?: boolean | null
          tokens_used?: number | null
          updated_at?: string | null
        }
        Update: {
          availability_score?: number | null
          candidate_id?: string
          cost_usd?: number | null
          created_at?: string | null
          experience_score?: number | null
          id?: string
          interview_scheduled?: boolean | null
          is_relevant?: boolean | null
          match_score?: number | null
          model_used?: string | null
          org_id?: string
          placement_achieved?: boolean | null
          project_score?: number | null
          reasoning?: string | null
          recruiter_feedback?: string | null
          requisition_id?: string
          search_latency_ms?: number | null
          skills_matched?: string[] | null
          skills_missing?: string[] | null
          skills_score?: number | null
          submitted?: boolean | null
          tokens_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resume_matches_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_matches_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_versions: {
        Row: {
          ats_score: number
          content: Json
          created_at: string
          format: string
          id: string
          keyword_matches: string[]
          student_id: string
          target_job_description: string | null
          updated_at: string
          version: number
        }
        Insert: {
          ats_score?: number
          content: Json
          created_at?: string
          format: string
          id?: string
          keyword_matches?: string[]
          student_id: string
          target_job_description?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          ats_score?: number
          content?: Json
          created_at?: string
          format?: string
          id?: string
          keyword_matches?: string[]
          student_id?: string
          target_job_description?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resume_versions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string
          granted_by: string | null
          permission_id: string
          role_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          permission_id: string
          role_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_roles_with_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color_code: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          display_name: string
          hierarchy_level: number | null
          id: string
          is_active: boolean | null
          is_system_role: boolean | null
          name: string
          parent_role_id: string | null
          updated_at: string
        }
        Insert: {
          color_code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          display_name: string
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name: string
          parent_role_id?: string | null
          updated_at?: string
        }
        Update: {
          color_code?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          display_name?: string
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean | null
          is_system_role?: boolean | null
          name?: string
          parent_role_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "roles_parent_role_id_fkey"
            columns: ["parent_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_parent_role_id_fkey"
            columns: ["parent_role_id"]
            isOneToOne: false
            referencedRelation: "v_roles_with_permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_metadata: {
        Row: {
          branch: string | null
          commands_executed: number | null
          commit_hash: string | null
          created_at: string | null
          duration: string | null
          ended_at: string | null
          environment: string | null
          files_modified: number | null
          id: string
          lines_added: number | null
          lines_removed: number | null
          org_id: string
          overall_goal: string | null
          session_id: string
          started_at: string
          successfully_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          branch?: string | null
          commands_executed?: number | null
          commit_hash?: string | null
          created_at?: string | null
          duration?: string | null
          ended_at?: string | null
          environment?: string | null
          files_modified?: number | null
          id?: string
          lines_added?: number | null
          lines_removed?: number | null
          org_id: string
          overall_goal?: string | null
          session_id: string
          started_at: string
          successfully_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          branch?: string | null
          commands_executed?: number | null
          commit_hash?: string | null
          created_at?: string | null
          duration?: string | null
          ended_at?: string | null
          environment?: string | null
          files_modified?: number | null
          id?: string
          lines_added?: number | null
          lines_removed?: number | null
          org_id?: string
          overall_goal?: string | null
          session_id?: string
          started_at?: string
          successfully_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_metadata_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_metadata_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          completed_at: string | null
          completion_percentage: number | null
          course_id: string
          created_at: string | null
          current_module_id: string | null
          current_topic_id: string | null
          dropped_at: string | null
          enrolled_at: string | null
          enrollment_source: string | null
          expires_at: string | null
          id: string
          notes: string | null
          payment_amount: number | null
          payment_id: string | null
          payment_type: string | null
          starts_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completion_percentage?: number | null
          course_id: string
          created_at?: string | null
          current_module_id?: string | null
          current_topic_id?: string | null
          dropped_at?: string | null
          enrolled_at?: string | null
          enrollment_source?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_id?: string | null
          payment_type?: string | null
          starts_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completion_percentage?: number | null
          course_id?: string
          created_at?: string | null
          current_module_id?: string | null
          current_topic_id?: string | null
          dropped_at?: string | null
          enrolled_at?: string | null
          enrollment_source?: string | null
          expires_at?: string | null
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_id?: string | null
          payment_type?: string | null
          starts_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "student_enrollments_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "module_unlock_requirements"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "student_enrollments_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "student_enrollments_current_topic_id_fkey"
            columns: ["current_topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "student_enrollments_current_topic_id_fkey"
            columns: ["current_topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "student_enrollments_current_topic_id_fkey"
            columns: ["current_topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "student_enrollments_current_topic_id_fkey"
            columns: ["current_topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_current_topic_id_fkey"
            columns: ["current_topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "student_enrollments_current_topic_id_fkey"
            columns: ["current_topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "student_enrollments_current_topic_id_fkey"
            columns: ["current_topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      student_progress: {
        Row: {
          completed_modules: string[]
          created_at: string
          current_module: string
          helpful_interactions: number
          id: string
          last_activity_at: string
          mastery_score: number
          struggle_areas: string[]
          student_id: string
          total_interactions: number
          updated_at: string
        }
        Insert: {
          completed_modules?: string[]
          created_at?: string
          current_module: string
          helpful_interactions?: number
          id?: string
          last_activity_at?: string
          mastery_score?: number
          struggle_areas?: string[]
          student_id: string
          total_interactions?: number
          updated_at?: string
        }
        Update: {
          completed_modules?: string[]
          created_at?: string
          current_module?: string
          helpful_interactions?: number
          id?: string
          last_activity_at?: string
          mastery_score?: number
          struggle_areas?: string[]
          student_id?: string
          total_interactions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      topic_completions: {
        Row: {
          completed_at: string
          completion_source: string | null
          course_id: string
          created_at: string | null
          enrollment_id: string
          id: string
          module_id: string
          notes: string | null
          time_spent_seconds: number | null
          topic_id: string
          updated_at: string | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          completed_at?: string
          completion_source?: string | null
          course_id: string
          created_at?: string | null
          enrollment_id: string
          id?: string
          module_id: string
          notes?: string | null
          time_spent_seconds?: number | null
          topic_id: string
          updated_at?: string | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          completed_at?: string
          completion_source?: string | null
          course_id?: string
          created_at?: string | null
          enrollment_id?: string
          id?: string
          module_id?: string
          notes?: string | null
          time_spent_seconds?: number | null
          topic_id?: string
          updated_at?: string | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "topic_completions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "topic_completions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_unlock_requirements"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "topic_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "topic_completions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_completions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_completions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_completions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_completions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_completions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      topic_lessons: {
        Row: {
          content_markdown: string | null
          content_type: string
          content_url: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          lab_environment_template: string | null
          lab_instructions_url: string | null
          lesson_number: number
          title: string
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          content_markdown?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          lab_environment_template?: string | null
          lab_instructions_url?: string | null
          lesson_number: number
          title: string
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          content_markdown?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          lab_environment_template?: string | null
          lab_instructions_url?: string | null
          lesson_number?: number
          title?: string
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "topic_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      trainer_responses: {
        Row: {
          created_at: string | null
          escalation_id: string
          id: string
          is_internal_note: boolean | null
          message: string
          trainer_id: string
        }
        Insert: {
          created_at?: string | null
          escalation_id: string
          id?: string
          is_internal_note?: boolean | null
          message: string
          trainer_id: string
        }
        Update: {
          created_at?: string | null
          escalation_id?: string
          id?: string
          is_internal_note?: boolean | null
          message?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_responses_escalation_id_fkey"
            columns: ["escalation_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_escalations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_responses_escalation_id_fkey"
            columns: ["escalation_id"]
            isOneToOne: false
            referencedRelation: "escalation_queue"
            referencedColumns: ["escalation_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_responses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      twin_preferences: {
        Row: {
          created_at: string | null
          enable_morning_briefing: boolean | null
          enable_proactive_suggestions: boolean | null
          id: string
          morning_briefing_time: string | null
          notify_via_email: boolean | null
          notify_via_slack: boolean | null
          notify_via_ui: boolean | null
          suggestion_frequency: number | null
          updated_at: string | null
          use_activity_data: boolean | null
          use_productivity_data: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          enable_morning_briefing?: boolean | null
          enable_proactive_suggestions?: boolean | null
          id?: string
          morning_briefing_time?: string | null
          notify_via_email?: boolean | null
          notify_via_slack?: boolean | null
          notify_via_ui?: boolean | null
          suggestion_frequency?: number | null
          updated_at?: string | null
          use_activity_data?: boolean | null
          use_productivity_data?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          enable_morning_briefing?: boolean | null
          enable_proactive_suggestions?: boolean | null
          id?: string
          morning_briefing_time?: string | null
          notify_via_email?: boolean | null
          notify_via_slack?: boolean | null
          notify_via_ui?: boolean | null
          suggestion_frequency?: number | null
          updated_at?: string | null
          use_activity_data?: boolean | null
          use_productivity_data?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "twin_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          is_new: boolean | null
          progress_value: number | null
          share_count: number | null
          shared_at: string | null
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          is_new?: boolean | null
          progress_value?: number | null
          share_count?: number | null
          shared_at?: string | null
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          is_new?: boolean | null
          progress_value?: number | null
          share_count?: number | null
          shared_at?: string | null
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_completion_stats"
            referencedColumns: ["badge_id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "rare_achievements"
            referencedColumns: ["badge_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          candidate_availability: string | null
          candidate_bench_start_date: string | null
          candidate_current_visa: string | null
          candidate_experience_years: number | null
          candidate_hourly_rate: number | null
          candidate_location: string | null
          candidate_resume_url: string | null
          candidate_skills: string[] | null
          candidate_status: string | null
          candidate_visa_expiry: string | null
          candidate_willing_to_relocate: boolean | null
          client_company_name: string | null
          client_contract_end_date: string | null
          client_contract_start_date: string | null
          client_industry: string | null
          client_payment_terms: number | null
          client_preferred_markup_percentage: number | null
          client_tier: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string
          employee_department: string | null
          employee_hire_date: string | null
          employee_manager_id: string | null
          employee_performance_rating: number | null
          employee_position: string | null
          employee_salary: number | null
          employee_status: string | null
          full_name: string
          id: string
          is_active: boolean | null
          leaderboard_visible: boolean | null
          locale: string | null
          org_id: string
          phone: string | null
          recruiter_monthly_placement_target: number | null
          recruiter_pod_id: string | null
          recruiter_specialization: string[] | null
          recruiter_territory: string | null
          search_vector: unknown
          student_certificates: Json | null
          student_course_id: string | null
          student_course_progress: Json | null
          student_current_module: string | null
          student_enrollment_date: string | null
          student_graduation_date: string | null
          timezone: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          candidate_availability?: string | null
          candidate_bench_start_date?: string | null
          candidate_current_visa?: string | null
          candidate_experience_years?: number | null
          candidate_hourly_rate?: number | null
          candidate_location?: string | null
          candidate_resume_url?: string | null
          candidate_skills?: string[] | null
          candidate_status?: string | null
          candidate_visa_expiry?: string | null
          candidate_willing_to_relocate?: boolean | null
          client_company_name?: string | null
          client_contract_end_date?: string | null
          client_contract_start_date?: string | null
          client_industry?: string | null
          client_payment_terms?: number | null
          client_preferred_markup_percentage?: number | null
          client_tier?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email: string
          employee_department?: string | null
          employee_hire_date?: string | null
          employee_manager_id?: string | null
          employee_performance_rating?: number | null
          employee_position?: string | null
          employee_salary?: number | null
          employee_status?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          leaderboard_visible?: boolean | null
          locale?: string | null
          org_id: string
          phone?: string | null
          recruiter_monthly_placement_target?: number | null
          recruiter_pod_id?: string | null
          recruiter_specialization?: string[] | null
          recruiter_territory?: string | null
          search_vector?: unknown
          student_certificates?: Json | null
          student_course_id?: string | null
          student_course_progress?: Json | null
          student_current_module?: string | null
          student_enrollment_date?: string | null
          student_graduation_date?: string | null
          timezone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          candidate_availability?: string | null
          candidate_bench_start_date?: string | null
          candidate_current_visa?: string | null
          candidate_experience_years?: number | null
          candidate_hourly_rate?: number | null
          candidate_location?: string | null
          candidate_resume_url?: string | null
          candidate_skills?: string[] | null
          candidate_status?: string | null
          candidate_visa_expiry?: string | null
          candidate_willing_to_relocate?: boolean | null
          client_company_name?: string | null
          client_contract_end_date?: string | null
          client_contract_start_date?: string | null
          client_industry?: string | null
          client_payment_terms?: number | null
          client_preferred_markup_percentage?: number | null
          client_tier?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string
          employee_department?: string | null
          employee_hire_date?: string | null
          employee_manager_id?: string | null
          employee_performance_rating?: number | null
          employee_position?: string | null
          employee_salary?: number | null
          employee_status?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          leaderboard_visible?: boolean | null
          locale?: string | null
          org_id?: string
          phone?: string | null
          recruiter_monthly_placement_target?: number | null
          recruiter_pod_id?: string | null
          recruiter_specialization?: string[] | null
          recruiter_territory?: string | null
          search_vector?: unknown
          student_certificates?: Json | null
          student_course_id?: string | null
          student_course_progress?: Json | null
          student_current_module?: string | null
          student_enrollment_date?: string | null
          student_graduation_date?: string | null
          timezone?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "v_organization_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          deleted_at: string | null
          expires_at: string | null
          is_primary: boolean | null
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          is_primary?: boolean | null
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          deleted_at?: string | null
          expires_at?: string | null
          is_primary?: boolean | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_roles_with_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      video_progress: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          enrollment_id: string
          id: string
          last_position_seconds: number
          last_watched_at: string | null
          session_count: number
          topic_id: string
          total_watch_time_seconds: number
          updated_at: string | null
          user_id: string
          video_duration_seconds: number | null
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          last_position_seconds?: number
          last_watched_at?: string | null
          session_count?: number
          topic_id: string
          total_watch_time_seconds?: number
          updated_at?: string | null
          user_id: string
          video_duration_seconds?: number | null
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          last_position_seconds?: number
          last_watched_at?: string | null
          session_count?: number
          topic_id?: string
          total_watch_time_seconds?: number
          updated_at?: string | null
          user_id?: string
          video_duration_seconds?: number | null
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          amount: number
          awarded_at: string
          awarded_by: string | null
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          awarded_at?: string
          awarded_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          awarded_at?: string
          awarded_by?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      ai_foundation_validation: {
        Row: {
          component: string | null
          status: string | null
        }
        Relationships: []
      }
      ai_mentor_cost_breakdown: {
        Row: {
          avg_cost_per_chat: number | null
          chat_count: number | null
          cost_per_1k_tokens: number | null
          cost_per_helpful_response: number | null
          date: string | null
          topic_id: string | null
          topic_title: string | null
          total_cost: number | null
          total_tokens: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_chats_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      ai_mentor_daily_stats: {
        Row: {
          avg_rating: number | null
          avg_response_time_ms: number | null
          date: string | null
          escalated_count: number | null
          flagged_count: number | null
          total_chats: number | null
          total_cost: number | null
          total_tokens: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      ai_mentor_hourly_stats: {
        Row: {
          avg_rating: number | null
          avg_response_time_ms: number | null
          escalated_count: number | null
          flagged_count: number | null
          hour: string | null
          negative_ratings: number | null
          positive_ratings: number | null
          total_chats: number | null
          total_cost: number | null
          total_tokens: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      ai_mentor_student_engagement: {
        Row: {
          active_days: number | null
          avg_rating_given: number | null
          escalations: number | null
          first_chat_date: string | null
          full_name: string | null
          last_chat_date: string | null
          rating_frequency: number | null
          topics_explored: number | null
          total_chats: number | null
          total_cost_incurred: number | null
          user_id: string | null
        }
        Relationships: []
      }
      ai_mentor_student_stats: {
        Row: {
          avg_rating: number | null
          avg_response_time_ms: number | null
          email: string | null
          escalated_count: number | null
          flagged_count: number | null
          full_name: string | null
          last_chat_at: string | null
          total_chats: number | null
          total_cost: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Relationships: []
      }
      ai_mentor_topic_quality: {
        Row: {
          avg_rating: number | null
          avg_response_time_ms: number | null
          avg_tokens_used: number | null
          course_title: string | null
          escalation_rate: number | null
          flagged_count: number | null
          helpful_percentage: number | null
          topic_id: string | null
          topic_title: string | null
          total_chats: number | null
          total_cost: number | null
          unhelpful_percentage: number | null
          unique_students: number | null
        }
        Relationships: []
      }
      ai_mentor_topic_stats: {
        Row: {
          avg_rating: number | null
          course_title: string | null
          escalation_count: number | null
          topic_id: string | null
          topic_title: string | null
          total_chats: number | null
          unique_students: number | null
        }
        Relationships: []
      }
      ai_prompt_variant_performance: {
        Row: {
          avg_cost_per_chat: number | null
          avg_rating: number | null
          avg_response_time_ms: number | null
          avg_tokens_used: number | null
          created_at: string | null
          escalation_rate: number | null
          flagged_count: number | null
          helpful_percentage: number | null
          is_active: boolean | null
          total_uses: number | null
          traffic_percentage: number | null
          unique_users: number | null
          variant_id: string | null
          variant_name: string | null
        }
        Relationships: []
      }
      badge_completion_stats: {
        Row: {
          badge_id: string | null
          badge_name: string | null
          completion_percentage: number | null
          first_earned_at: string | null
          last_earned_at: string | null
          rarity: string | null
          total_earned: number | null
          total_shares: number | null
          trigger_type: string | null
          unique_earners: number | null
        }
        Relationships: []
      }
      badge_leaderboard: {
        Row: {
          avatar_url: string | null
          badge_count: number | null
          badge_xp_earned: number | null
          full_name: string | null
          rarity_score: number | null
          recent_badges: Json | null
          user_id: string | null
        }
        Relationships: []
      }
      capstone_grading_queue: {
        Row: {
          avg_peer_rating: number | null
          course_id: string | null
          course_title: string | null
          demo_video_url: string | null
          description: string | null
          enrollment_id: string | null
          hours_waiting: number | null
          id: string | null
          peer_review_count: number | null
          repository_url: string | null
          revision_count: number | null
          status: string | null
          student_email: string | null
          student_name: string | null
          submitted_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capstone_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "capstone_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      capstone_statistics: {
        Row: {
          avg_grade: number | null
          avg_peer_reviews: number | null
          avg_revisions: number | null
          course_id: string | null
          course_title: string | null
          failed_count: number | null
          passed_count: number | null
          revision_count: number | null
          total_submissions: number | null
        }
        Relationships: [
          {
            foreignKeyName: "capstone_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capstone_submissions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      escalation_daily_stats: {
        Row: {
          auto_detected_count: number | null
          avg_confidence: number | null
          avg_resolution_time_minutes: number | null
          date: string | null
          dismissed_count: number | null
          manual_count: number | null
          resolved_count: number | null
          total_escalations: number | null
          unique_students: number | null
        }
        Relationships: []
      }
      escalation_queue: {
        Row: {
          assigned_to: string | null
          assigned_trainer_name: string | null
          auto_detected: boolean | null
          chat_id: string | null
          confidence: number | null
          created_at: string | null
          escalation_id: string | null
          metadata: Json | null
          original_question: string | null
          reason: string | null
          response_count: number | null
          status: string | null
          student_email: string | null
          student_name: string | null
          topic_id: string | null
          topic_title: string | null
          triggers: Json | null
          user_id: string | null
          wait_time_minutes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_mentor_escalations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      grading_queue: {
        Row: {
          attempt_number: number | null
          auto_grade_score: number | null
          commit_sha: string | null
          course_title: string | null
          enrollment_id: string | null
          module_title: string | null
          repository_url: string | null
          status: string | null
          student_email: string | null
          student_name: string | null
          submission_id: string | null
          submitted_at: string | null
          topic_id: string | null
          topic_title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_submissions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lab_statistics: {
        Row: {
          avg_final_score: number | null
          avg_time_spent_seconds: number | null
          lab_title: string | null
          topic_id: string | null
          total_failed: number | null
          total_passed: number | null
          total_students_started: number | null
          total_students_submitted: number | null
        }
        Relationships: []
      }
      leaderboard_all_time: {
        Row: {
          avatar_url: string | null
          avg_xp_per_day: number | null
          badge_count: number | null
          courses_completed: number | null
          days_active: number | null
          full_name: string | null
          joined_at: string | null
          level: number | null
          level_name: string | null
          rank: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: []
      }
      leaderboard_by_cohort: {
        Row: {
          avatar_url: string | null
          cohort_month: string | null
          cohort_name: string | null
          cohort_percentile: number | null
          cohort_size: number | null
          completion_percentage: number | null
          course_id: string | null
          course_title: string | null
          enrolled_at: string | null
          full_name: string | null
          rank: number | null
          total_xp: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      leaderboard_by_course: {
        Row: {
          avatar_url: string | null
          completion_percentage: number | null
          course_id: string | null
          course_title: string | null
          course_xp: number | null
          full_name: string | null
          modules_completed: number | null
          percentile: number | null
          rank: number | null
          total_modules: number | null
          total_students: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      leaderboard_global: {
        Row: {
          avatar_url: string | null
          dense_rank: number | null
          full_name: string | null
          level: number | null
          level_name: string | null
          rank: number | null
          total_xp: number | null
          user_id: string | null
          xp_diff_from_above: number | null
          xp_to_next_rank: number | null
        }
        Relationships: []
      }
      leaderboard_weekly: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          is_current_week: boolean | null
          participants: number | null
          rank: number | null
          user_id: string | null
          week_label: string | null
          week_start: string | null
          weekly_xp: number | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      module_unlock_requirements: {
        Row: {
          course_id: string | null
          module_id: string | null
          module_number: number | null
          module_title: string | null
          prerequisite_module_ids: string[] | null
          prerequisite_numbers: number[] | null
          prerequisite_titles: string[] | null
        }
        Insert: {
          course_id?: string | null
          module_id?: string | null
          module_number?: number | null
          module_title?: string | null
          prerequisite_module_ids?: string[] | null
          prerequisite_numbers?: never
          prerequisite_titles?: never
        }
        Update: {
          course_id?: string | null
          module_id?: string | null
          module_number?: number | null
          module_title?: string | null
          prerequisite_module_ids?: string[] | null
          prerequisite_numbers?: never
          prerequisite_titles?: never
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["course_id"]
          },
        ]
      }
      peer_review_leaderboard: {
        Row: {
          avg_rating_given: number | null
          courses_reviewed: number | null
          reviewer_id: string | null
          reviewer_name: string | null
          reviews_completed: number | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      question_bank_stats: {
        Row: {
          avg_correct_percentage: number | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          difficulty: string | null
          is_public: boolean | null
          points: number | null
          question_id: string | null
          question_text: string | null
          question_type: string | null
          times_used: number | null
          topic_id: string | null
          unique_students: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "quiz_questions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
        ]
      }
      quiz_analytics: {
        Row: {
          avg_score: number | null
          avg_time_seconds: number | null
          course_id: string | null
          course_title: string | null
          easy_questions: number | null
          hard_questions: number | null
          medium_questions: number | null
          module_id: string | null
          module_title: string | null
          pass_rate: number | null
          passed_attempts: number | null
          topic_id: string | null
          topic_title: string | null
          total_attempts: number | null
          total_questions: number | null
          unique_students: number | null
        }
        Relationships: []
      }
      rare_achievements: {
        Row: {
          badge_id: string | null
          badge_name: string | null
          earner_count: number | null
          earner_percentage: number | null
          rarity: string | null
        }
        Relationships: []
      }
      reading_stats: {
        Row: {
          content_type: string | null
          course_title: string | null
          current_page: number | null
          engagement_score: number | null
          enrollment_id: string | null
          last_read_at: string | null
          module_title: string | null
          scroll_percentage: number | null
          session_count: number | null
          topic_id: string | null
          topic_title: string | null
          total_pages: number | null
          total_reading_time_seconds: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      topic_difficulty_stats: {
        Row: {
          avg_escalation_confidence: number | null
          course_title: string | null
          escalation_count: number | null
          module_title: string | null
          resolved_count: number | null
          topic_id: string | null
          topic_title: string | null
          unique_students: number | null
        }
        Relationships: []
      }
      topic_unlock_requirements: {
        Row: {
          module_id: string | null
          prerequisite_numbers: number[] | null
          prerequisite_titles: string[] | null
          prerequisite_topic_ids: string[] | null
          topic_id: string | null
          topic_number: number | null
          topic_title: string | null
        }
        Insert: {
          module_id?: string | null
          prerequisite_numbers?: never
          prerequisite_titles?: never
          prerequisite_topic_ids?: string[] | null
          topic_id?: string | null
          topic_number?: number | null
          topic_title?: string | null
        }
        Update: {
          module_id?: string | null
          prerequisite_numbers?: never
          prerequisite_titles?: never
          prerequisite_topic_ids?: string[] | null
          topic_id?: string | null
          topic_number?: number | null
          topic_title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "module_unlock_requirements"
            referencedColumns: ["module_id"]
          },
          {
            foreignKeyName: "module_topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["module_id"]
          },
        ]
      }
      trainer_escalation_stats: {
        Row: {
          avg_resolution_time_minutes: number | null
          dismissed_count: number | null
          last_resolution_at: string | null
          resolved_count: number | null
          total_assigned: number | null
          total_responses: number | null
          trainer_id: string | null
          trainer_name: string | null
        }
        Relationships: []
      }
      user_badge_progress: {
        Row: {
          common_badges: number | null
          completion_percentage: number | null
          epic_badges: number | null
          full_name: string | null
          last_badge_earned_at: string | null
          legendary_badges: number | null
          new_badges_count: number | null
          rare_badges: number | null
          total_badges_available: number | null
          total_badges_earned: number | null
          user_id: string | null
        }
        Relationships: []
      }
      user_xp_totals: {
        Row: {
          last_xp_earned_at: string | null
          leaderboard_rank: number | null
          total_xp: number | null
          transaction_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_active_users: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          candidate_availability: string | null
          candidate_bench_start_date: string | null
          candidate_current_visa: string | null
          candidate_experience_years: number | null
          candidate_hourly_rate: number | null
          candidate_location: string | null
          candidate_resume_url: string | null
          candidate_skills: string[] | null
          candidate_status: string | null
          candidate_visa_expiry: string | null
          candidate_willing_to_relocate: boolean | null
          client_company_name: string | null
          client_contract_end_date: string | null
          client_contract_start_date: string | null
          client_industry: string | null
          client_payment_terms: number | null
          client_preferred_markup_percentage: number | null
          client_tier: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          email: string | null
          employee_department: string | null
          employee_hire_date: string | null
          employee_manager_id: string | null
          employee_performance_rating: number | null
          employee_position: string | null
          employee_salary: number | null
          employee_status: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          locale: string | null
          phone: string | null
          recruiter_monthly_placement_target: number | null
          recruiter_pod_id: string | null
          recruiter_specialization: string[] | null
          recruiter_territory: string | null
          search_vector: unknown
          student_certificates: Json | null
          student_course_id: string | null
          student_course_progress: Json | null
          student_current_module: string | null
          student_enrollment_date: string | null
          student_graduation_date: string | null
          timezone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          candidate_availability?: string | null
          candidate_bench_start_date?: string | null
          candidate_current_visa?: string | null
          candidate_experience_years?: number | null
          candidate_hourly_rate?: number | null
          candidate_location?: string | null
          candidate_resume_url?: string | null
          candidate_skills?: string[] | null
          candidate_status?: string | null
          candidate_visa_expiry?: string | null
          candidate_willing_to_relocate?: boolean | null
          client_company_name?: string | null
          client_contract_end_date?: string | null
          client_contract_start_date?: string | null
          client_industry?: string | null
          client_payment_terms?: number | null
          client_preferred_markup_percentage?: number | null
          client_tier?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          employee_department?: string | null
          employee_hire_date?: string | null
          employee_manager_id?: string | null
          employee_performance_rating?: number | null
          employee_position?: string | null
          employee_salary?: number | null
          employee_status?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          locale?: string | null
          phone?: string | null
          recruiter_monthly_placement_target?: number | null
          recruiter_pod_id?: string | null
          recruiter_specialization?: string[] | null
          recruiter_territory?: string | null
          search_vector?: unknown
          student_certificates?: Json | null
          student_course_id?: string | null
          student_course_progress?: Json | null
          student_current_module?: string | null
          student_enrollment_date?: string | null
          student_graduation_date?: string | null
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          candidate_availability?: string | null
          candidate_bench_start_date?: string | null
          candidate_current_visa?: string | null
          candidate_experience_years?: number | null
          candidate_hourly_rate?: number | null
          candidate_location?: string | null
          candidate_resume_url?: string | null
          candidate_skills?: string[] | null
          candidate_status?: string | null
          candidate_visa_expiry?: string | null
          candidate_willing_to_relocate?: boolean | null
          client_company_name?: string | null
          client_contract_end_date?: string | null
          client_contract_start_date?: string | null
          client_industry?: string | null
          client_payment_terms?: number | null
          client_preferred_markup_percentage?: number | null
          client_tier?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          employee_department?: string | null
          employee_hire_date?: string | null
          employee_manager_id?: string | null
          employee_performance_rating?: number | null
          employee_position?: string | null
          employee_salary?: number | null
          employee_status?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          locale?: string | null
          phone?: string | null
          recruiter_monthly_placement_target?: number | null
          recruiter_pod_id?: string | null
          recruiter_specialization?: string[] | null
          recruiter_territory?: string | null
          search_vector?: unknown
          student_certificates?: Json | null
          student_course_id?: string | null
          student_course_progress?: Json | null
          student_current_module?: string | null
          student_enrollment_date?: string | null
          student_graduation_date?: string | null
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      v_agent_framework_status: {
        Row: {
          active_agents_7d: number | null
          active_prompts: number | null
          cost_24h_usd: number | null
          cost_30d_usd: number | null
          cost_entries_24h: number | null
          failures_24h: number | null
          interactions_24h: number | null
          unique_templates: number | null
        }
        Relationships: []
      }
      v_audit_logs_critical: {
        Row: {
          action: string | null
          created_at: string | null
          id: string | null
          metadata: Json | null
          record_id: string | null
          table_name: string | null
          user_email: string | null
          user_name: string | null
        }
        Relationships: []
      }
      v_audit_logs_recent: {
        Row: {
          action: string | null
          changed_fields: string[] | null
          created_at: string | null
          id: string | null
          severity: string | null
          table_name: string | null
          user_email: string | null
          user_name: string | null
        }
        Relationships: []
      }
      v_bench_candidates: {
        Row: {
          candidate_availability: string | null
          candidate_bench_start_date: string | null
          candidate_current_visa: string | null
          candidate_experience_years: number | null
          candidate_hourly_rate: number | null
          candidate_location: string | null
          candidate_skills: string[] | null
          email: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          candidate_availability?: string | null
          candidate_bench_start_date?: string | null
          candidate_current_visa?: string | null
          candidate_experience_years?: number | null
          candidate_hourly_rate?: number | null
          candidate_location?: string | null
          candidate_skills?: string[] | null
          email?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          candidate_availability?: string | null
          candidate_bench_start_date?: string | null
          candidate_current_visa?: string | null
          candidate_experience_years?: number | null
          candidate_hourly_rate?: number | null
          candidate_location?: string | null
          candidate_skills?: string[] | null
          email?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
      v_clients: {
        Row: {
          client_company_name: string | null
          client_contract_end_date: string | null
          client_contract_start_date: string | null
          client_industry: string | null
          client_payment_terms: number | null
          client_tier: string | null
          contact_name: string | null
          email: string | null
          id: string | null
        }
        Insert: {
          client_company_name?: string | null
          client_contract_end_date?: string | null
          client_contract_start_date?: string | null
          client_industry?: string | null
          client_payment_terms?: number | null
          client_tier?: string | null
          contact_name?: string | null
          email?: string | null
          id?: string | null
        }
        Update: {
          client_company_name?: string | null
          client_contract_end_date?: string | null
          client_contract_start_date?: string | null
          client_industry?: string | null
          client_payment_terms?: number | null
          client_tier?: string | null
          contact_name?: string | null
          email?: string | null
          id?: string | null
        }
        Relationships: []
      }
      v_employees: {
        Row: {
          email: string | null
          employee_department: string | null
          employee_hire_date: string | null
          employee_manager_id: string | null
          employee_position: string | null
          employee_status: string | null
          full_name: string | null
          id: string | null
        }
        Insert: {
          email?: string | null
          employee_department?: string | null
          employee_hire_date?: string | null
          employee_manager_id?: string | null
          employee_position?: string | null
          employee_status?: string | null
          full_name?: string | null
          id?: string | null
        }
        Update: {
          email?: string | null
          employee_department?: string | null
          employee_hire_date?: string | null
          employee_manager_id?: string | null
          employee_position?: string | null
          employee_status?: string | null
          full_name?: string | null
          id?: string | null
        }
        Relationships: []
      }
      v_event_stats_by_type: {
        Row: {
          avg_processing_time_seconds: number | null
          completed: number | null
          dead_letter: number | null
          event_type: string | null
          failed: number | null
          last_event_at: string | null
          total_events: number | null
        }
        Relationships: []
      }
      v_events_failed: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_type: string | null
          failed_at: string | null
          id: string | null
          max_retries: number | null
          next_retry_at: string | null
          retry_count: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          failed_at?: string | null
          id?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          retry_count?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_type?: string | null
          failed_at?: string | null
          id?: string | null
          max_retries?: number | null
          next_retry_at?: string | null
          retry_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
      v_events_recent: {
        Row: {
          created_at: string | null
          event_category: string | null
          event_type: string | null
          id: string | null
          payload: Json | null
          status: string | null
          triggered_by: string | null
          user_email: string | null
        }
        Relationships: []
      }
      v_multi_tenancy_status: {
        Row: {
          active_orgs: number | null
          soft_deleted_orgs: number | null
          table_name: string | null
          total_records: number | null
          unique_orgs: number | null
        }
        Relationships: []
      }
      v_organization_stats: {
        Row: {
          available_user_slots: number | null
          created_at: string | null
          current_candidates: number | null
          current_users: number | null
          id: string | null
          max_candidates: number | null
          max_users: number | null
          name: string | null
          slug: string | null
          status: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_rls_policies: {
        Row: {
          cmd: string | null
          permissive: string | null
          policyname: unknown
          qual: string | null
          roles: unknown[] | null
          schemaname: unknown
          tablename: unknown
          with_check: string | null
        }
        Relationships: []
      }
      v_rls_status: {
        Row: {
          rls_enabled: boolean | null
          schemaname: unknown
          tablename: unknown
        }
        Relationships: []
      }
      v_roles_with_permissions: {
        Row: {
          description: string | null
          display_name: string | null
          hierarchy_level: number | null
          id: string | null
          name: string | null
          permission_count: number | null
          user_count: number | null
        }
        Relationships: []
      }
      v_session_summary: {
        Row: {
          all_tags: string[] | null
          branch: string | null
          commands_executed: number | null
          commit_hash: string | null
          created_at: string | null
          duration: string | null
          ended_at: string | null
          environment: string | null
          files_modified: number | null
          id: string | null
          lines_added: number | null
          lines_removed: number | null
          overall_goal: string | null
          session_id: string | null
          started_at: string | null
          successfully_completed: boolean | null
          timeline_entries: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_sprint_5_status: {
        Row: {
          avg_quality: number | null
          placements: number | null
          table_name: string | null
          total_records: number | null
          unique_orgs: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_students: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          student_course_progress: Json | null
          student_current_module: string | null
          student_enrollment_date: string | null
          student_graduation_date: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          student_course_progress?: Json | null
          student_current_module?: string | null
          student_enrollment_date?: string | null
          student_graduation_date?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          student_course_progress?: Json | null
          student_current_module?: string | null
          student_enrollment_date?: string | null
          student_graduation_date?: string | null
        }
        Relationships: []
      }
      v_subscriber_performance: {
        Row: {
          avg_duration_ms: number | null
          event_pattern: string | null
          failed: number | null
          last_delivery_at: string | null
          subscriber_name: string | null
          successful: number | null
          total_deliveries: number | null
        }
        Relationships: []
      }
      v_timeline_recent: {
        Row: {
          actions_taken: Json | null
          agent_model: string | null
          agent_type: string | null
          ai_generated_summary: string | null
          assumptions: Json | null
          conversation_summary: string | null
          created_at: string | null
          decisions: Json | null
          deleted_at: string | null
          duration: string | null
          files_changed: Json | null
          future_notes: Json | null
          id: string | null
          is_archived: boolean | null
          key_learnings: string[] | null
          related_commits: string[] | null
          related_docs: string[] | null
          related_prs: string[] | null
          results: Json | null
          search_vector: unknown
          session_branch: string | null
          session_date: string | null
          session_ended_at: string | null
          session_id: string | null
          session_started_at: string | null
          successfully_completed: boolean | null
          tags: string[] | null
          updated_at: string | null
          user_intent: string | null
        }
        Relationships: []
      }
      v_timeline_stats_by_tag: {
        Row: {
          entry_count: number | null
          first_occurrence: string | null
          last_occurrence: string | null
          session_count: number | null
          tag: string | null
        }
        Relationships: []
      }
      v_user_activity_summary: {
        Row: {
          deletes: number | null
          inserts: number | null
          last_activity: string | null
          total_actions: number | null
          updates: number | null
          user_email: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_user_roles_detailed: {
        Row: {
          assigned_at: string | null
          email: string | null
          expires_at: string | null
          full_name: string | null
          is_primary: boolean | null
          role_display_name: string | null
          role_name: string | null
          role_status: string | null
          user_id: string | null
        }
        Relationships: []
      }
      video_watch_stats: {
        Row: {
          completion_percentage: number | null
          course_title: string | null
          engagement_score: number | null
          enrollment_id: string | null
          last_watched_at: string | null
          module_title: string | null
          session_count: number | null
          topic_id: string | null
          topic_title: string | null
          total_watch_time_seconds: number | null
          user_id: string | null
          video_duration_seconds: number | null
          video_provider: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_quality"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_topic_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "lab_statistics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "module_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "quiz_analytics"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_difficulty_stats"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topic_unlock_requirements"
            referencedColumns: ["topic_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_engagement"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_student_stats"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "badge_leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_all_time"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_cohort"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_by_course"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_global"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "trainer_escalation_stats"
            referencedColumns: ["trainer_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_badge_progress"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_active_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_bench_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_roles_detailed"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      activate_prompt_variant: {
        Args: { p_traffic_percentage: number; p_variant_id: string }
        Returns: undefined
      }
      add_trainer_response: {
        Args: {
          p_escalation_id: string
          p_is_internal_note?: boolean
          p_message: string
          p_trainer_id: string
        }
        Returns: string
      }
      admin_disable_handler: {
        Args: { p_handler_id: string; p_reason?: string }
        Returns: boolean
      }
      admin_enable_handler: { Args: { p_handler_id: string }; Returns: boolean }
      admin_get_event_stats: { Args: { p_org_id?: string }; Returns: Json }
      admin_get_handler_stats: { Args: { p_org_id?: string }; Returns: Json }
      admin_replay_events: {
        Args: { p_event_ids: string[] }
        Returns: {
          aggregate_id: string | null
          created_at: string
          error_message: string | null
          event_category: string
          event_type: string
          event_version: number | null
          failed_at: string | null
          id: string
          max_retries: number | null
          metadata: Json | null
          next_retry_at: string | null
          org_id: string
          payload: Json
          processed_at: string | null
          retry_count: number | null
          status: string | null
          user_email: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      assign_escalation: {
        Args: { p_escalation_id: string; p_trainer_id: string }
        Returns: undefined
      }
      auth_user_id: { Args: never; Returns: string }
      auth_user_org_id: { Args: never; Returns: string }
      auto_assign_escalation: {
        Args: { p_escalation_id: string }
        Returns: string
      }
      auto_create_next_audit_partition: { Args: never; Returns: undefined }
      award_badge_manual: {
        Args: { p_badge_slug: string; p_user_id: string }
        Returns: string
      }
      bulk_import_quiz_questions: {
        Args: { p_created_by?: string; p_questions: Json; p_topic_id: string }
        Returns: {
          errors: Json
          imported_count: number
          success: boolean
        }[]
      }
      bypass_prerequisites_for_role: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      calculate_matching_accuracy: {
        Args: { p_org_id: string; p_start_date?: string }
        Returns: {
          accuracy: number
          avg_match_score: number
          match_precision: number
          relevant_matches: number
          total_matches: number
        }[]
      }
      check_and_award_badge: {
        Args: {
          p_current_value: number
          p_trigger_type: string
          p_user_id: string
        }
        Returns: {
          badge_id: string
          badge_name: string
          newly_earned: boolean
          xp_reward: number
        }[]
      }
      check_course_prerequisites: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: boolean
      }
      check_enrollment_prerequisites: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: boolean
      }
      check_graduation_eligibility: {
        Args: { p_enrollment_id: string }
        Returns: boolean
      }
      check_module_prerequisites: {
        Args: { p_module_id: string; p_user_id: string }
        Returns: boolean
      }
      check_rate_limits: { Args: { p_user_id: string }; Returns: Json }
      cleanup_old_audit_partitions: {
        Args: never
        Returns: {
          action: string
          partition_name: string
        }[]
      }
      cleanup_old_screenshots: { Args: never; Returns: number }
      cleanup_old_twin_interactions: { Args: never; Returns: undefined }
      complete_topic: {
        Args: {
          p_enrollment_id: string
          p_time_spent_seconds?: number
          p_topic_id: string
          p_user_id: string
        }
        Returns: string
      }
      create_audit_log_partition: {
        Args: { partition_date: string }
        Returns: undefined
      }
      create_escalation: {
        Args: {
          p_auto_detected?: boolean
          p_chat_id: string
          p_confidence?: number
          p_metadata?: Json
          p_reason: string
          p_topic_id: string
          p_triggers?: Json
          p_user_id: string
        }
        Returns: string
      }
      create_prompt_variant: {
        Args: {
          p_system_prompt: string
          p_traffic_percentage?: number
          p_variant_name: string
        }
        Returns: string
      }
      create_quiz_question: {
        Args: {
          p_code_language?: string
          p_correct_answers: Json
          p_created_by?: string
          p_difficulty?: string
          p_explanation?: string
          p_is_public?: boolean
          p_options: Json
          p_points?: number
          p_question_text: string
          p_question_type: string
          p_topic_id: string
        }
        Returns: string
      }
      deactivate_prompt_variant: {
        Args: { p_variant_id: string }
        Returns: undefined
      }
      delete_quiz_question: {
        Args: { p_question_id: string }
        Returns: boolean
      }
      disable_event_handler: {
        Args: { p_handler_name: string }
        Returns: boolean
      }
      dismiss_escalation: {
        Args: {
          p_dismissal_reason: string
          p_escalation_id: string
          p_trainer_id: string
        }
        Returns: undefined
      }
      enable_event_handler: {
        Args: { p_handler_name: string }
        Returns: boolean
      }
      enroll_student: {
        Args: {
          p_course_id: string
          p_expires_at?: string
          p_payment_amount: number
          p_payment_id: string
          p_payment_type: string
          p_starts_at?: string
          p_user_id: string
        }
        Returns: string
      }
      escalate_ai_chat: {
        Args: { p_chat_id: string; p_reason: string; p_user_id: string }
        Returns: undefined
      }
      expire_old_lab_instances: { Args: never; Returns: number }
      get_active_lab_instance: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: {
          expires_at: string
          forked_repo_url: string
          instance_id: string
          started_at: string
          status: string
          time_remaining_seconds: number
        }[]
      }
      get_ai_chat_history: {
        Args: { p_limit?: number; p_session_id: string; p_user_id: string }
        Returns: {
          conversation_context: Json
          cost_usd: number
          created_at: string
          id: string
          question: string
          response: string
          response_time_ms: number
          student_rating: number
          tokens_used: number
        }[]
      }
      get_asset_storage_path: { Args: { p_asset_id: string }; Returns: string }
      get_badge_leaderboard_top: {
        Args: { p_limit?: number }
        Returns: {
          avatar_url: string
          badge_count: number
          badge_xp_earned: number
          full_name: string
          rarity_score: number
          user_id: string
        }[]
      }
      get_badge_progress: {
        Args: { p_user_id: string }
        Returns: {
          badge_id: string
          current_value: number
          description: string
          icon_url: string
          name: string
          percentage: number
          rarity: string
          slug: string
          target_value: number
          trigger_type: string
        }[]
      }
      get_best_quiz_score: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: {
          best_attempt_id: string
          best_score: number
          passed_attempts: number
          total_attempts: number
        }[]
      }
      get_capstone_submissions: {
        Args: {
          p_course_id?: string
          p_limit?: number
          p_offset?: number
          p_status?: string
          p_user_id?: string
        }
        Returns: {
          avg_peer_rating: number
          course_id: string
          course_title: string
          demo_video_url: string
          description: string
          enrollment_id: string
          feedback: string
          grade: number
          graded_at: string
          graded_by: string
          grader_name: string
          id: string
          peer_review_count: number
          repository_url: string
          revision_count: number
          rubric_scores: Json
          status: string
          student_email: string
          student_name: string
          submitted_at: string
          user_id: string
        }[]
      }
      get_course_enrollment_analytics: {
        Args: { p_course_id: string }
        Returns: {
          active_enrollments: number
          avg_completion_percentage: number
          avg_time_to_complete_days: number
          completed_enrollments: number
          total_enrollments: number
        }[]
      }
      get_course_reading_stats: {
        Args: { p_course_id: string }
        Returns: {
          avg_scroll_percentage: number
          topic_id: string
          topic_title: string
          total_readers: number
          total_reading_time_hours: number
        }[]
      }
      get_course_storage_usage: {
        Args: { p_course_id: string }
        Returns: {
          document_bytes: number
          document_count: number
          file_count: number
          total_bytes: number
          video_bytes: number
          video_count: number
        }[]
      }
      get_course_watch_stats: {
        Args: { p_course_id: string }
        Returns: {
          avg_completion_percentage: number
          topic_id: string
          topic_title: string
          total_viewers: number
          total_watch_time_hours: number
        }[]
      }
      get_current_traffic_allocation: {
        Args: never
        Returns: {
          total_allocated: number
          traffic_percentage: number
          variant_id: string
          variant_name: string
        }[]
      }
      get_escalation_details: {
        Args: { p_escalation_id: string }
        Returns: {
          assigned_to: string
          assigned_trainer_name: string
          auto_detected: boolean
          chat_id: string
          confidence: number
          created_at: string
          escalation_id: string
          metadata: Json
          original_question: string
          original_response: string
          reason: string
          resolution_notes: string
          resolution_time_minutes: number
          response_count: number
          status: string
          student_email: string
          student_name: string
          topic_id: string
          topic_title: string
          triggers: Json
          user_id: string
          wait_time_minutes: number
        }[]
      }
      get_event_handler_health: {
        Args: { p_handler_name?: string }
        Returns: {
          avg_processing_time_ms: number
          handler_name: string
          health_status: string
          is_enabled: boolean
          last_processed_at: string
          total_failed: number
          total_processed: number
        }[]
      }
      get_events_filtered: {
        Args: {
          p_event_name?: string
          p_limit?: number
          p_offset?: number
          p_org_id?: string
        }
        Returns: {
          created_at: string
          error_message: string
          event_name: string
          id: string
          org_id: string
          payload: Json
          processed_at: string
          retry_count: number
          status: string
        }[]
      }
      get_lab_submission_history: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: {
          attempt_number: number
          feedback: string
          final_score: number
          passed: boolean
          repository_url: string
          status: string
          submission_id: string
          submitted_at: string
        }[]
      }
      get_locked_topics_for_user: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: {
          is_unlocked: boolean
          missing_prerequisites: string[]
          module_id: string
          module_title: string
          topic_id: string
          topic_number: number
          topic_title: string
        }[]
      }
      get_next_badges: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          badge_id: string
          current_value: number
          description: string
          icon_url: string
          name: string
          percentage: number
          rarity: string
          slug: string
          target_value: number
        }[]
      }
      get_next_unlocked_topic: {
        Args: { p_enrollment_id: string; p_user_id: string }
        Returns: string
      }
      get_or_create_quiz_settings: {
        Args: { p_topic_id: string }
        Returns: {
          allow_review: boolean
          id: string
          max_attempts: number
          passing_threshold: number
          randomize_options: boolean
          randomize_questions: boolean
          show_correct_answers: boolean
          time_limit_minutes: number
          topic_id: string
          xp_reward: number
        }[]
      }
      get_peer_reviews_for_submission: {
        Args: { p_submission_id: string }
        Returns: {
          comments: string
          id: string
          improvements: string
          rating: number
          reviewed_at: string
          reviewer_id: string
          reviewer_name: string
          strengths: string
        }[]
      }
      get_quality_dashboard_metrics: {
        Args: { p_days?: number }
        Returns: {
          avg_rating: number
          avg_response_time_ms: number
          escalation_count: number
          escalation_rate: number
          helpful_count: number
          helpful_percentage: number
          period: string
          total_chats: number
          total_cost: number
          unhelpful_count: number
        }[]
      }
      get_question_bank: {
        Args: {
          p_created_by?: string
          p_difficulty?: string
          p_include_public?: boolean
          p_question_type?: string
          p_search_text?: string
          p_topic_id?: string
        }
        Returns: {
          avg_correct_percentage: number
          code_language: string
          correct_answers: Json
          created_at: string
          created_by: string
          created_by_name: string
          difficulty: string
          explanation: string
          id: string
          is_public: boolean
          options: Json
          points: number
          question_text: string
          question_type: string
          times_used: number
          topic_id: string
          updated_at: string
        }[]
      }
      get_quiz_attempt_results: {
        Args: { p_attempt_id: string }
        Returns: {
          answers: Json
          attempt_id: string
          attempt_number: number
          correct_answers: number
          passed: boolean
          questions: Json
          score: number
          started_at: string
          submitted_at: string
          time_taken_seconds: number
          topic_id: string
          total_questions: number
          user_id: string
          xp_earned: number
        }[]
      }
      get_quiz_questions: {
        Args: { p_randomize?: boolean; p_topic_id: string }
        Returns: {
          code_language: string
          difficulty: string
          id: string
          options: Json
          points: number
          question_text: string
          question_type: string
          randomized_options: Json
        }[]
      }
      get_reading_progress: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: {
          content_type: string
          current_page: number
          last_read_at: string
          last_scroll_position: number
          scroll_percentage: number
          session_count: number
          total_pages: number
          total_reading_time_seconds: number
        }[]
      }
      get_resume_stats: {
        Args: { p_org_id: string; p_user_id?: string }
        Returns: {
          avg_generation_time_ms: number
          avg_quality_score: number
          total_interviews: number
          total_placements: number
          total_resumes: number
        }[]
      }
      get_screenshot_stats: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: {
          analyzed_screenshots: number
          top_activity: string
          total_hours: number
          total_screenshots: number
        }[]
      }
      get_submissions_for_peer_review: {
        Args: { p_course_id: string; p_limit?: number; p_reviewer_id: string }
        Returns: {
          already_reviewed: boolean
          course_title: string
          demo_video_url: string
          description: string
          id: string
          peer_review_count: number
          repository_url: string
          student_name: string
          submitted_at: string
          user_id: string
        }[]
      }
      get_topic_assets: {
        Args: { p_topic_id: string }
        Returns: {
          asset_id: string
          cdn_url: string
          file_size_bytes: number
          file_type: string
          filename: string
          uploaded_at: string
        }[]
      }
      get_trainer_responses: {
        Args: { p_escalation_id: string; p_include_internal?: boolean }
        Returns: {
          created_at: string
          is_internal_note: boolean
          message: string
          response_id: string
          trainer_id: string
          trainer_name: string
        }[]
      }
      get_twin_interaction_count: {
        Args: { p_date?: string; p_interaction_type: string; p_user_id: string }
        Returns: number
      }
      get_twin_preferences: {
        Args: { p_user_id: string }
        Returns: {
          enable_morning_briefing: boolean
          enable_proactive_suggestions: boolean
          morning_briefing_time: string
          notify_via_email: boolean
          notify_via_slack: boolean
          notify_via_ui: boolean
          suggestion_frequency: number
          use_activity_data: boolean
          use_productivity_data: boolean
        }[]
      }
      get_user_ai_sessions: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          course_id: string
          id: string
          last_message_at: string
          message_count: number
          started_at: string
          title: string
          topic_id: string
          total_cost_usd: number
          total_tokens: number
        }[]
      }
      get_user_badges: {
        Args: { p_user_id: string }
        Returns: {
          badge_id: string
          description: string
          earned_at: string
          icon_url: string
          is_new: boolean
          name: string
          rarity: string
          share_count: number
          slug: string
          xp_reward: number
        }[]
      }
      get_user_cohort_rank: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: {
          cohort_name: string
          cohort_percentile: number
          cohort_size: number
          rank: number
          total_xp: number
        }[]
      }
      get_user_course_rank: {
        Args: { p_course_id: string; p_user_id: string }
        Returns: {
          course_xp: number
          percentile: number
          rank: number
          total_students: number
        }[]
      }
      get_user_global_rank: {
        Args: { p_user_id: string }
        Returns: {
          percentile: number
          rank: number
          total_xp: number
        }[]
      }
      get_user_leaderboard_summary: {
        Args: { p_user_id: string }
        Returns: {
          global_percentile: number
          global_rank: number
          is_all_time_top100: boolean
          leaderboard_visible: boolean
          total_xp: number
          weekly_rank: number
          weekly_xp: number
        }[]
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: {
          action: string
          resource: string
          scope: string
          via_role: string
        }[]
      }
      get_user_quiz_attempts: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: {
          attempt_number: number
          correct_answers: number
          id: string
          passed: boolean
          score: number
          started_at: string
          submitted_at: string
          time_taken_seconds: number
          total_questions: number
          xp_earned: number
        }[]
      }
      get_user_reading_stats: {
        Args: { p_user_id: string }
        Returns: {
          avg_scroll_percentage: number
          total_articles_completed: number
          total_articles_read: number
          total_reading_time_seconds: number
        }[]
      }
      get_user_total_xp: { Args: { p_user_id: string }; Returns: number }
      get_user_watch_stats: {
        Args: { p_user_id: string }
        Returns: {
          avg_completion_percentage: number
          total_videos_completed: number
          total_videos_watched: number
          total_watch_time_seconds: number
        }[]
      }
      get_user_weekly_performance: {
        Args: { p_user_id: string }
        Returns: {
          is_current_week: boolean
          rank: number
          week_label: string
          weekly_xp: number
        }[]
      }
      get_video_progress: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: {
          completion_percentage: number
          last_position_seconds: number
          last_watched_at: string
          session_count: number
          total_watch_time_seconds: number
        }[]
      }
      grade_capstone: {
        Args: {
          p_feedback: string
          p_grade: number
          p_grader_id: string
          p_rubric_scores?: Json
          p_status?: string
          p_submission_id: string
        }
        Returns: boolean
      }
      grant_role_to_user: {
        Args: {
          p_expires_at?: string
          p_granted_by: string
          p_is_primary?: boolean
          p_role_name: string
          p_user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: { role_name: string; user_id: string }
        Returns: boolean
      }
      increment_badge_progress: {
        Args: {
          p_increment?: number
          p_trigger_type: string
          p_user_id: string
        }
        Returns: number
      }
      increment_rate_limits: {
        Args: { p_cost_usd: number; p_tokens_used: number; p_user_id: string }
        Returns: undefined
      }
      is_topic_unlocked: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_record_id: string
          p_severity?: string
          p_table_name: string
          p_user_id: string
        }
        Returns: string
      }
      mark_badge_viewed: {
        Args: { p_badge_id: string; p_user_id: string }
        Returns: undefined
      }
      mark_event_completed: { Args: { p_event_id: string }; Returns: boolean }
      mark_event_failed: {
        Args: { p_error_message: string; p_event_id: string }
        Returns: boolean
      }
      publish_event:
        | {
            Args: {
              p_aggregate_id: string
              p_event_type: string
              p_metadata?: Json
              p_payload: Json
              p_user_id?: string
            }
            Returns: string
          }
        | {
            Args: {
              p_aggregate_id: string
              p_event_type: string
              p_metadata?: Json
              p_org_id?: string
              p_payload: Json
              p_user_id?: string
            }
            Returns: string
          }
      rate_ai_chat: {
        Args: {
          p_chat_id: string
          p_feedback?: string
          p_rating: number
          p_user_id: string
        }
        Returns: undefined
      }
      record_auto_grade: {
        Args: {
          p_auto_grade_result: Json
          p_auto_grade_score: number
          p_passed?: boolean
          p_submission_id: string
        }
        Returns: boolean
      }
      record_content_upload: {
        Args: {
          p_cdn_url?: string
          p_file_size_bytes: number
          p_file_type: string
          p_filename: string
          p_lesson_id?: string
          p_mime_type: string
          p_storage_path: string
          p_topic_id?: string
          p_uploaded_by?: string
        }
        Returns: string
      }
      record_manual_grade: {
        Args: {
          p_feedback?: string
          p_grader_id: string
          p_manual_score: number
          p_passed?: boolean
          p_rubric_scores?: Json
          p_submission_id: string
        }
        Returns: boolean
      }
      record_notification: {
        Args: {
          p_escalation_id: string
          p_notification_type: string
          p_recipient_email?: string
          p_recipient_id?: string
          p_recipient_slack_id?: string
        }
        Returns: string
      }
      record_question_pattern: {
        Args: {
          p_question: string
          p_rating?: number
          p_topic_id: string
          p_user_id: string
        }
        Returns: string
      }
      replace_content_asset: {
        Args: { p_new_asset_id: string; p_old_asset_id: string }
        Returns: undefined
      }
      replay_events: {
        Args: {
          p_event_type_pattern?: string
          p_from_timestamp?: string
          p_to_timestamp?: string
        }
        Returns: {
          created_at: string
          event_id: string
          event_type: string
          replayed: boolean
        }[]
      }
      replay_failed_events_batch: {
        Args: { p_batch_size?: number; p_org_id?: string }
        Returns: {
          event_id: string
          event_name: string
          replayed: boolean
        }[]
      }
      reset_reading_progress: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: boolean
      }
      reset_video_progress: {
        Args: { p_topic_id: string; p_user_id: string }
        Returns: boolean
      }
      resolve_escalation: {
        Args: {
          p_escalation_id: string
          p_resolution_notes: string
          p_trainer_id: string
        }
        Returns: undefined
      }
      retry_failed_events: {
        Args: never
        Returns: {
          event_id: string
          event_type: string
        }[]
      }
      revoke_role_from_user: {
        Args: { p_role_name: string; p_user_id: string }
        Returns: boolean
      }
      save_reading_progress: {
        Args: {
          p_content_length?: number
          p_content_type?: string
          p_current_page?: number
          p_enrollment_id: string
          p_last_scroll_position: number
          p_reading_time_increment?: number
          p_scroll_percentage: number
          p_topic_id: string
          p_total_pages?: number
          p_user_id: string
        }
        Returns: string
      }
      save_video_progress: {
        Args: {
          p_enrollment_id: string
          p_last_position_seconds: number
          p_topic_id: string
          p_user_id: string
          p_video_duration_seconds: number
          p_video_provider: string
          p_video_url: string
          p_watch_time_increment?: number
        }
        Returns: string
      }
      search_candidates: {
        Args: {
          p_match_count?: number
          p_match_threshold?: number
          p_org_id: string
          p_query_embedding: string
        }
        Returns: {
          availability: string
          candidate_id: string
          experience_level: string
          resume_text: string
          similarity: number
          skills: string[]
        }[]
      }
      search_embeddings: {
        Args: {
          filter_metadata?: Json
          match_count?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      select_prompt_variant: {
        Args: never
        Returns: {
          system_prompt: string
          variant_id: string
        }[]
      }
      share_badge: {
        Args: { p_badge_id: string; p_user_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      start_lab_instance: {
        Args: {
          p_enrollment_id: string
          p_forked_repo_url: string
          p_github_username?: string
          p_lab_template_id?: string
          p_original_template_url: string
          p_time_limit_minutes?: number
          p_topic_id: string
          p_user_id: string
        }
        Returns: string
      }
      start_quiz_attempt: {
        Args: { p_enrollment_id: string; p_topic_id: string; p_user_id: string }
        Returns: string
      }
      store_ai_chat: {
        Args: {
          p_conversation_context: Json
          p_cost_usd: number
          p_course_id: string
          p_question: string
          p_response: string
          p_response_time_ms: number
          p_session_id: string
          p_tokens_used: number
          p_topic_id: string
          p_user_id: string
        }
        Returns: string
      }
      submit_capstone: {
        Args: {
          p_course_id: string
          p_demo_video_url?: string
          p_description?: string
          p_enrollment_id: string
          p_repository_url: string
          p_user_id: string
        }
        Returns: string
      }
      submit_lab: {
        Args: {
          p_branch_name?: string
          p_commit_sha?: string
          p_enrollment_id: string
          p_lab_instance_id: string
          p_repository_url: string
          p_topic_id: string
          p_user_id: string
        }
        Returns: string
      }
      submit_peer_review: {
        Args: {
          p_comments: string
          p_improvements?: string
          p_rating: number
          p_reviewer_id: string
          p_strengths?: string
          p_submission_id: string
        }
        Returns: string
      }
      submit_quiz_attempt: {
        Args: { p_answers: Json; p_attempt_id: string }
        Returns: {
          attempt_id: string
          correct_answers: number
          passed: boolean
          results: Json
          score: number
          total_questions: number
          xp_earned: number
        }[]
      }
      subscribe_to_events: {
        Args: {
          p_event_pattern: string
          p_handler_function?: string
          p_subscriber_name: string
          p_webhook_url?: string
        }
        Returns: string
      }
      test_rls_as_user: {
        Args: { p_user_id: string }
        Returns: {
          can_delete: boolean
          can_insert: boolean
          can_select: boolean
          can_update: boolean
          table_name: string
        }[]
      }
      test_simple_function: { Args: never; Returns: string }
      trigger_graduation: {
        Args: { p_enrollment_id: string }
        Returns: boolean
      }
      update_ai_session: {
        Args: {
          p_cost_usd: number
          p_course_id: string
          p_question: string
          p_session_id: string
          p_tokens_used: number
          p_topic_id: string
          p_user_id: string
        }
        Returns: string
      }
      update_enrollment_progress: {
        Args: { p_enrollment_id: string }
        Returns: undefined
      }
      update_enrollment_status: {
        Args: { p_enrollment_id: string; p_new_status: string }
        Returns: undefined
      }
      update_lab_activity: {
        Args: { p_instance_id: string; p_time_increment_seconds?: number }
        Returns: boolean
      }
      update_leaderboard_visibility: {
        Args: { p_user_id: string; p_visible: boolean }
        Returns: undefined
      }
      update_prompt_variant_metrics: { Args: never; Returns: undefined }
      update_quiz_question: {
        Args: {
          p_code_language?: string
          p_correct_answers?: Json
          p_difficulty?: string
          p_explanation?: string
          p_is_public?: boolean
          p_options?: Json
          p_points?: number
          p_question_id: string
          p_question_text?: string
          p_question_type?: string
        }
        Returns: boolean
      }
      update_quiz_settings: {
        Args: {
          p_allow_review?: boolean
          p_max_attempts?: number
          p_passing_threshold?: number
          p_randomize_options?: boolean
          p_randomize_questions?: boolean
          p_show_correct_answers?: boolean
          p_time_limit_minutes?: number
          p_topic_id: string
          p_xp_reward?: number
        }
        Returns: string
      }
      user_belongs_to_org: { Args: { check_org_id: string }; Returns: boolean }
      user_has_any_role: { Args: { role_names: string[] }; Returns: boolean }
      user_has_permission: {
        Args: {
          p_action: string
          p_resource: string
          p_scope?: string
          p_user_id: string
        }
        Returns: boolean
      }
      user_has_role: { Args: { role_name: string }; Returns: boolean }
      user_is_admin: { Args: never; Returns: boolean }
      user_is_org_admin: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
