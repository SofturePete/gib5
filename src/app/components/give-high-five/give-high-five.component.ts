import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HighFiveService } from '../../services/high-five.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-give-high-five',
  templateUrl: './give-high-five.component.html',
  styleUrls: ['./give-high-five.component.scss']
})
export class GiveHighFiveComponent implements OnInit {
  users: User[] = [];
  selectedUserId = '';
  message = '';
  loading = false;
  error = '';
  success = false;

  predefinedMessages = [
    'Great job on the project! 🎉',
    'Thanks for your help! 🙏',
    'You\'re awesome! ⭐',
    'Keep up the excellent work! 💪',
    'Amazing teamwork! 🤝'
  ];

  constructor(
    private highFiveService: HighFiveService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    try {
      this.users = await this.highFiveService.getAllUsers();
    } catch (error) {
      console.error('Error loading users:', error);
      this.error = 'Failed to load users';
    }
  }

  usePredefinedMessage(message: string) {
    this.message = message;
  }

  async onSubmit() {
    if (!this.selectedUserId || !this.message.trim()) {
      this.error = 'Please select a user and enter a message';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.highFiveService.giveHighFive({
        to_user_id: this.selectedUserId,
        message: this.message.trim()
      });

      this.success = true;
      
      // Reset form
      setTimeout(() => {
        this.selectedUserId = '';
        this.message = '';
        this.success = false;
        this.router.navigate(['/dashboard']);
      }, 2000);
    } catch (error: any) {
      this.error = error.message || 'Failed to give high-five';
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
