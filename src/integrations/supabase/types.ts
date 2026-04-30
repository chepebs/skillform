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
      agencies: {
        Row: {
          company_id: string | null
          country_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          company_id?: string | null
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          company_id?: string | null
          country_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agencies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agencies_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          company_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          uploaded_by: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          uploaded_by?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      awards: {
        Row: {
          award_name: string
          award_type: string | null
          award_year: number | null
          category: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          user_id: string
          won: boolean | null
        }
        Insert: {
          award_name: string
          award_type?: string | null
          award_year?: number | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          user_id: string
          won?: boolean | null
        }
        Update: {
          award_name?: string
          award_type?: string | null
          award_year?: number | null
          category?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          user_id?: string
          won?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "awards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      brands_managed: {
        Row: {
          brand_name: string
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          user_id: string
          years_managed: number | null
        }
        Insert: {
          brand_name: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          user_id: string
          years_managed?: number | null
        }
        Update: {
          brand_name?: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          user_id?: string
          years_managed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_managed_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          body: string
          company_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          company_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          company_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          country_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          invite_token: string
          logo_url: string | null
          name: string
          slug: string
          subscription_plan: string
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          invite_token?: string
          logo_url?: string | null
          name: string
          slug: string
          subscription_plan?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          country_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          invite_token?: string
          logo_url?: string | null
          name?: string
          slug?: string
          subscription_plan?: string
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string | null
          director_id: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          director_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          director_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          company_id: string
          created_at: string
          department: string | null
          description: string | null
          file_name: string
          file_path: string
          folder_id: string | null
          id: string
          mime_type: string | null
          name: string
          owner_id: string
          size_bytes: number | null
          updated_at: string
          uploaded_by: string
          visibility: string
        }
        Insert: {
          company_id: string
          created_at?: string
          department?: string | null
          description?: string | null
          file_name: string
          file_path: string
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          name: string
          owner_id: string
          size_bytes?: number | null
          updated_at?: string
          uploaded_by: string
          visibility?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          department?: string | null
          description?: string | null
          file_name?: string
          file_path?: string
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          owner_id?: string
          size_bytes?: number | null
          updated_at?: string
          uploaded_by?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_industries: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          industry_id: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          industry_id: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          industry_id?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_industries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_industries_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_languages: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          is_native: boolean | null
          language: string
          reading_level: number | null
          speaking_level: number | null
          user_id: string
          writing_level: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_native?: boolean | null
          language: string
          reading_level?: number | null
          speaking_level?: number | null
          user_id: string
          writing_level?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_native?: boolean | null
          language?: string
          reading_level?: number | null
          speaking_level?: number | null
          user_id?: string
          writing_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_languages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          proficiency_level: number
          skill_category: string
          skill_name: string
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          proficiency_level: number
          skill_category: string
          skill_name: string
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          proficiency_level?: number
          skill_category?: string
          skill_name?: string
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          company_id: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          department_id: string | null
          description: string | null
          ends_at: string | null
          id: string
          is_virtual: boolean
          location: string | null
          meeting_url: string | null
          starts_at: string
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          company_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          department_id?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_virtual?: boolean
          location?: string | null
          meeting_url?: string | null
          starts_at: string
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          company_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          is_virtual?: boolean
          location?: string | null
          meeting_url?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          added_at: string | null
          company_id: string | null
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          added_at?: string | null
          company_id?: string | null
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          added_at?: string | null
          company_id?: string | null
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      invitation_tokens: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
          used: boolean | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token: string
          used?: boolean | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_tokens_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          company_id: string | null
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          company_id?: string | null
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          company_id?: string | null
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          company_id: string
          created_at: string
          deadline: string | null
          department: string | null
          description: string | null
          employment_type: string | null
          id: string
          location: string | null
          posted_by: string
          seniority: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          deadline?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          posted_by: string
          seniority?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          deadline?: string | null
          department?: string | null
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          posted_by?: string
          seniority?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kudos: {
        Row: {
          company_id: string | null
          created_at: string
          from_user_id: string
          id: string
          message: string
          to_user_id: string
          value_tag: string | null
          visibility: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          message: string
          to_user_id: string
          value_tag?: string | null
          visibility?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string
          to_user_id?: string
          value_tag?: string | null
          visibility?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          company_id: string | null
          created_at: string | null
          from_user_id: string
          id: string
          message: string
          read: boolean | null
          read_at: string | null
          subject: string
          to_user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          from_user_id: string
          id?: string
          message: string
          read?: boolean | null
          read_at?: string | null
          subject: string
          to_user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          from_user_id?: string
          id?: string
          message?: string
          read?: boolean | null
          read_at?: string | null
          subject?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_assignments: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string
          due_at: string | null
          id: string
          started_at: string
          status: string
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by: string
          due_at?: string | null
          id?: string
          started_at?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          due_at?: string | null
          id?: string
          started_at?: string
          status?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_assignments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          assignee_notes: string | null
          assignment_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_notes?: string | null
          assignment_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_notes?: string | null
          assignment_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "onboarding_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_template_tasks: {
        Row: {
          created_at: string
          default_due_offset_days: number
          description: string | null
          id: string
          sort_order: number
          template_id: string
          title: string
        }
        Insert: {
          created_at?: string
          default_due_offset_days?: number
          description?: string | null
          id?: string
          sort_order?: number
          template_id: string
          title: string
        }
        Update: {
          created_at?: string
          default_due_offset_days?: number
          description?: string | null
          id?: string
          sort_order?: number
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_template_tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          body_md: string
          company_id: string
          created_at: string
          created_by: string
          effective_from: string | null
          id: string
          published_at: string | null
          requires_acknowledgement: boolean
          status: string
          summary: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body_md: string
          company_id: string
          created_at?: string
          created_by: string
          effective_from?: string | null
          id?: string
          published_at?: string | null
          requires_acknowledgement?: boolean
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          body_md?: string
          company_id?: string
          created_at?: string
          created_by?: string
          effective_from?: string | null
          id?: string
          published_at?: string | null
          requires_acknowledgement?: boolean
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      policy_acknowledgements: {
        Row: {
          acknowledged_at: string
          id: string
          policy_id: string
          policy_version: number
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          id?: string
          policy_id: string
          policy_version: number
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          id?: string
          policy_id?: string
          policy_version?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_acknowledgements_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      previous_agencies: {
        Row: {
          agency_name: string
          company_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          role: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          agency_name: string
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          role: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          agency_name?: string
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          role?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "previous_agencies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      previous_positions: {
        Row: {
          company: string
          company_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          position_title: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          company: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          position_title: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          company?: string
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          position_title?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "previous_positions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_degree: string | null
          agency_id: string | null
          avatar_url: string | null
          behance_url: string | null
          bio: string | null
          birth_date: string | null
          brand_creations: number | null
          brand_refreshes: number | null
          company_id: string | null
          consulting_work: string | null
          country_id: string | null
          created_at: string | null
          current_position: string | null
          department: string | null
          effie_awards_participated: number | null
          effie_awards_won: number | null
          email: string
          first_name: string | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          linkedin_url: string | null
          manager_id: string | null
          phone: string | null
          pitches_participated: number | null
          pitches_won: number | null
          position: string | null
          profile_completed: boolean | null
          profile_completed_at: string | null
          seniority_level: Database["public"]["Enums"]["seniority_type"]
          start_date: string | null
          updated_at: string | null
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          academic_degree?: string | null
          agency_id?: string | null
          avatar_url?: string | null
          behance_url?: string | null
          bio?: string | null
          birth_date?: string | null
          brand_creations?: number | null
          brand_refreshes?: number | null
          company_id?: string | null
          consulting_work?: string | null
          country_id?: string | null
          created_at?: string | null
          current_position?: string | null
          department?: string | null
          effie_awards_participated?: number | null
          effie_awards_won?: number | null
          email: string
          first_name?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          manager_id?: string | null
          phone?: string | null
          pitches_participated?: number | null
          pitches_won?: number | null
          position?: string | null
          profile_completed?: boolean | null
          profile_completed_at?: string | null
          seniority_level?: Database["public"]["Enums"]["seniority_type"]
          start_date?: string | null
          updated_at?: string | null
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          academic_degree?: string | null
          agency_id?: string | null
          avatar_url?: string | null
          behance_url?: string | null
          bio?: string | null
          birth_date?: string | null
          brand_creations?: number | null
          brand_refreshes?: number | null
          company_id?: string | null
          consulting_work?: string | null
          country_id?: string | null
          created_at?: string | null
          current_position?: string | null
          department?: string | null
          effie_awards_participated?: number | null
          effie_awards_won?: number | null
          email?: string
          first_name?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          manager_id?: string | null
          phone?: string | null
          pitches_participated?: number | null
          pitches_won?: number | null
          position?: string | null
          profile_completed?: boolean | null
          profile_completed_at?: string | null
          seniority_level?: Database["public"]["Enums"]["seniority_type"]
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_projects: {
        Row: {
          brand: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          key_results: string | null
          project_month: number | null
          project_name: string
          project_year: number | null
          role_in_project: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key_results?: string | null
          project_month?: number | null
          project_name: string
          project_year?: number | null
          role_in_project?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key_results?: string | null
          project_month?: number | null
          project_name?: string
          project_year?: number | null
          role_in_project?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recent_projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_catalog: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          service_name: string
          sort_order: number | null
          subcategory_id: string | null
          typical_skills: string[] | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          service_name: string
          sort_order?: number | null
          subcategory_id?: string | null
          typical_skills?: string[] | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          service_name?: string
          sort_order?: number | null
          subcategory_id?: string | null
          typical_skills?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "service_catalog_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_catalog_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          level: number
          name: string
          parent_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          level: number
          name: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          level?: number
          name?: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_skills: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          importance_level: string | null
          min_proficiency: number | null
          service_id: string
          skill_name: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          importance_level?: string | null
          min_proficiency?: number | null
          service_id: string
          skill_name: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          importance_level?: string | null
          min_proficiency?: number | null
          service_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_skills_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_skills_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_talent_matches: {
        Row: {
          auto_matched: boolean | null
          company_id: string | null
          id: string
          is_active: boolean | null
          last_updated: string | null
          manually_added: boolean | null
          match_score: number | null
          matched_skills: string[] | null
          service_id: string
          skill_breakdown: Json | null
          user_id: string
        }
        Insert: {
          auto_matched?: boolean | null
          company_id?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          manually_added?: boolean | null
          match_score?: number | null
          matched_skills?: string[] | null
          service_id: string
          skill_breakdown?: Json | null
          user_id: string
        }
        Update: {
          auto_matched?: boolean | null
          company_id?: string | null
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          manually_added?: boolean | null
          match_score?: number | null
          matched_skills?: string[] | null
          service_id?: string
          skill_breakdown?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_talent_matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_talent_matches_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_vendors: {
        Row: {
          average_project_cost: number | null
          company_id: string | null
          contact_info: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          projects_per_year: number | null
          service_id: string
          vendor_name: string
          vendor_type: string | null
        }
        Insert: {
          average_project_cost?: number | null
          company_id?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          projects_per_year?: number | null
          service_id: string
          vendor_name: string
          vendor_type?: string | null
        }
        Update: {
          average_project_cost?: number | null
          company_id?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          projects_per_year?: number | null
          service_id?: string
          vendor_name?: string
          vendor_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_vendors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_vendors_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          agency_id: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          description: string | null
          external_budget_annual: number | null
          external_budget_monthly: number | null
          id: string
          is_active: boolean | null
          managed_by: string | null
          notes: string | null
          projects_per_month: number | null
          projects_per_year: number | null
          service_catalog_id: string
          typical_duration_days: number | null
          typical_duration_hours: number | null
          updated_at: string | null
        }
        Insert: {
          agency_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          external_budget_annual?: number | null
          external_budget_monthly?: number | null
          id?: string
          is_active?: boolean | null
          managed_by?: string | null
          notes?: string | null
          projects_per_month?: number | null
          projects_per_year?: number | null
          service_catalog_id: string
          typical_duration_days?: number | null
          typical_duration_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          agency_id?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          external_budget_annual?: number | null
          external_budget_monthly?: number | null
          id?: string
          is_active?: boolean | null
          managed_by?: string | null
          notes?: string | null
          projects_per_month?: number | null
          projects_per_year?: number | null
          service_catalog_id?: string
          typical_duration_days?: number | null
          typical_duration_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_service_catalog_id_fkey"
            columns: ["service_catalog_id"]
            isOneToOne: false
            referencedRelation: "service_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off_balances: {
        Row: {
          allocated_days: number
          company_id: string | null
          created_at: string
          id: string
          pending_days: number
          policy_id: string
          updated_at: string
          used_days: number
          user_id: string
          year: number
        }
        Insert: {
          allocated_days?: number
          company_id?: string | null
          created_at?: string
          id?: string
          pending_days?: number
          policy_id: string
          updated_at?: string
          used_days?: number
          user_id: string
          year: number
        }
        Update: {
          allocated_days?: number
          company_id?: string | null
          created_at?: string
          id?: string
          pending_days?: number
          policy_id?: string
          updated_at?: string
          used_days?: number
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "time_off_balances_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "time_off_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off_policies: {
        Row: {
          accrual_method: string
          annual_allowance_days: number
          color: string | null
          company_id: string
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          is_paid: boolean
          name: string
          requires_approval: boolean
          type: string
          updated_at: string
        }
        Insert: {
          accrual_method?: string
          annual_allowance_days?: number
          color?: string | null
          company_id: string
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name: string
          requires_approval?: boolean
          type?: string
          updated_at?: string
        }
        Update: {
          accrual_method?: string
          annual_allowance_days?: number
          color?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          is_paid?: boolean
          name?: string
          requires_approval?: boolean
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      time_off_requests: {
        Row: {
          approver_id: string | null
          company_id: string | null
          created_at: string
          day_count: number
          decision_at: string | null
          decision_notes: string | null
          end_date: string
          id: string
          policy_id: string
          reason: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approver_id?: string | null
          company_id?: string | null
          created_at?: string
          day_count: number
          decision_at?: string | null
          decision_notes?: string | null
          end_date: string
          id?: string
          policy_id: string
          reason?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approver_id?: string | null
          company_id?: string | null
          created_at?: string
          day_count?: number
          decision_at?: string | null
          decision_notes?: string | null
          end_date?: string
          id?: string
          policy_id?: string
          reason?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_requests_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "time_off_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_services: { Args: { _user_id: string }; Returns: boolean }
      can_edit_service: {
        Args: { _service_id: string; _user_id: string }
        Returns: boolean
      }
      get_company_by_invite: {
        Args: { _slug: string; _token: string }
        Returns: {
          id: string
          logo_url: string
          name: string
          slug: string
        }[]
      }
      get_company_invite_token: {
        Args: { _company_id: string }
        Returns: string
      }
      get_user_company: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      is_direct_manager: {
        Args: { _manager_id: string; _user_id: string }
        Returns: boolean
      }
      is_platform_master: { Args: { _user_id: string }; Returns: boolean }
      use_invitation_token: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      validate_invitation_token: {
        Args: { p_token: string }
        Returns: {
          email: string
          is_valid: boolean
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "user"
      seniority_type:
        | "junior"
        | "mid"
        | "senior"
        | "director"
        | "vp"
        | "c-level"
      subscription_status: "trialing" | "active" | "past_due" | "canceled"
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
      app_role: ["admin", "manager", "user"],
      seniority_type: ["junior", "mid", "senior", "director", "vp", "c-level"],
      subscription_status: ["trialing", "active", "past_due", "canceled"],
    },
  },
} as const
