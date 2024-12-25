// passport-config.js
const LocalStrategy = require('passport-local').Strategy;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function initialize(passport) {
    const authenticateUser = (username, password, done) => {
        const db = new sqlite3.Database(path.join(__dirname, 'superuser.db'));
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'No user with that username' });
            if (user.password !== password) return done(null, false, { message: 'Password incorrect' });
            return done(null, user);
        });
        db.close();
    };

    passport.use(new LocalStrategy(authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        const db = new sqlite3.Database(path.join(__dirname, 'superuser.db'));
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
            if (err) return done(err);
            return done(null, user);
        });
        db.close();
    });
}

module.exports = initialize;