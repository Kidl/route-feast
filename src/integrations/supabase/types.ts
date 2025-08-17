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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          permissions: string[] | null
          role: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      booking_events: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_participants: {
        Row: {
          allergies: string | null
          booking_id: string | null
          created_at: string
          dietary_preferences: string[] | null
          id: string
          name: string | null
        }
        Insert: {
          allergies?: string | null
          booking_id?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          id?: string
          name?: string | null
        }
        Update: {
          allergies?: string | null
          booking_id?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_participants_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          allergies: string | null
          booking_reference: string
          cancellation_reason: string | null
          cancelled_at: string | null
          confirmation_sent_at: string | null
          created_at: string
          dietary_preferences: string[] | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          number_of_people: number
          payment_status: string
          route_id: string | null
          schedule_id: string | null
          special_requests: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount_nok: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allergies?: string | null
          booking_reference?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          number_of_people: number
          payment_status?: string
          route_id?: string | null
          schedule_id?: string | null
          special_requests?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount_nok: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allergies?: string | null
          booking_reference?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          confirmation_sent_at?: string | null
          created_at?: string
          dietary_preferences?: string[] | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          number_of_people?: number
          payment_status?: string
          route_id?: string | null
          schedule_id?: string | null
          special_requests?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount_nok?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "route_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_rules: {
        Row: {
          created_at: string
          fee_type: string
          fee_value: number
          hours_before: number
          id: string
          is_active: boolean | null
          message: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          hours_before?: number
          id?: string
          is_active?: boolean | null
          message?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          hours_before?: number
          id?: string
          is_active?: boolean | null
          message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          body: string
          channel: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body: string
          channel: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      route_schedules: {
        Row: {
          available_date: string
          available_spots: number
          created_at: string
          id: string
          is_active: boolean | null
          route_id: string | null
          start_time: string
        }
        Insert: {
          available_date: string
          available_spots: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          route_id?: string | null
          start_time: string
        }
        Update: {
          available_date?: string
          available_spots?: number
          created_at?: string
          id?: string
          is_active?: boolean | null
          route_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          created_at: string
          description: string
          duration_hours: number
          highlights: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          location: string
          max_capacity: number
          name: string
          price_nok: number
          restaurants: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          duration_hours: number
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location: string
          max_capacity?: number
          name: string
          price_nok: number
          restaurants?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          duration_hours?: number
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          location?: string
          max_capacity?: number
          name?: string
          price_nok?: number
          restaurants?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrease_available_spots: {
        Args: { schedule_id: string; spots_to_decrease: number }
        Returns: undefined
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
