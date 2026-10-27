# Task 17: Step-by-Step Project Execution Guide

## 1. Prerequisites
- **Node.js**: v18 or v20 LTS installed.
- **MongoDB**: Either a local MongoDB instance running on port 27017 or a free MongoDB Atlas cloud cluster.

## 2. Step-by-Step Setup Instructions (Windows Friendly)

### Step 1: Open Terminal in Project Directory
Open PowerShell or Command Prompt in the project folder:
```powershell
cd c:\Users\atuln\Documents\IMovies
```

### Step 2: Configure Environment Variables
Copy the provided `.env.example` templates to active `.env` files:

**Server Configuration:**
```powershell
copy server\.env.example server\.env
```
*(Optionally edit `server/.env` to insert your MongoDB Atlas URI if not running MongoDB locally).*

**Client Configuration:**
```powershell
copy client\.env.example client\.env
```

### Step 3: Install Dependencies
Install dependencies for both server and client:
```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..\client
npm install
cd ..
```

### Step 4: Seed the Database with Sample Data
Ensure MongoDB is running, then populate realistic movies, theatres, and admin accounts:
```powershell
npm run seed
```
This sets up:
- Admin account: `admin@imovies.com` / `Admin@123456`
- Customer account: `user@imovies.com` / `User@123456`
- 8 Movies, 4 Theatres, and over 40 scheduled screening shows.

### Step 5: Run Automated Verification Tests
Run the backend test suite to verify authentication, booking logic, and seat calculations:
```powershell
npm test
```
All 8 automated tests should pass.

### Step 6: Start the Backend and Frontend Servers
You can start the servers in two separate terminal windows:

**Terminal 1 (Backend API):**
```powershell
cd server
npm run dev
```
*(Runs on: http://localhost:5000)*

**Terminal 2 (Frontend Client):**
```powershell
cd client
npm run dev
```
*(Runs on: http://localhost:5173)*

### Step 7: Open the Application in Your Browser
Open your web browser and navigate to:
**http://localhost:5173**

## 3. Demonstration Workflow for Evaluators
1. **Explore Catalog**: Browse the homepage, search by title, and filter by genre (e.g. Sci-Fi) or language.
2. **View Movie**: Click on *Inception* or *Oppenheimer* to view details, duration, rating, and screening times.
3. **Select Seats**: Select a showtime and pick 2 seats on the visual seat map. Observe real-time price updates across Silver, Gold, or Platinum tiers.
4. **Login**: Click "Proceed to Checkout" and use the 1-click **Customer Login** button (`user@imovies.com`).
5. **Simulated Payment**: Select a payment method and click **Simulate Payment Success**. View the digital confirmed ticket with barcode.
6. **Booking History**: Go to "My Bookings" to view the ticket and test the **Cancel Booking** button to see seats released immediately.
7. **Admin Portal**: Click your avatar, select **Admin Panel** (or login as `admin@imovies.com`), and view system statistics, manage movies, multiplexes, and schedule new shows.
