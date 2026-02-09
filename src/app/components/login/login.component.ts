import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isSignUp = false;
  email = '';
  password = '';
  name = '';
  loading = false;
  error = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async onSubmit() {
    this.error = '';
    this.loading = true;

    try {
      if (this.isSignUp) {
        await this.supabase.signUp(this.email, this.password, this.name);
        this.error = 'Account created! Please check your email to verify your account.';
      } else {
        await this.supabase.signIn(this.email, this.password);
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred';
    } finally {
      this.loading = false;
    }
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.error = '';
    this.email = '';
    this.password = '';
    this.name = '';
  }
}
