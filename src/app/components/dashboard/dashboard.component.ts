import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { HighFiveService } from '../../services/high-five.service';
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

  constructor(
    public supabase: SupabaseService,
    public highFiveService: HighFiveService,
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
      }

      // Load recent received high-fives
      const received = await this.highFiveService.getReceivedHighFives();
      this.recentHighFives = received.slice(0, 5);

      // Load weekly stats
      this.weeklyStats = await this.highFiveService.getMyWeeklyStats();
    } catch (error) {
      console.error('Error loading data:', error);
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

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}
