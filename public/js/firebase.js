// Firebase Configuration (Placeholder - User must replace with actual values)
const firebaseConfig = {
    apiKey: "AIzaSyA_tFAzkRquP35yj7HCrSkYG57jBAX_L38",
    authDomain: "studymaterialapp-d97e8.firebaseapp.com",
    projectId: "studymaterialapp-d97e8",
    storageBucket: "studymaterialapp-d97e8.firebasestorage.app",
    messagingSenderId: "899676117951",
    appId: "1:899676117951:web:ff437762f1db9d0783df0a",
    measurementId: "G-EK015YWZVB"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error. Ensure you have added config keys:", error);
}

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global function to check auth state across pages
function requireAuth(callback) {
    auth.onAuthStateChanged(user => {
        if (user) {
            callback(user);
        } else {
            // Not logged in, redirect to login page
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                window.location.href = '/';
            }
        }
    });
}

// Function to just get the user if they exist, but don't redirect (for Guest mode)
function checkAuth(callback) {
    auth.onAuthStateChanged(user => {
        callback(user);
    });
}
