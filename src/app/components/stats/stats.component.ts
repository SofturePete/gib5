import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HighFiveService } from '../../services/high-five.service';
import { WeeklyStats } from '../../models/high-five.model';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
  weeklyStats: WeeklyStats[] = [];
  loading = true;
  currentWeekStart: string = '';

  constructor(
    private highFiveService: HighFiveService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadStats();
  }

  async loadStats() {
    this.loading = true;
    try {
      this.weeklyStats = await this.highFiveService.getWeeklyStats();
      if (this.weeklyStats.length > 0) {
        this.currentWeekStart = this.formatWeekStart(this.weeklyStats[0].week_start);
      }
      
      // Sort by received count (descending)
      this.weeklyStats.sort((a, b) => b.received_count - a.received_count);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatWeekStart(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getUserStatus(stats: WeeklyStats): { icon: string; text: string; class: string } {
    if (stats.received_count >= 1 && stats.given_count >= 1) {
      return { icon: '🌟', text: 'All Goals Met', class: 'text-green-600' };
    } else if (stats.received_count >= 1) {
      return { icon: '✅', text: 'Received Goal Met', class: 'text-blue-600' };
    } else if (stats.given_count >= 1) {
      return { icon: '👋', text: 'Has Given', class: 'text-yellow-600' };
    } else {
      return { icon: '⚠️', text: 'Needs Attention', class: 'text-red-600' };
    }
  }

  getTotalGiven(): number {
    return this.weeklyStats.reduce((sum, stat) => sum + stat.given_count, 0);
  }

  getTotalReceived(): number {
    return this.weeklyStats.reduce((sum, stat) => sum + stat.received_count, 0);
  }

  getGoalAchievers(): number {
    return this.weeklyStats.filter(stat => stat.received_count >= 1).length;
  }
}
