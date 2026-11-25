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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          label: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          label?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          label?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          article_slug: string
          body: string
          created_at: string
          display_name: string
          id: string
          moderated_at: string | null
          status: string
          submitter_hash: string | null
        }
        Insert: {
          article_slug: string
          body: string
          created_at?: string
          display_name: string
          id?: string
          moderated_at?: string | null
          status?: string
          submitter_hash?: string | null
        }
        Update: {
          article_slug?: string
          body?: string
          created_at?: string
          display_name?: string
          id?: string
          moderated_at?: string | null
          status?: string
          submitter_hash?: string | null
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          id: string
          path: string
          session_id: string
          source: string | null
          stage: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          session_id: string
          source?: string | null
          stage: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          session_id?: string
          source?: string | null
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "funnel_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      funnel_sessions: {
        Row: {
          first_path: string
          first_seen_at: string
          last_heartbeat_at: string | null
          last_path: string
          last_seen_at: string
          last_stage: string
          reached_contact_at: string | null
          reached_form_started_at: string | null
          reached_visit_at: string | null
          reached_whatsapp_attempt_at: string | null
          reached_whatsapp_direct_at: string | null
          session_id: string
        }
        Insert: {
          first_path: string
          first_seen_at?: string
          last_heartbeat_at?: string | null
          last_path: string
          last_seen_at?: string
          last_stage?: string
          reached_contact_at?: string | null
          reached_form_started_at?: string | null
          reached_visit_at?: string | null
          reached_whatsapp_attempt_at?: string | null
          reached_whatsapp_direct_at?: string | null
          session_id: string
        }
        Update: {
          first_path?: string
          first_seen_at?: string
          last_heartbeat_at?: string | null
          last_path?: string
          last_seen_at?: string
          last_stage?: string
          reached_contact_at?: string | null
          reached_form_started_at?: string | null
          reached_visit_at?: string | null
          reached_whatsapp_attempt_at?: string | null
          reached_whatsapp_direct_at?: string | null
          session_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      funnel_stage_rank: { Args: { p_stage: string }; Returns: number }
      get_admin_funnel_sessions: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_period?: string
          p_stage?: string
          p_status?: string
        }
        Returns: {
          first_path: string
          first_seen_at: string
          is_active: boolean
          last_heartbeat_at: string
          last_path: string
          last_seen_at: string
          last_stage: string
          reached_contact_at: string
          reached_form_started_at: string
          reached_visit_at: string
          reached_whatsapp_attempt_at: string
          reached_whatsapp_direct_at: string
          session_id: string
          total_count: number
        }[]
      }
      get_admin_funnel_summary: {
        Args: { p_period?: string }
        Returns: {
          active_sessions: number
          generated_at: string
          inactive_sessions: number
          online_now: number
          period_start: string
          stage_contact: number
          stage_form_started: number
          stage_visit: number
          stage_whatsapp_attempt: number
          stage_whatsapp_direct: number
          total_sessions: number
        }[]
      }
      ingest_funnel_signal: {
        Args: {
          p_kind: string
          p_path: string
          p_session_id: string
          p_source?: string
          p_stage?: string
        }
        Returns: undefined
      }
      is_authorized_admin: { Args: never; Returns: boolean }
      is_authorized_admin_aal2: { Args: never; Returns: boolean }
      prune_old_funnel_sessions: {
        Args: { p_retention_days?: number }
        Returns: number
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
