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
          org_id: string
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
          org_id: string
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
          org_id?: string
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
          org_id: string
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
          org_id: string
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
          org_id?: string
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
          org_id: string
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
          org_id: string
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
          org_id?: string
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
          org_id: string
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
          org_id: string
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
          org_id?: string
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
          org_id: string
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
          org_id: string
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
          org_id?: string
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
    }
    Views: {
      ai_foundation_validation: {
        Row: {
          component: string | null
          status: string | null
        }
        Relationships: []
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
    }
    Functions: {
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
      auth_user_id: { Args: never; Returns: string }
      auth_user_org_id: { Args: never; Returns: string }
      auto_create_next_audit_partition: { Args: never; Returns: undefined }
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
      cleanup_old_audit_partitions: {
        Args: never
        Returns: {
          action: string
          partition_name: string
        }[]
      }
      create_audit_log_partition: {
        Args: { partition_date: string }
        Returns: undefined
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
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: {
          action: string
          resource: string
          scope: string
          via_role: string
        }[]
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  public: {
    Enums: {},
  },
} as const
