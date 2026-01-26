# Contributing to JivaDesk

Thank you for considering contributing to JivaDesk! This document provides guidelines for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help make JivaDesk better for healthcare providers in India

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with:
   - Clear use case description
   - Expected behavior
   - Why this feature is important for clinics in India
   - Optional: mockups or examples

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Copy `.env.example` to `.env` and configure
4. Run setup script: `npm run setup` (optional)
5. Start development server: `npm run dev`

## Code Style

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code patterns
- Keep functions small and focused

## Testing

- Add tests for new features
- Ensure all tests pass before submitting PR
- Test India-specific features (GST, phone numbers, etc.)

## Commit Messages

Use clear, descriptive commit messages:
- `feat: Add patient search functionality`
- `fix: Correct GST calculation for multi-item invoices`
- `docs: Update API documentation`
- `refactor: Simplify appointment controller`

## Areas for Contribution

### High Priority
- Multi-language support (Hindi, Tamil, etc.)
- SMS/Email notification system
- Payment gateway integration (Razorpay, PayU)
- Mobile app development
- Prescription templates

### Medium Priority
- Advanced analytics dashboard
- Multi-clinic support
- Inventory management
- Lab integration
- Patient portal

### Good First Issues
- UI improvements
- Documentation updates
- Test coverage improvements
- Bug fixes

## Questions?

Feel free to create an issue or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
