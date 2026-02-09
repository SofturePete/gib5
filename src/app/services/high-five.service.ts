import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { HighFive, CreateHighFive, WeeklyStats } from '../models/high-five.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class HighFiveService {
  constructor(private supabase: SupabaseService) {}

  async giveHighFive(highFive: CreateHighFive): Promise<HighFive> {
    const currentUser = this.supabase.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('high_fives')
      .insert([
        {
          from_user_id: currentUser.id,
          to_user_id: highFive.to_user_id,
          message: highFive.message
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getReceivedHighFives(): Promise<HighFive[]> {
    const currentUser = this.supabase.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('high_fives')
      .select(`
        *,
        from_user:users!high_fives_from_user_id_fkey(name, email)
      `)
      .eq('to_user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getGivenHighFives(): Promise<HighFive[]> {
    const currentUser = this.supabase.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('high_fives')
      .select(`
        *,
        to_user:users!high_fives_to_user_id_fkey(name, email)
      `)
      .eq('from_user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAllUsers(): Promise<User[]> {
    const currentUser = this.supabase.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('users')
      .select('*')
      .neq('id', currentUser.id)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async getWeeklyStats(): Promise<WeeklyStats[]> {
    const currentUser = this.supabase.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    // Get all high-fives for current week
    const { data: highFives, error } = await this.supabase.client
      .from('high_fives')
      .select('from_user_id, to_user_id')
      .gte('created_at', monday.toISOString());

    if (error) throw error;

    // Get all users
    const { data: users } = await this.supabase.client
      .from('users')
      .select('id, name');

    if (!users) return [];

    // Calculate stats
    const stats = users.map(user => {
      const given = highFives?.filter(hf => hf.from_user_id === user.id).length || 0;
      const received = highFives?.filter(hf => hf.to_user_id === user.id).length || 0;

      return {
        user_id: user.id,
        user_name: user.name,
        given_count: given,
        received_count: received,
        week_start: monday.toISOString()
      };
    });

    return stats;
  }

  async getMyWeeklyStats(): Promise<{ given: number; received: number; needsToGive: boolean }> {
    const currentUser = this.supabase.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    // Get given high-fives this week
    const { data: given } = await this.supabase.client
      .from('high_fives')
      .select('id')
      .eq('from_user_id', currentUser.id)
      .gte('created_at', monday.toISOString());

    // Get received high-fives this week
    const { data: received } = await this.supabase.client
      .from('high_fives')
      .select('id')
      .eq('to_user_id', currentUser.id)
      .gte('created_at', monday.toISOString());

    const givenCount = given?.length || 0;
    const receivedCount = received?.length || 0;

    return {
      given: givenCount,
      received: receivedCount,
      needsToGive: givenCount === 0
    };
  }

  async getUserProfile(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  }
}
