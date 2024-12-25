// db.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create main database for super user
const dbPath = path.join(__dirname, 'superuser.db');
if (!fs.existsSync(dbPath)) {
    const db = new sqlite3.Database(dbPath);
    db.serialize(() => {
        db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, company_name TEXT)");
        db.run("INSERT INTO users (username, password, company_name) VALUES ('admin', 'password', 'SuperUserCompany')");
    });
    db.close();
}

// Function to create second level databases
function createSecondLevelDB(companyName) {
    const dbPath = path.join(__dirname, 'level2', `${companyName}.db`);
    if (!fs.existsSync(dbPath)) {
        const db = new sqlite3.Database(dbPath);
        db.serialize(() => {
            db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, clients TEXT)");
        });
        db.close();
    }
}

// Function to create third level databases
function createThirdLevelDB(companyName, clientName) {
    const dbPath = path.join(__dirname, 'level3', `${companyName}_${clientName}.db`);
    if (!fs.existsSync(dbPath)) {
        const db = new sqlite3.Database(dbPath);
        db.serialize(() => {
            db.run("CREATE TABLE transactions (id INTEGER PRIMARY KEY, date TEXT, amount REAL)");
        });
        db.close();
    }
}

module.exports = { createSecondLevelDB, createThirdLevelDB };