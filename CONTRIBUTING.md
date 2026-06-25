# Contributing

Contributions are welcome! Here's how to get started:

## Development Setup

1. Fork the repo
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/energy_gym_mis.git
   ```
3. Copy `.env.example` to `.env` and adjust values
4. Set up backend:
   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   source .venv/bin/activate  # macOS/Linux
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```
5. Set up frontend (separate terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
6. Open http://localhost:5173

## Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run tests: `cd backend && python manage.py test`
4. Run lint: `cd frontend && npm run lint`
5. Commit with a descriptive message
6. Push and open a Pull Request

## Code Style

- Backend: Follow PEP 8, use Django REST Framework conventions
- Frontend: Follow TypeScript strict mode, use MUI sx prop for styling
- No commented-out code
- Keep components focused and reusable

## Pull Request Guidelines

- Reference the issue if applicable
- Include screenshots for UI changes
- Update tests if needed
- Keep PRs focused on a single change
