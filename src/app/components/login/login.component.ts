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
    this.organizations = await this.orgService.getAllOrganizations();
  }

  async onEmailChange() {
    if (this.isSignUp && this.email.includes('@')) {
      // Auto-Suggest Organization basierend auf Email-Domain
      this.suggestedOrg = await this.orgService.getOrganizationByEmail(this.email);
      if (this.suggestedOrg) {
        this.selectedOrgId = this.suggestedOrg.id;
      }
    }
  }

  async onSubmit() {
    this.error = '';
    this.loading = true;

    try {
      if (this.isSignUp) {
        // 1. Account erstellen
        const userId = await this.supabase.signUp(this.email, this.password, this.name);
        
        if (!userId) {
          throw new Error('Registrierung fehlgeschlagen');
        }

        // 2. Organization zuweisen oder erstellen
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
          await this.orgService.assignUserToOrganization(userId, orgId);
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
