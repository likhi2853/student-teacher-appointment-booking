import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { logAction } from '../logs/logger.js';

const db = getFirestore();
const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    // Check if the teacher is logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadAppointments(user.uid);
            loadMessages(user.uid);
        } else {
            window.location.href = '../auth/login.html';
        }
    });
});

async function loadAppointments(teacherId) {
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);

    const appointmentsDiv = document.getElementById('appointments');
    appointmentsDiv.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const appointment = doc.data();
        const appointmentDiv = document.createElement('div');
        appointmentDiv.classList.add('appointment');
        appointmentDiv.innerHTML = `
            <p>Student: ${appointment.studentName}</p>
            <p>Date: ${appointment.date}</p>
            <p>Status: ${appointment.status}</p>
            <button onclick="updateAppointment('${doc.id}', 'approved')">Approve</button>
            <button onclick="updateAppointment('${doc.id}', 'canceled')">Cancel</button>
        `;
        appointmentsDiv.appendChild(appointmentDiv);
    });
}

async function updateAppointment(appointmentId, status) {
    const appointmentDocRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentDocRef, {
        status: status
    });
    logAction(`Appointment ${status}`, auth.currentUser.email);
    loadAppointments(auth.currentUser.uid);
}

async function loadMessages(teacherId) {
    const messagesRef = collection(db, "messages");
    const q = query(messagesRef, where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);

    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const message = doc.data();
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.innerHTML = `
            <p>From: ${message.studentName}</p>
            <p>Message: ${message.content}</p>
        `;
        messagesDiv.appendChild(messageDiv);
    });
}

export { updateAppointment };
