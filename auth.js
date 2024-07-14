import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { logAction } from '../logs/logger.js';

const auth = getAuth();

// Register User
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            logAction('User Registered', userCredential.user.email);
        })
        .catch((error) => {
            console.error(error);
        });
});

// Login User
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            logAction('User Logged In', userCredential.user.email);
        })
        .catch((error) => {
            console.error(error);
        });
});
