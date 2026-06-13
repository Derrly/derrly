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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_activities: {
        Row: {
          activity_type: string
          agent: string
          completed_at: string | null
          created_at: string
          details: Json
          id: string
          owner_id: string
          project_id: string
          run_id: string | null
          sequence: number
          status: string
          summary: string
        }
        Insert: {
          activity_type: string
          agent: string
          completed_at?: string | null
          created_at?: string
          details?: Json
          id?: string
          owner_id: string
          project_id: string
          run_id?: string | null
          sequence?: number
          status?: string
          summary: string
        }
        Update: {
          activity_type?: string
          agent?: string
          completed_at?: string | null
          created_at?: string
          details?: Json
          id?: string
          owner_id?: string
          project_id?: string
          run_id?: string | null
          sequence?: number
          status?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_activities_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "studio_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_handoffs: {
        Row: {
          context: Json
          created_at: string
          from_agent: string
          id: string
          output_memory_id: string | null
          owner_id: string
          project_id: string
          request_type: string
          resolved_at: string | null
          response: string | null
          run_id: string | null
          status: string
          to_agent: string
        }
        Insert: {
          context?: Json
          created_at?: string
          from_agent: string
          id?: string
          output_memory_id?: string | null
          owner_id: string
          project_id: string
          request_type: string
          resolved_at?: string | null
          response?: string | null
          run_id?: string | null
          status?: string
          to_agent: string
        }
        Update: {
          context?: Json
          created_at?: string
          from_agent?: string
          id?: string
          output_memory_id?: string | null
          owner_id?: string
          project_id?: string
          request_type?: string
          resolved_at?: string | null
          response?: string | null
          run_id?: string | null
          status?: string
          to_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_handoffs_output_memory_id_fkey"
            columns: ["output_memory_id"]
            isOneToOne: false
            referencedRelation: "project_memory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_handoffs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_handoffs_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "studio_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ai_message_id: string | null
          content: string
          created_at: string
          id: string
          model: string | null
          owner_id: string
          parts: Json | null
          role: string
          thread_id: string
        }
        Insert: {
          ai_message_id?: string | null
          content?: string
          created_at?: string
          id?: string
          model?: string | null
          owner_id: string
          parts?: Json | null
          role: string
          thread_id: string
        }
        Update: {
          ai_message_id?: string | null
          content?: string
          created_at?: string
          id?: string
          model?: string | null
          owner_id?: string
          parts?: Json | null
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          studio_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          studio_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          studio_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_artifacts: {
        Row: {
          artifact_type: string
          content: Json
          created_at: string
          id: string
          metadata: Json
          owner_id: string
          produced_by: string
          project_id: string
          review_status: string
          run_id: string | null
          summary: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          artifact_type: string
          content?: Json
          created_at?: string
          id?: string
          metadata?: Json
          owner_id: string
          produced_by: string
          project_id: string
          review_status?: string
          run_id?: string | null
          summary?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          artifact_type?: string
          content?: Json
          created_at?: string
          id?: string
          metadata?: Json
          owner_id?: string
          produced_by?: string
          project_id?: string
          review_status?: string
          run_id?: string | null
          summary?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_artifacts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_artifacts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "studio_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      project_memory: {
        Row: {
          category: string
          content: Json
          created_at: string
          id: string
          owner_id: string
          project_id: string
          source_agent: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          category: string
          content?: Json
          created_at?: string
          id?: string
          owner_id: string
          project_id: string
          source_agent: string
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          id?: string
          owner_id?: string
          project_id?: string
          source_agent?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_memory_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          prompt: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          prompt?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          prompt?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      studio_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          owner_id: string
          phase: string
          project_id: string
          revision_count: number
          started_at: string
          status: string
          task_graph: Json
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          owner_id: string
          phase?: string
          project_id: string
          revision_count?: number
          started_at?: string
          status?: string
          task_graph?: Json
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          owner_id?: string
          phase?: string
          project_id?: string
          revision_count?: number
          started_at?: string
          status?: string
          task_graph?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          agent: string | null
          created_at: string
          id: string
          owner_id: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          agent?: string | null
          created_at?: string
          id?: string
          owner_id: string
          project_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          agent?: string | null
          created_at?: string
          id?: string
          owner_id?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "threads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
