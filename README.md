# 🎓 University Database Management System

A comprehensive solution for managing university data, including students, instructors, courses, and departments. This project provides a scalable and user-friendly interface powered by **React.js** for the frontend, **Node.js** for the backend, and **PostgreSQL** for the database.

---

## 📂 Project Structure

```plaintext
University_db_management_system/
├── client-us/      # React.js frontend code
├── server/         # Node.js backend code
├── schema.sql      # SQL file defining the database schema
├── README.md       # Project documentation
```

---

## 🚀 Features

- **Frontend**: A clean and intuitive dashboard built with **React.js** for user interaction.
- **Backend**: RESTful APIs created using **Node.js** to communicate with the database.
- **Database**: A structured schema in **PostgreSQL** for storing and retrieving university data.

---

## 🛠️ Prerequisites

Before starting, ensure the following are installed:

- **Node.js** (v14+)
- **npm** (Node Package Manager)
- **PostgreSQL** (v12+)

---

## 🖥️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/University_db_management_system.git
cd University_db_management_system
```

### 2️⃣ Install Backend Dependencies
Navigate to the `server` folder:
```bash
cd server
npm install
```

### 3️⃣ Install Frontend Dependencies
Navigate to the `client-us` folder:
```bash
cd ../client-us
npm install
```

### 4️⃣ Set Up the PostgreSQL Database
1. Open **PostgreSQL** using the terminal or your preferred database tool.
2. Run the `schema.sql` file to set up the database structure:
   ```bash
   psql -U <your-username> -d <your-database-name> -f schema.sql
   ```

---

## 🎬 Running the Application

### Start the Backend Server
Navigate to the `server` directory and start the backend:
```bash
cd server
npm start
```

### Start the Frontend Client
Navigate to the `client-us` directory and start the React app:
```bash
cd client-us
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## ✨ Key Scripts

### Backend
- **Start Server**: `npm start`
- **Run Tests**: `npm test`
- **Install Dependencies**: `npm install`

### Frontend
- **Start React App**: `npm start`
- **Build for Production**: `npm run build`

---

## 📚 Database Schema

The database schema includes the following tables:
1. **Students**: Records student details.
2. **Instructors**: Stores information about instructors.
3. **Courses**: Tracks courses offered by the university.
4. **Departments**: Manages departmental data.

> Check the `schema.sql` file for the complete structure.

---

Feel free to contribute to this project by submitting issues or pull requests!

---
