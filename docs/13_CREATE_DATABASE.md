# Task 13: Create Database and Seed Data

## 1. Database Initialization
MongoDB automatically creates the target database (`imovies`) and required collections as soon as the first document is inserted through Mongoose schemas.

## 2. Automated Seed Script (`server/src/utils/seed.js`)
To provide an immediate, demonstrable catalog for college evaluations, a database seeding script is provided.

### What the Seed Script Generates:
1. **Initial Administrator Account**:
   - Name: `System Administrator`
   - Email: `admin@imovies.com`
   - Password: `Admin@123456`
   - Role: `admin`
2. **Demo Customer Account**:
   - Name: `Rahul Sharma`
   - Email: `user@imovies.com`
   - Password: `User@123456`
   - Role: `customer`
3. **4 Partner Multiplex Theatres**:
   - PVR ICON: Phoenix Palladium (Mumbai)
   - INOX Megaplex: Inorbit Mall (Mumbai)
   - Cinepolis: Grand Central Mall (Navi Mumbai)
   - PVR: Forum Mall Koramangala (Bengaluru)
4. **8 Feature Movies**:
   - *Inception*, *Interstellar*, *The Dark Knight*, *Oppenheimer*, *RRR*, *Dune: Part Two*, *Kalki 2898 AD*, and *Avatar: Fire and Ash* (Coming Soon).
5. **Multi-Day Screening Shows**:
   - Generates schedules across today, tomorrow, and subsequent days for each movie across multiplexes.
   - Generates standard 60-seat grids (Rows A to F, Columns 1 to 10) for each show.
   - Pre-books a few sample seats (e.g., C4, C5) to immediately show booked vs. available seats in demonstrations.
6. **Sample Confirmed Booking Record**:
   - Stored in the customer's history for reference during viva demonstrations.

## 3. Running the Seeding Process
Run from the root or server folder:
```bash
# From workspace root
npm run seed

# Or from server directory
cd server
npm run seed
```

### Seeding Success Console Output:
```text
[Seed] Connecting to MongoDB at: mongodb://127.0.0.1:27017/imovies
[Seed] MongoDB Connected successfully.
[Seed] Clearing existing collections...
[Seed] Admin user created: admin@imovies.com (Role: admin)
[Seed] Demo customer created: user@imovies.com (Password: User@123456)
[Seed] Inserted 4 theatres.
[Seed] Inserted 8 movies.
[Seed] Created 42 shows across 3 days.
[Seed] Sample confirmed booking created for demo customer.
====================================================
  DATABASE SEEDING COMPLETED SUCCESSFULLY!
----------------------------------------------------
  Admin Login   : admin@imovies.com / Admin@123456
  Customer Login: user@imovies.com / User@123456
  Total Theatres: 4
  Total Movies  : 8
  Total Shows   : 42
====================================================
```
