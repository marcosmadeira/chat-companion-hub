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
      nfse_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          invoice_id: string
          payload: Json | null
          source: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          invoice_id: string
          payload?: Json | null
          source: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          invoice_id?: string
          payload?: Json | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfse_events_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "nfse_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      nfse_invoices: {
        Row: {
          aliquota_iss: number | null
          codigo_municipio: string | null
          codigo_servico: string
          codigo_verificacao: string | null
          created_at: string
          discriminacao: string
          external_id: string | null
          id: string
          iss_retido: boolean | null
          numero_nfse: string | null
          prestador_cnpj: string
          prestador_inscricao_municipal: string | null
          prestador_razao_social: string
          status: string
          tomador_cep: string | null
          tomador_cpf_cnpj: string
          tomador_email: string | null
          tomador_endereco: string | null
          tomador_municipio: string | null
          tomador_razao_social: string
          tomador_uf: string | null
          updated_at: string
          user_id: string
          valor_deducoes: number | null
          valor_iss: number | null
          valor_servicos: number
          xml_envio_url: string | null
          xml_retorno_url: string | null
        }
        Insert: {
          aliquota_iss?: number | null
          codigo_municipio?: string | null
          codigo_servico: string
          codigo_verificacao?: string | null
          created_at?: string
          discriminacao: string
          external_id?: string | null
          id?: string
          iss_retido?: boolean | null
          numero_nfse?: string | null
          prestador_cnpj: string
          prestador_inscricao_municipal?: string | null
          prestador_razao_social: string
          status?: string
          tomador_cep?: string | null
          tomador_cpf_cnpj: string
          tomador_email?: string | null
          tomador_endereco?: string | null
          tomador_municipio?: string | null
          tomador_razao_social: string
          tomador_uf?: string | null
          updated_at?: string
          user_id: string
          valor_deducoes?: number | null
          valor_iss?: number | null
          valor_servicos: number
          xml_envio_url?: string | null
          xml_retorno_url?: string | null
        }
        Update: {
          aliquota_iss?: number | null
          codigo_municipio?: string | null
          codigo_servico?: string
          codigo_verificacao?: string | null
          created_at?: string
          discriminacao?: string
          external_id?: string | null
          id?: string
          iss_retido?: boolean | null
          numero_nfse?: string | null
          prestador_cnpj?: string
          prestador_inscricao_municipal?: string | null
          prestador_razao_social?: string
          status?: string
          tomador_cep?: string | null
          tomador_cpf_cnpj?: string
          tomador_email?: string | null
          tomador_endereco?: string | null
          tomador_municipio?: string | null
          tomador_razao_social?: string
          tomador_uf?: string | null
          updated_at?: string
          user_id?: string
          valor_deducoes?: number | null
          valor_iss?: number | null
          valor_servicos?: number
          xml_envio_url?: string | null
          xml_retorno_url?: string | null
        }
        Relationships: []
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
