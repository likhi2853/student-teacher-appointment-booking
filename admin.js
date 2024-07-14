import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { logAction } from '../logs/logger.js';

// Initialize Firebase Authentication and Firestore
const auth = getAuth();
const db = getFirestore();

// Redirect to login page if user is not authenticated
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '../auth/login.html';
    }
});

// Add teacher
document.getElementById('add-teacher-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target['teacher-name'].value;
    const email = e.target['teacher-email'].value;

    try {
        await addDoc(collection(db, 'teachers'), {
            name,
            email
        });
        logAction('Teacher Added', email);
        loadTeachers();
        e.target.reset();
    } catch (error) {
        console.error("Error adding teacher: ", error);
    }
});

// Load teachers
async function loadTeachers() {
    const teachersList = document.getElementById('teachers-list');
    teachersList.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, 'teachers'));
        querySnapshot.forEach((doc) => {
            const teacher = doc.data();
            teachersList.innerHTML += `
                <tr>
                    <td>${teacher.name}</td>
                    <td>${teacher.email}</td>
                    <td>
                        <button onclick="deleteTeacher('${doc.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error loading teachers: ", error);
    }
}

// Delete teacher
window.deleteTeacher = async (id) => {
    try {
        await deleteDoc(doc(db, 'teachers', id));
        logAction('Teacher Deleted', id);
        loadTeachers();
    } catch (error) {
        console.error("Error deleting teacher: ", error);
    }
};

// Load logs
async function loadLogs() {
    const logsList = document.getElementById('logs-list');
    logsList.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, 'logs'));
        querySnapshot.forEach((doc) => {
            const log = doc.data();
            logsList.innerHTML += `<p>${log.timestamp}: ${log.action} by ${log.user}</p>`;
        });
    } catch (error) {
        console.error("Error loading logs: ", error);
    }
}

// Load initial data
loadTeachers();
loadLogs();

// Logout
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '../auth/login.html';
    }).catch((error) => {
        console.error("Error logging out: ", error);
    });
});
