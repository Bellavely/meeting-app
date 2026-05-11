Meeting Scheduler
A full-stack web application designed to manage meetings efficiently. This project features a React frontend and a Node.js backend, allowing users to handle meeting schedules with integrated Google Maps location tracking.🚀 FeaturesFull CRUD Operations: Create, read, update, and delete meetings seamlessly.Interactive UI: A modern React interface for managing your schedule.Map Integration: View the specific location of any meeting via Google Maps based on the provided address.Data Persistence: Robust storage using a SQL database.Validation: Basic input validation to ensure data integrity.🛠️ Tech StackFrontendReact: Functional components and Hooks for state management.CSS/SCSS: Styled components or modules for a clean layout.Google Maps SDK: For dynamic location rendering.BackendNode.js & Express: RESTful API architecture.SQL (PostgreSQL/MySQL): Relational database for structured meeting data.Cors & Dotenv: For environment management and cross-origin security.📋 Database SchemaThe meetings table includes the following structure:FieldTypeDescriptionidPrimary KeyUnique identifiertitleStringThe name/subject of the meetingdateDateScheduled datetimeTimeScheduled timeaddressStringPhysical location (for Maps)notesTextAdditional meeting details⚙️ Getting StartedPrerequisitesNode.js (v14+ recommended)SQL Database instanceGoogle Maps API KeyInstallationClone the repository:Bashgit clone https://github.com/your-username/meeting-scheduler.git
cd meeting-scheduler
Backend Setup:Bash    cd backend
    npm install
    # Create a .env file with your DB_URL and PORT
    npm start
    ```

3.  **Frontend Setup:**
    
```bash
    cd frontend
    npm install
    # Add your Google Maps API key to your environment variables
    npm start
    ```

---

## 🛠️ API Endpoints

| Method | Endpoint          | Description              |
| :---   | :---              | :---                     |
| `GET`  | `/api/meetings`   | Fetch all meetings       |
| `POST` | `/api/meetings`   | Create a new meeting     |
| `PUT`  | `/api/meetings/:id`| Update an existing meeting|
| `DELETE`| `/api/meetings/:id`| Remove a meeting         |
