// app.js
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const { createSecondLevelDB, createThirdLevelDB } = require('./db');
const initializePassport = require('./passport-config');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

initializePassport(passport);

const app = express();
app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true

}));

app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard.ejs', { name: req.user.username });
});

app.get('/register', checkAuthenticated, (req, res) => {
    res.render('register.ejs');
});

app.post('/register', checkAuthenticated, (req, res) => {
    const { username, password, companyName } = req.body;
    const db = new sqlite3.Database(path.join(__dirname, 'superuser.db'));
    db.run('INSERT INTO users (username, password, company_name) VALUES (?, ?, ?)', [username, password, companyName], (err) => {
        if (err) {
            console.error(err.message);
            res.redirect('/register');
        } else {
            createSecondLevelDB(companyName);
            res.redirect('/dashboard');
        }
    });
    db.close();
});

app.get('/view-users', checkAuthenticated, (req, res) => {
    const db = new sqlite3.Database(path.join(__dirname, 'superuser.db'));
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.redirect('/dashboard');
        } else {
            res.render('view-users.ejs', { users: rows });
        }
    });
    db.close();
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});