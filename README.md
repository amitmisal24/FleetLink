# 🚚 FleetLink – Logistics Vehicle Booking System

FleetLink is a full-stack web application that allows administrators and users to:

- Add vehicles to a fleet  
- Search for available vehicles based on capacity, route, and start time  
- Book a selected vehicle while preventing double-booking  

This project uses **Node.js + Express** for the backend, **MongoDB** for data storage, and **React** for the frontend UI.

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React
- **Testing (backend):** Jest, Supertest, mongodb-memory-server

---

## 📂 Project Structure
├─ backend/ # Node.js + Express + MongoDB API
└─ frontend/ # React UI
Backend Setup
cd backend
npm install

Create a .env file:

cp .env.example .env


Edit .env:

MONGODB_URI=mongodb://localhost:27017/fleetlink
PORT=4000

PORT=4000
Run backend in dev mode:

bash
Copy code
npm run dev

Server will start at http://localhost:4000.
**Run backend tests:
npm test
**Frontend Setup**
Open a new terminal:

cd frontend
npm install

Open a new terminal:

cd frontend
npm install

Backend: uses Jest and an in-memory MongoDB. Run:

cd backend
npm test

API Endpoints

POST /api/vehicles

GET /api/vehicles/available?capacityRequired=...&fromPincode=...&toPincode=...&startTime=...

POST /api/bookings

All request/response details are in the task spec.
✨ Bonus / Improvements

Dockerize backend, frontend, and MongoDB with docker-compose

Add booking cancellation endpoint and page

Add authentication & role-based permissions

Improve frontend UX (routing, spinners, better date handling)

