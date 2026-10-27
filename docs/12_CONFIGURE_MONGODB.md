# Task 12: Configure MongoDB

## 1. Overview
The database layer connects using **Mongoose ODM**. It supports both a local MongoDB service on Windows (`mongodb://127.0.0.1:27017/imovies`) and remote cloud clusters via **MongoDB Atlas** (`mongodb+srv://...`).

## 2. Configuration Options

### Option A: Local MongoDB (Windows)
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community) or install via Windows command line.
2. Ensure the MongoDB Windows Service is running:
   ```cmd
   net start MongoDB
   ```
   Or run mongod directly:
   ```cmd
   mongod --dbpath C:\data\db
   ```
3. Set the URI in `server/.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/imovies
   ```

### Option B: MongoDB Atlas (Cloud Cluster - Recommended for College Demos)
1. Create a free M0 tier cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user (e.g., `imovies_admin` / `password123`).
3. Add your current IP address (or `0.0.0.0/0` for universal demonstration access) under Network Access.
4. Copy the SRV connection string into `server/.env`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/imovies?retryWrites=true&w=majority
   ```

## 3. Graceful Diagnostic Reporting (`server/src/config/db.js`)
If MongoDB is offline or misconfigured, the backend does not silently crash or pretend to work. Instead, it catches the connection error with `serverSelectionTimeoutMS: 5000` and displays clear troubleshooting steps:
```text
================================================================
[Database Error] Failed to connect to MongoDB!
Attempted URI: mongodb://127.0.0.1:27017/imovies
Error Details: connect EACCES 127.0.0.1:27017
----------------------------------------------------------------
To resolve this issue:
1. If running locally, ensure MongoDB service is started:
   Windows: Run "net start MongoDB" in administrative command prompt
   Or start mongod manually: mongod --dbpath <data_folder>
2. If using MongoDB Atlas:
   Update MONGO_URI in server/.env with your cloud connection string:
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/imovies
================================================================
```
This enables students and college evaluators to pinpoint connection issues immediately.
