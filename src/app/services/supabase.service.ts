import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject: BehaviorSubject<SupabaseUser | null>;
  public currentUser$: Observable<SupabaseUser | null>;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    this.currentUserSubject = new BehaviorSubject<SupabaseUser | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    // Check for existing session
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUserSubject.next(data.session?.user ?? null);
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserSubject.next(session?.user ?? null);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  get currentUser(): SupabaseUser | null {
    return this.currentUserSubject.value;
  }

  async signUp(email: string, password: string, name: string) {
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await this.supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            name
          }
        ]);

      if (profileError) throw profileError;
    }

    return authData;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
}
