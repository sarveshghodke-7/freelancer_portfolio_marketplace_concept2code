// Firebase services
import { auth, db } from "../firebase/firebase-config.js";

// Firebase Auth
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

// Firebase Firestore
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    query,
    where,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";


// ===============================
// LOGIN
// ===============================
export async function loginUser(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
}


// ===============================
// REGISTER
// ===============================
export async function registerUser(name, email, password, role) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        createdAt: new Date()
    });

    window.location.href = "dashboard.html";
}


// ===============================
// LOGOUT
// ===============================
export async function logoutUser() {
    await signOut(auth);
    window.location.href = "login.html";
}


// ===============================
// AUTH GUARD
// ===============================
export function protectPage() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = "login.html";
        }
    });
}


// ===============================
// GET USER ROLE
// ===============================
export async function getUserRole(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data().role : null;
}


// ===============================
// FREELANCER PROFILE
// ===============================
export async function getFreelancerProfile(uid) {
    const profileDoc = await getDoc(doc(db, "freelancers", uid));
    return profileDoc.exists() ? profileDoc.data() : null;
}

export async function saveFreelancerProfile(uid, profileData) {
    await setDoc(doc(db, "freelancers", uid), {
        ...profileData,
        updatedAt: new Date()
    });
}


// ===============================
// GET ALL FREELANCERS
// ===============================
export async function getAllFreelancers() {
    const snapshot = await getDocs(collection(db, "freelancers"));

    const freelancers = [];
    snapshot.forEach(doc => {
        freelancers.push({ id: doc.id, ...doc.data() });
    });

    return freelancers;
}


// ===============================
// CREATE HIRE REQUEST
// ===============================
export async function createHireRequest(data) {
    await addDoc(collection(db, "hireRequests"), {
        ...data,
        status: "pending",
        createdAt: new Date()
    });
}


// ===============================
// GET FREELANCER REQUESTS
// ===============================
export async function getFreelancerRequests(uid) {
    const q = query(
        collection(db, "hireRequests"),
        where("freelancerId", "==", uid)
    );

    const snapshot = await getDocs(q);

    const requests = [];
    snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
    });

    return requests;
}


// ===============================
// GET CLIENT REQUESTS  ✅ NEW
// ===============================
export async function getClientRequests(uid) {
    const q = query(
        collection(db, "hireRequests"),
        where("clientId", "==", uid)
    );

    const snapshot = await getDocs(q);

    const requests = [];
    snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() });
    });

    return requests;
}


// ===============================
// UPDATE REQUEST STATUS
// ===============================
export async function updateRequestStatus(requestId, status) {
    const requestRef = doc(db, "hireRequests", requestId);
    await updateDoc(requestRef, { status });
}


// ===============================
// SAVE PAYMENT RECORD
// ===============================
export async function savePayment(paymentData) {
    await addDoc(collection(db, "payments"), {
        ...paymentData,
        createdAt: new Date()
    });
}


// ===============================
// GET PAYMENTS BY CLIENT
// ===============================
export async function getPaymentsByClient(uid) {
    const q = query(
        collection(db, "payments"),
        where("clientId", "==", uid)
    );
    const snapshot = await getDocs(q);
    const payments = [];
    snapshot.forEach(doc => {
        payments.push({ id: doc.id, ...doc.data() });
    });
    return payments;
}


// ===============================
// MILESTONE CRUD
// ===============================

export async function createMilestone(data) {
    const ref = await addDoc(collection(db, "milestones"), {
        ...data,
        createdAt: new Date()
    });
    return ref.id;
}

export async function getMilestonesByRequest(requestId) {
    const q = query(
        collection(db, "milestones"),
        where("requestId", "==", requestId)
    );
    const snapshot = await getDocs(q);
    const milestones = [];
    snapshot.forEach(d => milestones.push({ id: d.id, ...d.data() }));
    // Sort by order field on client side
    return milestones.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function updateMilestone(milestoneId, data) {
    const ref = doc(db, "milestones", milestoneId);
    await updateDoc(ref, { ...data, updatedAt: new Date() });
}

export async function deleteMilestone(milestoneId) {
    const { deleteDoc } = await import(
        "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js"
    );
    await deleteDoc(doc(db, "milestones", milestoneId));
}