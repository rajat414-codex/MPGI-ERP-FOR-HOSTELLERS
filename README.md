# MPGI Hostel Management ERP

Institutional hostel portal for managing student accommodations, meal timetables, leave requests, and administrative operations.

## Key Modules

### 1. Student Room Allotment
- View allotted room number, bed identifier, hostel block, and floor.
- Displays assigned roommate information and contact numbers.
- One-click official room allotment slip generation with verification details.
- Submit digital requests for room change or re-allotment.

### 2. 7-Day Mess Timetable & Lunch Schedule
- Complete weekly dining schedule for breakfast, lunch, evening refreshments, and dinner.
- Dynamic indicator showing the currently active meal service.
- Detailed daily lunch breakdown (including dal, seasonal vegetables, bread, rice, and sides).
- Central dining hall rules and meal guidelines.

### 3. Hostel Routine & Attendance
- Daily schedule including morning call, academic sessions, study hours, and roll-call.
- Evening 9:00 PM mandatory biometric and attendance recording.
- Gate curfew tracking (10:00 PM).

### 4. Leave & Outpass Processing
- Online submission for home visits, outings, and medical leave.
- HOD / Warden review with status updates and approval remarks.

### 5. Administrative Console (HOD / Dean)
- Separate management views for male and female hostels.
- Room allocation management: update room numbers, bed assignments, and roommate pairings.
- Add and onboard new hostellers.
- Edit daily mess and lunch menus for any day of the week.
- Publish notices and announcements directly to student dashboards.

## Quick Start

### Installation
```bash
npm install
```

### Starting the Server
```bash
npm start
```

Open http://localhost:5000 in your web browser. The portal also functions offline by opening index.html directly.

## Default Demo Credentials
- Student (Male): ID `STU-M-101`, Password `123`
- Student (Female): ID `STU-F-201`, Password `123`
- HOD / Dean: Select Hostel Wing, Password `admin123`

## License
Distributed under the MIT License.
