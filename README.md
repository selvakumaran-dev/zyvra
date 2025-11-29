# Zyvra HR - Enterprise Human Resource Management System

Zyvra HR is a comprehensive, enterprise-grade Human Resource Management System (HRMS) designed to streamline HR operations, from recruitment to retirement. Built with the MERN stack (MongoDB, Express, React, Node.js), it offers a modern, responsive, and intuitive user experience.

## 🚀 Key Features

### 🏢 Core HR
- **Employee Management**: Centralized database for employee records.
- **Organization Chart**: Visual hierarchy of the organization.
- **Department & Role Management**: Flexible structure configuration.

### 💼 Operations
- **Payroll Management**: Automated salary processing, tax calculations, and payslip generation.
- **Attendance Tracking**: Real-time check-in/out, overtime calculation, and timesheets.
- **Leave Management**: Leave requests, approvals, and balance tracking.

### 🎯 Talent Management
- **Recruitment (ATS)**: Kanban-style applicant tracking system.
- **Performance**: 360-degree reviews, goal tracking, and performance analytics.
- **Onboarding**: Automated workflows for new hires.

### 📊 Intelligence & Tools
- **Global Search**: Cmd+K powered search across the entire platform.
- **Analytics Dashboard**: Executive-level insights with interactive charts.
- **Report Builder**: Custom PDF report generation wizard.
- **Workflow Automation**: Visual drag-and-drop automation builder.
- **Notification Center**: Real-time alerts and updates.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS (optional), Recharts, React Flow, Framer Motion.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Authentication**: JWT, Role-based Access Control (RBAC).
- **Tools**: Docker, GitHub Actions (CI/CD), Swagger (API Docs).

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zyvra-hr.git
   cd zyvra-hr
   ```

2. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   - Create `.env` in `server/` based on `.env.example`.
   - Create `.env` in `client/` if needed.

4. **Run the Application**
   ```bash
   # Run in development mode (concurrently)
   npm run dev
   ```

## 🐳 Docker Support

Run the entire stack with a single command:
```bash
docker-compose up --build
```

## 📄 License

This project is licensed under the MIT License.
