import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Organization {
  id: string;
  name: string;
  domain: string | null;
  created_at: string;
}

export interface OrganizationStats {
  organization_id: string;
  organization_name: string;
  user_count: number;
  total_high_fives: number;
  high_fives_this_week: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Alle verfügbaren Organizations abrufen (für Registration)
   * Graceful degradation: Falls organizations Tabelle nicht existiert, return []
   */
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('organizations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching organizations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Organizations table not available (migration pending)');
      return [];
    }
  }

  /**
   * Organization anhand Email-Domain finden
   * z.B. "peter@softure.com" → "Softure GmbH"
   * Graceful degradation: Falls organizations Tabelle nicht existiert, return null
   */
  async getOrganizationByEmail(email: string): Promise<Organization | null> {
    try {
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain) return null;

      const { data, error } = await this.supabase.client
        .from('organizations')
        .select('*')
        .ilike('domain', domain)
        .single();

      if (error) {
        console.log('No organization found for domain:', domain);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Organization lookup not available (migration pending)');
      return null;
    }
  }

  /**
   * Neue Organization erstellen
   * Graceful degradation: Falls organizations Tabelle nicht existiert, return null
   */
  async createOrganization(name: string, domain?: string): Promise<Organization | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('organizations')
        .insert([{ 
          name, 
          domain: domain?.toLowerCase() || null 
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating organization:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.warn('Cannot create organization (migration pending)');
      return null;
    }
  }

  /**
   * User einer Organization zuweisen
   * Graceful degradation: Falls organization_id Spalte nicht existiert, return false
   */
  async assignUserToOrganization(userId: string, organizationId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('users')
        .update({ organization_id: organizationId })
        .eq('id', userId);

      if (error) {
        console.error('Error assigning user to organization:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Cannot assign organization (migration pending)');
      return false;
    }
  }

  /**
   * Organization des aktuellen Users abrufen
   * Graceful degradation: Falls organization_id Spalte nicht existiert, return null
   */
  async getCurrentUserOrganization(): Promise<Organization | null> {
    try {
      const user = await this.supabase.currentUser;
      if (!user) return null;

      const { data: userData, error: userError } = await this.supabase.client
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.organization_id) {
        // Migration noch nicht ausgeführt - kein Problem
        return null;
      }

      const { data: org, error: orgError } = await this.supabase.client
        .from('organizations')
        .select('*')
        .eq('id', userData.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        return null;
      }

      return org;
    } catch (error) {
      console.warn('Organization feature not available (migration pending):', error);
      return null;
    }
  }

  /**
   * Alle Mitarbeiter der eigenen Organization
   * Graceful degradation: Falls organization_id nicht existiert, return []
   */
  async getOrganizationMembers(): Promise<any[]> {
    try {
      const user = await this.supabase.currentUser;
      if (!user) return [];

      const { data: userData } = await this.supabase.client
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!userData?.organization_id) return [];

      const { data, error } = await this.supabase.client
        .from('users')
        .select('id, name, email, is_admin, created_at')
        .eq('organization_id', userData.organization_id)
        .order('name');

      if (error) {
        console.error('Error fetching organization members:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.warn('Organization members not available (migration pending)');
      return [];
    }
  }

  /**
   * Prüfen ob aktueller User Admin ist
   * Graceful degradation: Falls is_admin Spalte nicht existiert, return false
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const user = await this.supabase.currentUser;
      if (!user) return false;

      const { data } = await this.supabase.client
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      return data?.is_admin || false;
    } catch (error) {
      console.warn('Admin check not available (migration pending)');
      return false;
    }
  }

  /**
   * User zum Admin machen
   * Graceful degradation: Falls is_admin Spalte nicht existiert, return false
   */
  async promoteToAdmin(userId: string): Promise<boolean> {
    try {
      const isAdmin = await this.isCurrentUserAdmin();
      if (!isAdmin) {
        console.error('Only admins can promote users');
        return false;
      }

      const { error } = await this.supabase.client
        .from('users')
        .update({ is_admin: true })
        .eq('id', userId);

      if (error) {
        console.error('Error promoting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.warn('Admin promotion not available (migration pending)');
      return false;
    }
  }

  /**
   * Organization-Statistiken abrufen
   * Graceful degradation: Falls organization_stats View nicht existiert, return null
   */
  async getOrganizationStats(): Promise<OrganizationStats | null> {
    try {
      const org = await this.getCurrentUserOrganization();
      if (!org) return null;

      const { data, error } = await this.supabase.client
        .from('organization_stats')
        .select('*')
        .eq('organization_id', org.id)
        .single();

      if (error) {
        console.error('Error fetching organization stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Organization stats not available (migration pending)');
      return null;
    }
  }
}
