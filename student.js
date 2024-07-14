import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { logAction } from '../logs/logger.js';

const auth = getAuth();
const db = getFirestore();

// Redirect to login if not logged in
onAuthStateChanged(auth, user => {
    if (!user) {
        window.location.href = '../auth/login.html';
    }
});

// Load teachers into the select dropdown
async function loadTeachers() {
    const teacherSelect = document.getElementById('teacher-select');
    teacherSelect.innerHTML = '';
    
    try {
        const querySnapshot = await getDocs(collection(db, 'teachers'));
        querySnapshot.forEach((doc) => {
            const teacher = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = teacher.name;
            teacherSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error loading teachers: ", error);
    }
}

// Book appointment
document.getElementById('book-appointment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const teacherId = e.target['teacher-select'].value;
    const date = e.target['appointment-date'].value;
    const time = e.target['appointment-time'].value;
    const studentId = auth.currentUser.uid;
    
    try {
        await addDoc(collection(db, 'appointments'), {
            teacherId,
            date,
            time,
            studentId
        });
        logAction('Appointment Booked', `Teacher: ${teacherId}, Date: ${date}, Time: ${time}`);
        loadAppointments();
        e.target.reset();
    } catch (error) {
        console.error("Error booking appointment: ", error);
    }
});

// Load appointments
async function loadAppointments() {
    const appointmentsList = document.getElementById('appointments-list');
    appointmentsList.innerHTML = '';
    const studentId = auth.currentUser.uid;
    
    try {
        const querySnapshot = await getDocs(collection(db, 'appointments'));
        querySnapshot.forEach((doc) => {
            const appointment = doc.data();
            if (appointment.studentId === studentId) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appointment.teacherId}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
                    <td>
                        <button onclick="deleteAppointment('${doc.id}')">Cancel</button>
                    </td>
                `;
                appointmentsList.appendChild(row);
            }
        });
    } catch (error) {
        console.error("Error loading appointments: ", error);
    }
}

// Delete appointment
window.deleteAppointment = async (id) => {
    try {
        await deleteDoc(doc(db, 'appointments', id));
        logAction('Appointment Cancelled', id);
        loadAppointments();
    } catch (error) {
        console.error("Error cancelling appointment: ", error);
    }
}

// Load initial data
loadTeachers();
loadAppointments();

// Logout
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = '../auth/login.html';
    }).catch((error) => {
        console.error("Error logging out: ", error);
    });
});
