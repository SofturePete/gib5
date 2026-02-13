import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { HighFiveService } from '../../services/high-five.service';
import { OrganizationService } from '../../services/organization.service';
import { HighFive } from '../../models/high-five.model';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: false
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  recentHighFives: HighFive[] = [];
  weeklyStats = {
    given: 0,
    received: 0,
    needsToGive: true
  };
  loading = true;
  organizationName: string | null = null;

  constructor(
    public supabase: SupabaseService,
    public highFiveService: HighFiveService,
    private orgService: OrganizationService,
    public router: Router
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const authUser = this.supabase.currentUser;
      if (authUser) {
        this.currentUser = await this.highFiveService.getUserProfile(authUser.id);
        
        // Organization laden (optional - funktioniert auch ohne Migration)
        try {
          const org = await this.orgService.getCurrentUserOrganization();
          this.organizationName = org?.name || null;
        } catch (error) {
          console.warn('Organization feature not available:', error);
          this.organizationName = null;
        }
      }

      // Letzte empfangene High-Fives laden
      const received = await this.highFiveService.getReceivedHighFives();
      this.recentHighFives = received.slice(0, 5);

      // Wochenstatistiken laden
      this.weeklyStats = await this.highFiveService.getMyWeeklyStats();
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      this.loading = false;
    }
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }

  navigateToGiveHighFive() {
    this.router.navigate(['/give']);
  }

  navigateToHistory() {
    this.router.navigate(['/history']);
  }

  navigateToStats() {
    this.router.navigate(['/stats']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    
    // Format: 13.02.2026
    return date.toLocaleDateString('de-DE');
  }
}
