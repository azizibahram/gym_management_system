# Energy Gym Management System (MIS)

A comprehensive Management Information System (MIS) designed for Energy Gym, providing efficient management of gym operations through a modern web-based interface. Built with a React frontend and a robust Django REST API backend, this system streamlines athlete registration, fee tracking, and locker management.

## Features

- **Administrative Dashboard**: Comprehensive overview with statistical charts, automated fee deadline notifications, and key performance metrics
- **Athlete Management**: Complete athlete registration, editing, and management system with photo upload capabilities
- **Locker Management**: Efficient locker assignment and management for athletes
- **Fee Tracking System**: Automated fee calculation based on membership type, deadline monitoring, and payment status tracking
- **Modern User Interface**: Responsive design built with Material-UI components, featuring color-coded alerts and intuitive navigation
- **Secure Authentication**: JWT-based authentication with password change functionality

## Technology Stack

### Backend
- **Django**: High-level Python web framework for rapid development
- **Django REST Framework**: Powerful toolkit for building Web APIs
- **JWT Authentication**: Secure JSON Web Token-based authentication system
- **SQLite**: Lightweight database (configurable for PostgreSQL in production)
- **Pillow**: Python Imaging Library for image processing and handling

### Frontend
- **React**: Declarative JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript for enhanced code quality
- **Material-UI**: React components implementing Google's Material Design
- **Recharts**: Composable charting library built on React components
- **Axios**: Promise-based HTTP client for API communication
- **React Router**: Declarative routing for React applications

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
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

### Quick Setup (Windows)

For rapid deployment on Windows systems, execute the `start_servers.bat` script located in the project root directory. This automated script will initialize both the backend and frontend servers simultaneously and launch the application in your default web browser.

For manual configuration or cross-platform deployment, refer to the individual backend and frontend setup procedures outlined below.

## Usage Guide

1. **Access the Application**: Open your web browser and navigate to `http://localhost:5173`
2. **Administrator Login**: Authenticate using your admin credentials
3. **System Navigation**: Utilize the dashboard for an overview, manage athletes through the Athletes section, and handle locker assignments in the Shelves management area
4. **Core Operations**: Register new athletes, assign lockers, track membership fees, and monitor payment deadlines
5. **Account Management**: Update your password through the account settings for enhanced security

## API Reference

The system provides a RESTful API with the following key endpoints:

- `POST /api/token/` - Authenticate and obtain JWT access token
- `GET /api/dashboard/` - Retrieve dashboard statistics and metrics
- `GET/POST/PUT/DELETE /api/athletes/` - Full CRUD operations for athlete management
- `GET/POST/PUT/DELETE /api/shelves/` - Full CRUD operations for locker management
- `POST /api/change-password/` - Update administrator password

## Project Architecture

```
EnergyGymSystem/
├── backend/                    # Django REST API backend
│   ├── gymsystem/             # Django project configuration
│   │   ├── settings.py        # Project settings
│   │   ├── urls.py           # URL routing
│   │   └── wsgi.py           # WSGI configuration
│   ├── gym/                   # Main Django application
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API view logic
│   │   ├── serializers.py    # Data serialization
│   │   ├── admin.py          # Django admin configuration
│   │   └── migrations/       # Database migrations
│   ├── manage.py             # Django management script
│   ├── requirements.txt      # Python dependencies
│   └── server_run.bat        # Windows server startup script
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── context/          # React context providers
│   │   ├── App.tsx           # Main application component
│   │   └── main.tsx          # Application entry point
│   ├── package.json          # Node.js dependencies
│   ├── vite.config.ts        # Vite build configuration
│   └── tsconfig.json         # TypeScript configuration
├── start_servers.bat          # Automated startup script (Windows)
├── .gitignore                # Git ignore patterns
└── README.md                 # Project documentation
```

## Business Logic

- **Authentication Model**: Single administrator access (athlete self-service not implemented)
- **Membership Fees**: Fitness category (1000 AFN), Bodybuilding category (700 AFN)
- **Payment Deadlines**: Automatic 30-day grace period calculated from registration date
- **Status Indicators**: Color-coded payment urgency system:
  - Green: 16-30 days remaining
  - Orange: 6-15 days remaining
  - Red: 0-5 days remaining (critical)
- **Locker Assignment**: Lockers (referred to as shelves) are assigned exclusively to registered athletes

## Development

### Contributing Guidelines

We welcome contributions to improve the Energy Gym Management System. To contribute:

1. Fork the repository on GitHub
2. Create a feature branch from the main branch
3. Implement your changes with appropriate tests
4. Commit your changes following conventional commit standards
5. Push your branch and create a Pull Request
6. Ensure all tests pass and code follows the project's style guidelines

### Development Setup

For development contributions, ensure you have the prerequisites installed and follow the installation guide above. The project uses automated scripts for consistent environment setup.

## License

This project is licensed under the MIT License. See the LICENSE file for full terms and conditions.