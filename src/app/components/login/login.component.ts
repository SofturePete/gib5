import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { OrganizationService, Organization } from '../../services/organization.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  isSignUp = false;
  email = '';
  password = '';
  name = '';
  loading = false;
  error = '';
  
  // Multi-Tenancy
  organizations: Organization[] = [];
  selectedOrgId: string = '';
  createNewOrg = false;
  newOrgName = '';
  newOrgDomain = '';
  suggestedOrg: Organization | null = null;

  constructor(
    public supabase: SupabaseService,
    private orgService: OrganizationService,
    public router: Router
  ) {}

  async ngOnInit() {
    await this.loadOrganizations();
  }

  async loadOrganizations() {
    try {
      this.organizations = await this.orgService.getAllOrganizations();
    } catch (error) {
      console.warn('Organizations not available (migration pending)');
      this.organizations = [];
    }
  }

  async onEmailChange() {
    if (this.isSignUp && this.email.includes('@')) {
      // Auto-Suggest Organization basierend auf Email-Domain
      try {
        this.suggestedOrg = await this.orgService.getOrganizationByEmail(this.email);
        if (this.suggestedOrg) {
          this.selectedOrgId = this.suggestedOrg.id;
        }
      } catch (error) {
        console.warn('Organization suggestion not available (migration pending)');
        this.suggestedOrg = null;
      }
    }
  }

  async onSubmit() {
    this.error = '';
    this.loading = true;

    try {
      if (this.isSignUp) {
        // 1. Account erstellen
        const user = await this.supabase.signUp(this.email, this.password, this.name);
        
        if (!user) {
          throw new Error('Registrierung fehlgeschlagen');
        }

        // 2. Organization zuweisen oder erstellen (optional - funktioniert auch ohne Migration)
        try {
          let orgId = this.selectedOrgId;
          
          if (this.createNewOrg) {
            const newOrg = await this.orgService.createOrganization(
              this.newOrgName,
              this.newOrgDomain
            );
            if (newOrg) {
              orgId = newOrg.id;
            }
          }

          if (orgId) {
            await this.orgService.assignUserToOrganization(user.user!.id, orgId);
          }
        } catch (orgError) {
          console.warn('Organization assignment skipped (migration pending):', orgError);
          // Kein Problem - App funktioniert auch ohne Organization
        }

        this.error = 'Account erstellt! Bitte prüfe deine E-Mails zur Verifizierung.';
      } else {
        // Login
        await this.supabase.signIn(this.email, this.password);
        this.router.navigate(['/dashboard']);
      }
    } catch (error: any) {
      this.error = error.message || 'Ein Fehler ist aufgetreten';
      
      // Deutsche Error-Messages
      if (error.message?.includes('Invalid credentials')) {
        this.error = 'Ungültige Anmeldedaten';
      } else if (error.message?.includes('Email not confirmed')) {
        this.error = 'Bitte bestätige zuerst deine E-Mail-Adresse';
      }
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
    this.selectedOrgId = '';
    this.createNewOrg = false;
    this.suggestedOrg = null;
  }

  toggleCreateOrg() {
    this.createNewOrg = !this.createNewOrg;
    if (!this.createNewOrg) {
      this.newOrgName = '';
      this.newOrgDomain = '';
    }
  }
}
