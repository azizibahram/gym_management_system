# Energy Gym Management System (MIS)

A modern web-based Management Information System for Energy Gym, built with React frontend and Django REST API backend.

## Features

- **Admin Dashboard**: Statistics overview with charts, fee deadline alerts, and key metrics
- **Athlete Management**: Register, edit, and manage gym members with photo uploads
- **Shelf Management**: Manage lockers/lockers assignment to athletes
- **Fee Tracking**: Automatic fee calculation, deadline monitoring, and payment tracking
- **Modern UI**: Responsive design with Material UI components and color-coded alerts

## Tech Stack

### Backend
- **Django** - Web framework
- **Django REST Framework** - API development
- **JWT Authentication** - Secure token-based auth
- **SQLite** - Database (easily switchable to PostgreSQL)
- **Pillow** - Image handling

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Material UI** - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Start server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Usage

1. Access the application at `http://localhost:5173`
2. Login with admin credentials
3. Navigate through Dashboard, Athletics Management, and Shelf Management
4. Register athletes, assign shelves, and monitor fees

## API Endpoints

- `POST /api/token/` - Obtain JWT token
- `GET /api/dashboard/` - Dashboard statistics
- `GET/POST/PUT/DELETE /api/athletes/` - Athlete CRUD
- `GET/POST/PUT/DELETE /api/shelves/` - Shelf CRUD

## Project Structure

```
EnergyGymSystem/
├── backend/                 # Django backend
│   ├── gymsystem/          # Django project settings
│   ├── gym/                # Main app
│   └── manage.py
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   └── App.tsx
│   └── package.json
├── .gitignore
└── README.md
```

## Key Business Rules

- Single admin user (no athlete login)
- Fee calculation: Fitness (1000 AFN), Bodybuilding (700 AFN)
- Automatic 30-day fee deadline from registration
- Color-coded urgency: Green (16-30 days), Orange (6-15 days), Red (0-5 days)
- Shelves are assigned to athletes (lockers)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License.