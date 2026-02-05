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
      menu_settings: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          menu_key: string
          menu_name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          menu_key: string
          menu_name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          menu_key?: string
          menu_name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          correct_count: number
          created_at: string
          duration_minutes: number
          id: string
          mode: string
          user_id: string
          wordbook_id: string | null
          words_studied: number
        }
        Insert: {
          correct_count?: number
          created_at?: string
          duration_minutes?: number
          id?: string
          mode: string
          user_id: string
          wordbook_id?: string | null
          words_studied?: number
        }
        Update: {
          correct_count?: number
          created_at?: string
          duration_minutes?: number
          id?: string
          mode?: string
          user_id?: string
          wordbook_id?: string | null
          words_studied?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_wordbook_id_fkey"
            columns: ["wordbook_id"]
            isOneToOne: false
            referencedRelation: "wordbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_stats: {
        Row: {
          created_at: string
          date: string
          id: string
          new_words: number
          review_words: number
          study_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          new_words?: number
          review_words?: number
          study_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          new_words?: number
          review_words?: number
          study_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_meaning_progress: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          last_reviewed: string | null
          mastery: number
          meaning_id: string
          next_review: string | null
          review_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          correct_count?: number
          created_at?: string
          id?: string
          last_reviewed?: string | null
          mastery?: number
          meaning_id: string
          next_review?: string | null
          review_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          last_reviewed?: string | null
          mastery?: number
          meaning_id?: string
          next_review?: string | null
          review_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_meaning_progress_meaning_id_fkey"
            columns: ["meaning_id"]
            isOneToOne: false
            referencedRelation: "word_meanings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_starred_words: {
        Row: {
          created_at: string
          id: string
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_starred_words_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      user_word_progress: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          last_reviewed: string | null
          mastery: number
          next_review: string | null
          review_count: number
          updated_at: string
          user_id: string
          word_id: string
        }
        Insert: {
          correct_count?: number
          created_at?: string
          id?: string
          last_reviewed?: string | null
          mastery?: number
          next_review?: string | null
          review_count?: number
          updated_at?: string
          user_id: string
          word_id: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          last_reviewed?: string | null
          mastery?: number
          next_review?: string | null
          review_count?: number
          updated_at?: string
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_word_progress_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      word_meanings: {
        Row: {
          created_at: string
          example: string | null
          example_translation: string | null
          frequency_score: number
          id: string
          is_exam_focus: boolean | null
          is_primary: boolean | null
          meaning: string
          meaning_order: number
          part_of_speech: string | null
          updated_at: string
          usage_note: string | null
          word_id: string
        }
        Insert: {
          created_at?: string
          example?: string | null
          example_translation?: string | null
          frequency_score?: number
          id?: string
          is_exam_focus?: boolean | null
          is_primary?: boolean | null
          meaning: string
          meaning_order?: number
          part_of_speech?: string | null
          updated_at?: string
          usage_note?: string | null
          word_id: string
        }
        Update: {
          created_at?: string
          example?: string | null
          example_translation?: string | null
          frequency_score?: number
          id?: string
          is_exam_focus?: boolean | null
          is_primary?: boolean | null
          meaning?: string
          meaning_order?: number
          part_of_speech?: string | null
          updated_at?: string
          usage_note?: string | null
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_meanings_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      word_videos: {
        Row: {
          created_at: string
          difficulty: string | null
          end_time: number | null
          id: string
          meaning_id: string | null
          start_time: number | null
          thumbnail_url: string | null
          transcript: string | null
          transcript_translation: string | null
          updated_at: string
          video_source: string | null
          video_title: string | null
          video_url: string
          word_id: string | null
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          end_time?: number | null
          id?: string
          meaning_id?: string | null
          start_time?: number | null
          thumbnail_url?: string | null
          transcript?: string | null
          transcript_translation?: string | null
          updated_at?: string
          video_source?: string | null
          video_title?: string | null
          video_url: string
          word_id?: string | null
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          end_time?: number | null
          id?: string
          meaning_id?: string | null
          start_time?: number | null
          thumbnail_url?: string | null
          transcript?: string | null
          transcript_translation?: string | null
          updated_at?: string
          video_source?: string | null
          video_title?: string | null
          video_url?: string
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "word_videos_meaning_id_fkey"
            columns: ["meaning_id"]
            isOneToOne: false
            referencedRelation: "word_meanings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_videos_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      wordbooks: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          level: string | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          level?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          level?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      words: {
        Row: {
          audio_url: string | null
          created_at: string
          difficulty: string | null
          exam_priority: number | null
          example: string | null
          example_translation: string | null
          frequency_rank: number | null
          id: string
          is_high_frequency: boolean | null
          meaning: string
          phonetic: string | null
          sort_order: number
          updated_at: string
          word: string
          wordbook_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          difficulty?: string | null
          exam_priority?: number | null
          example?: string | null
          example_translation?: string | null
          frequency_rank?: number | null
          id?: string
          is_high_frequency?: boolean | null
          meaning: string
          phonetic?: string | null
          sort_order?: number
          updated_at?: string
          word: string
          wordbook_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          difficulty?: string | null
          exam_priority?: number | null
          example?: string | null
          example_translation?: string | null
          frequency_rank?: number | null
          id?: string
          is_high_frequency?: boolean | null
          meaning?: string
          phonetic?: string | null
          sort_order?: number
          updated_at?: string
          word?: string
          wordbook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_wordbook_id_fkey"
            columns: ["wordbook_id"]
            isOneToOne: false
            referencedRelation: "wordbooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
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
