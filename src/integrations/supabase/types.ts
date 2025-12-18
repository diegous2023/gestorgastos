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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_email: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_email: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      authorized_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      category_limits: {
        Row: {
          category_id: string
          created_at: string
          currency: string
          id: string
          limit_eur: number | null
          limit_usd: number | null
          updated_at: string
          user_email: string
        }
        Insert: {
          category_id: string
          created_at?: string
          currency: string
          id?: string
          limit_eur?: number | null
          limit_usd?: number | null
          updated_at?: string
          user_email: string
        }
        Update: {
          category_id?: string
          created_at?: string
          currency?: string
          id?: string
          limit_eur?: number | null
          limit_usd?: number | null
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_eur: number | null
          amount_usd: number | null
          category: string
          created_at: string
          currency: string
          date: string
          description: string
          id: string
          note: string | null
          updated_at: string
          user_email: string
        }
        Insert: {
          amount_eur?: number | null
          amount_usd?: number | null
          category: string
          created_at?: string
          currency: string
          date: string
          description: string
          id?: string
          note?: string | null
          updated_at?: string
          user_email: string
        }
        Update: {
          amount_eur?: number | null
          amount_usd?: number | null
          category?: string
          created_at?: string
          currency?: string
          date?: string
          description?: string
          id?: string
          note?: string | null
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          title: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          title?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          title?: string | null
        }
        Relationships: []
      }
      special_notification_dismissals: {
        Row: {
          dismissed_at: string
          id: string
          notification_id: string
          user_email: string
        }
        Insert: {
          dismissed_at?: string
          id?: string
          notification_id: string
          user_email: string
        }
        Update: {
          dismissed_at?: string
          id?: string
          notification_id?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_notification_dismissals_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "special_notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      special_notifications: {
        Row: {
          button1_text: string
          button2_text: string
          created_at: string
          description: string
          dismiss_button: number
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          button1_text?: string
          button2_text?: string
          created_at?: string
          description: string
          dismiss_button?: number
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          button1_text?: string
          button2_text?: string
          created_at?: string
          description?: string
          dismiss_button?: number
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      user_notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_email: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_email: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_personalized_notifications: {
        Row: {
          button1_text: string
          button2_text: string
          created_at: string
          description: string
          dismiss_button: number
          id: string
          is_active: boolean
          is_dismissed: boolean
          title: string
          updated_at: string
          user_email: string
        }
        Insert: {
          button1_text?: string
          button2_text?: string
          created_at?: string
          description: string
          dismiss_button?: number
          id?: string
          is_active?: boolean
          is_dismissed?: boolean
          title: string
          updated_at?: string
          user_email: string
        }
        Update: {
          button1_text?: string
          button2_text?: string
          created_at?: string
          description?: string
          dismiss_button?: number
          id?: string
          is_active?: boolean
          is_dismissed?: boolean
          title?: string
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
