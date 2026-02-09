# 🤝 Contributing to gib5

First off, thanks for taking the time to contribute! 🙌

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment** (browser, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and expected behavior**
- **Explain why this enhancement would be useful**

### Pull Requests

1. **Fork the repo** and create your branch from `main`
2. **Make your changes**
3. **Add tests** if applicable
4. **Update documentation** if needed
5. **Ensure tests pass**
6. **Make sure your code follows the style guidelines**
7. **Write a good commit message**

## 🔧 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/gib5.git
cd gib5

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm start
```

## 📝 Style Guide

### TypeScript

- Use TypeScript for all new files
- Enable strict mode
- Use meaningful variable names
- Add JSDoc comments for complex functions

```typescript
/**
 * Calculates weekly statistics for all users
 * @returns Promise with array of weekly stats
 */
async getWeeklyStats(): Promise<WeeklyStats[]> {
  // Implementation
}
```

### Angular

- Follow [Angular Style Guide](https://angular.io/guide/styleguide)
- Use reactive programming with RxJS
- Components should be focused and single-purpose
- Use services for business logic

### CSS/SCSS

- Use Tailwind utility classes
- Custom styles only when necessary
- Follow BEM naming for custom CSS
- Keep styles component-scoped

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests

Good examples:
```
Add user profile component
Fix high-five notification bug (#123)
Update README with deployment instructions
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e

# Run tests with coverage
npm test -- --coverage
```

All pull requests should include tests for new features.

## 📚 Documentation

- Update README.md if you change functionality
- Update SUPABASE_SETUP.md for database changes
- Add JSDoc comments for public APIs
- Update CHANGELOG.md for notable changes

## 🎯 Feature Ideas

Here are some ideas for future enhancements:

### High Priority
- [ ] PWA support with offline mode
- [ ] Push notifications
- [ ] Mobile app (Ionic/Capacitor)
- [ ] Dark mode
- [ ] Multiple languages (i18n)

### Medium Priority
- [ ] Custom high-five categories
- [ ] Badges/achievements system
- [ ] Monthly/yearly statistics
- [ ] Export statistics to PDF
- [ ] Integration with Slack/Teams

### Low Priority
- [ ] Animated high-five reactions
- [ ] GIF support in messages
- [ ] Team challenges
- [ ] Admin dashboard
- [ ] Custom themes

## 🐛 Bug Bounty Ideas

### UI/UX Improvements
- Mobile responsiveness issues
- Accessibility improvements
- Loading state optimizations
- Error message clarity

### Performance
- Query optimization
- Bundle size reduction
- Caching strategies
- Image optimization

## 📋 Project Structure

Understanding the project structure:

```
gib5/
├── src/app/
│   ├── components/       # UI components
│   ├── services/         # Business logic & API calls
│   ├── models/           # TypeScript interfaces
│   ├── guards/           # Route guards
│   └── app-routing.module.ts
├── supabase/
│   ├── schema.sql        # Database schema
│   ├── seed.sql          # Sample data
│   └── functions/        # Edge Functions
└── docs/                 # Additional documentation
```

## 🔍 Code Review Process

All submissions require review. We use GitHub pull requests:

1. Submit PR from your fork
2. CI/CD runs tests automatically
3. Maintainer reviews code
4. Discuss and make changes if needed
5. Maintainer merges PR

## 📊 Performance Guidelines

- Keep bundle size under 500KB
- Aim for Lighthouse score >90
- Optimize images (use WebP when possible)
- Lazy load routes and modules
- Use OnPush change detection

## 🔒 Security Guidelines

- Never commit secrets or API keys
- Use environment variables
- Validate all user inputs
- Sanitize data before display
- Follow OWASP guidelines

## ❓ Questions?

Feel free to:
- Open an issue
- Join our Discord (coming soon)
- Email: contribute@gib5.app

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🎉 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Invited to contributor Discord channel

Thank you for making gib5 better! 🙌
