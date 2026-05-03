A full-stack Team Task Management Web Application built using the MERN Stack (MongoDB, Express, React, Node.js).
It allows users to manage projects, assign tasks, and track progress efficiently.

🌐 Frontend: https://team-task-managaer.vercel.app
🔗 Backend API: https://team-task-manager-backend-bvvr.onrender.com

Frontend
React.js
Axios
CSS
Backend
Node.js
Express.js
MongoDB (Mongoose)
JWT Authentication
Deployment
Frontend → Vercel
Backend → Render

✨ Features
🔐 User Authentication (Signup/Login)
📁 Create & Manage Projects
✅ Create, Update, Delete Tasks
👥 Assign tasks to team members
📊 Track task status
🔑 Secure API using JWT

📂 Project Structure
frontend/
└── src/
    │
    ├── App.js                          # Root component + routing
    ├── index.js                        # React DOM entry point
    │
    ├── styles/
    │   └── globals.css                 # ← GLOBAL: design tokens, buttons, cards,
    │                                   #   badges, modals, inputs, animations
    │
    ├── api/
    │   └── axios.js                    # No CSS
    │
    ├── context/
    │   └── AuthContext.js              # No CSS
    │
    ├── components/
    │   ├── Layout.js  ←───────────────── Layout.css
    │   ├── Layout.css                  #   .app-layout, .app-main
    │   │
    │   ├── Sidebar.js ←───────────────── Sidebar.css
    │   ├── Sidebar.css                 #   .sidebar, .nav-item, .sidebar-brand,
    │   │                               #   .user-avatar, .logout-btn
    │   │
    │   ├── TaskCard.js ←──────────────── TaskCard.css
    │   ├── TaskCard.css                #   .task-card, .task-priority-bar,
    │   │                               #   .task-footer, .status-menu
    │   │
    │   ├── TaskModal.js                # Uses globals.css only (modal, form-group etc)
    │   └── PrivateRoute.js             # No CSS
    │
    └── pages/
        ├── Auth.js    ←───────────────── Auth.css
        ├── Auth.css                    #   .auth-page, .auth-left, .auth-right,
        │                               #   .auth-form-card, .auth-tabs, .input-wrap
        │
        ├── Dashboard.js ←─────────────── Dashboard.css
        ├── Dashboard.css               #   .stat-cards, .kanban-board (dashboard),
        │                               #   .progress-bar, .recent-tasks
        │
        ├── Projects.js ←──────────────── Projects.css
        ├── Projects.css                #   .projects-grid, .project-card,
        │                               #   .color-picker, .modal-actions
        │
        ├── ProjectDetail.js ←─────────── ProjectDetail.css
        └── ProjectDetail.css           #   .kanban-board, .kanban-col,
                                        #   .detail-header, .team-list


⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/prakash182/your-repo-name.git
cd Team_Task_Manager
2️⃣ Setup Backend
cd backend
npm install
Create .env file
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
Run backend
npm run dev
3️⃣ Setup Frontend
cd frontend
npm install
Create .env file
REACT_APP_API_URL=http://localhost:5000/api
Run frontend
npm start


🔗 API Endpoints
Auth
POST /api/auth/signup
POST /api/auth/login
Projects
GET /api/projects
POST /api/projects
Tasks
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id

🚀 Deployment
Frontend (Vercel)
Root Directory → frontend
Add ENV:
REACT_APP_API_URL=https://your-backend-url/api
Backend (Render)
Add ENV variables:
MONGO_URI=...
JWT_SECRET=...
