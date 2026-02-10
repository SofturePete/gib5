import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HighFiveService } from '../../services/high-five.service';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-give-high-five',
    templateUrl: './give-high-five.component.html',
    styleUrls: ['./give-high-five.component.scss'],
    standalone: false
})
export class GiveHighFiveComponent implements OnInit {
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  users: User[] = [];
  message = '';
  loading = false;
  error = '';
  success = false;

  // @-mention system
  mentionedUsers: User[] = [];
  showSuggestions = false;
  mentionQuery = '';
  selectedIndex = 0;
  filteredUsers: User[] = [];

  predefinedMessages = [
    'Great job on the project! 🎉',
    'Thanks for your help! 🙏',
    'You\'re awesome! ⭐',
    'Keep up the excellent work! 💪',
    'Amazing teamwork! 🤝'
  ];

  constructor(
    public highFiveService: HighFiveService,
    public router: Router
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

  handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const text = target.value;
    const pos = target.selectionStart || 0;

    // Find last @ before cursor
    const textBeforeCursor = text.substring(0, pos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex >= 0) {
      const afterAt = textBeforeCursor.substring(lastAtIndex + 1);

      // Only show suggestions if no space or newline after @
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        this.mentionQuery = afterAt.toLowerCase();
        this.updateFilteredUsers();
        this.showSuggestions = true;
        this.selectedIndex = 0;
        return;
      }
    }

    this.showSuggestions = false;
  }

  handleKeydown(event: KeyboardEvent) {
    if (!this.showSuggestions || this.filteredUsers.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredUsers.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    } else if (event.key === 'Enter' && this.filteredUsers.length > 0) {
      event.preventDefault();
      this.selectUser(this.filteredUsers[this.selectedIndex]);
    } else if (event.key === 'Escape') {
      this.showSuggestions = false;
    }
  }

  updateFilteredUsers() {
    if (!this.mentionQuery) {
      this.filteredUsers = this.users.slice(0, 5);
    } else {
      this.filteredUsers = this.users
        .filter(u =>
          u.name.toLowerCase().includes(this.mentionQuery) ||
          u.email.toLowerCase().includes(this.mentionQuery)
        )
        .slice(0, 5);
    }
  }

  selectUser(user: User) {
    // Add to mentioned users if not already mentioned
    if (!this.mentionedUsers.find(u => u.id === user.id)) {
      this.mentionedUsers.push(user);
    }

    // Replace @query with @Name in message
    const textarea = this.messageInput.nativeElement;
    const text = this.message;
    const pos = textarea.selectionStart || 0;
    const textBefore = text.substring(0, pos);
    const lastAtIndex = textBefore.lastIndexOf('@');
    const beforeMention = text.substring(0, lastAtIndex);
    const afterCursor = text.substring(pos);

    this.message = `${beforeMention}@${user.name} ${afterCursor}`;
    this.showSuggestions = false;

    // Focus back on textarea
    setTimeout(() => {
      textarea.focus();
      const newPos = lastAtIndex + user.name.length + 2; // @ + name + space
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  removeMention(userId: string) {
    const user = this.mentionedUsers.find(u => u.id === userId);
    if (user) {
      // Remove @Name from message
      const regex = new RegExp(`@${user.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g');
      this.message = this.message.replace(regex, '');
      this.mentionedUsers = this.mentionedUsers.filter(u => u.id !== userId);
    }
  }

  getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  usePredefinedMessage(msg: string) {
    this.message = msg;
  }

  get canSend(): boolean {
    return this.message.trim().length > 0 && this.mentionedUsers.length > 0;
  }

  async onSubmit() {
    if (!this.canSend) {
      this.error = 'Please mention at least one person with @ and enter a message';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      // Send high-five to each mentioned user
      for (const user of this.mentionedUsers) {
        await this.highFiveService.giveHighFive({
          to_user_id: user.id,
          message: this.message.trim()
        });
      }

      this.success = true;

      // Reset form
      setTimeout(() => {
        this.message = '';
        this.mentionedUsers = [];
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
