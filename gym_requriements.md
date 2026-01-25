Energy Gym Management System (Web Application)

Gym Name: Energy Gym
Application Type: Web Application
Users: Single Admin Only (No Athlete Login)
Frontend: React.js
Backend: Django (Django REST Framework)

1. System Overview

The Energy Gym Management System is a web-based admin system for Energy Gym that allows a single administrator to manage athlete registrations, shelves (lockers), gym fees, and statistics.

⚠️ Important Note:

Athletes do NOT have accounts

Only the admin can log in and use the system

The system emphasizes modern UI, simplicity, clarity, and fast workflow.

2. Authentication
Admin Login (Only One User)

Secure admin login

Username / Email + Password

JWT / session-based authentication

Logout functionality

3. Admin Dashboard
3.1 Dashboard Overview

The dashboard is the central control panel and must include:

Statistics Cards

Total athletes

Active athletes

Fitness members

Bodybuilding members

Total income (AFN)

Shelves:

Total shelves

Available shelves

Assigned shelves

Visual Elements

Charts (monthly income, gym type distribution)

Clean card layout

Modern icons

3.2 Fee Deadline Alerts (NEW)
Critical Fee Countdown Section

A dedicated section on the dashboard that displays:

Athletes with ≤ 3 days remaining to pay fees

Displayed as:

Table or alert list

Athlete name

Remaining days

Gym type

Highlighted clearly (red theme)

This section helps the admin take immediate action.

3.3 Dashboard Badges (NEW)

Badges displayed on dashboard cards to show:

Number of athletes with overdue/near-expiry fees

Number of available shelves

Number of assigned shelves

Badges improve visibility and quick understanding.

4. Navigation (Sidebar / Topbar)

Main navigation tabs:

Dashboard

Registration

Athletics Management

Shelf Management

Each tab may show notification badges when action is required.

5. Athlete Registration (Admin Only)
Registration Form Fields

Full Name
Father Name

Athlete Photo (upload)

Registration Date

Fee Start Date (auto on registration)

Fee Deadline Date (auto-calculated, e.g., 30 days)

Gym Time:

Morning

Afternoon

Night

Type of Gym:

Fitness – 1000 AFN

Bodybuilding – 700 AFN

Discount (optional)

Final Fee (auto-calculated)

Shelf Assignment (optional)

Contact Number

Notes (optional)

6. Athletics Management
6.1 Athlete Table View

The athletics management tab includes a data table with:

Columns

Photo

Full Name

Gym Type

Gym Time

Shelf Number

Registration Date

Fee Deadline Date

Days Left (Countdown Column) 🔥

Status / Actions

6.2 Fee Countdown Logic (IMPORTANT)

The Days Left column must visually indicate fee urgency:

Days Left	Color Indicator	Meaning
30 – 16 days	🟢 Green	Safe
15 – 6 days	🟠 Orange	Warning
5 – 0 days	🔴 Red	Critical

Countdown is calculated automatically

Updates daily

Overdue fees are marked clearly

6.3 Athletics Management Features

Search athletes

Filter by:

Gym type

Gym time

Fee status

Edit athlete details

Delete athlete

Renew membership (resets fee deadline)

Reassign shelf

6.4 Badges in Athletics Management (NEW)

Badge showing number of athletes:

With ≤ 3 days left

Overdue fees

Visible on tab and table header

7. Shelf Management
Shelf Features

Create shelf (number/code)

Delete shelf

Assign shelf to athlete

Unassign shelf

Shelf status:

Available

Assigned

Shelf Management Badges (NEW)

Total shelves badge

Available shelves badge

Assigned shelves badge

Warning badge if shelves are almost full

These badges improve quick decision-making.

8. Fees & Income Management

Automatic fee calculation

Discount handling

Fee start & deadline tracking

Monthly income statistics

Renew fee button for athletes

9. Non-Functional Requirements
UI/UX

Modern and beautiful design

Smooth animations

Clean color palette

Responsive design

Clear color-coded indicators

Badge-based notifications

Security

Admin-only access

Protected APIs

Secure authentication

Input validation

Performance

Fast loading tables

Optimized images

Efficient filtering/search

10. Technology Stack
Frontend

React.js

Material UI / Ant Design / Tailwind CSS

Axios

Chart.js / Recharts

Backend

Django

Django REST Framework

PostgreSQL / SQLite

JWT Authentication

Media handling for photos

11. Database Entities (Simplified)
Admin

Username

Password

Athlete

Full Name

Photo

Gym Type

Gym Time

Registration Date

Fee Start Date

Fee Deadline Date

Days Left (calculated)

Discount

Final Fee

Contact Number

Shelf (FK)

Shelf

Shelf Number

Status

Assigned Athlete

12. Key Business Rules (Summary)

Only admin can log in

No athlete login

Fee countdown updates automatically

Color-coded urgency indicators

Dashboard alerts for ≤ 3 days

Badge-based UX improvements