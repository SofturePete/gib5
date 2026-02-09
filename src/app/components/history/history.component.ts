import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HighFiveService } from '../../services/high-five.service';
import { HighFive } from '../../models/high-five.model';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    standalone: false
})
export class HistoryComponent implements OnInit {
  receivedHighFives: HighFive[] = [];
  givenHighFives: HighFive[] = [];
  activeTab: 'received' | 'given' = 'received';
  loading = true;

  constructor(
    private highFiveService: HighFiveService,
    public router: Router
  ) {}

  async ngOnInit() {
    await this.loadHistory();
  }

  async loadHistory() {
    this.loading = true;
    try {
      [this.receivedHighFives, this.givenHighFives] = await Promise.all([
        this.highFiveService.getReceivedHighFives(),
        this.highFiveService.getGivenHighFives()
      ]);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      this.loading = false;
    }
  }

  setActiveTab(tab: 'received' | 'given') {
    this.activeTab = tab;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
