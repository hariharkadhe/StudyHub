// auth.js - Handles Signup, Login, and Auth State

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Check if user is already logged in, redirect to dashboard
    auth.onAuthStateChanged(user => {
        if (user) {
            window.location.href = '/dashboard';
        }
    });

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            const errorDiv = document.getElementById('loginError');

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            btn.disabled = true;
            btn.textContent = 'Logging in...';
            errorDiv.style.display = 'none';

            try {
                // Firebase Login
                await auth.signInWithEmailAndPassword(email, password);
                // Success: onAuthStateChanged will redirect
            } catch (error) {
                console.error("Login Error:", error.message);
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }

    // Handle Signup
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('signupBtn');
            const errorDiv = document.getElementById('signupError');

            const name = signupForm.signupName.value;
            const email = signupForm.signupEmail.value;
            const password = signupForm.signupPassword.value;

            btn.disabled = true;
            btn.textContent = 'Creating Account...';
            errorDiv.style.display = 'none';

            try {
                // Firebase Signup
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Update Profile
                await user.updateProfile({
                    displayName: name
                });

                // Save user to Firestore with default role
                await db.collection('users').doc(user.uid).set({
                    name: name,
                    email: email,
                    role: 'user', // Default role
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                // Success: onAuthStateChanged will redirect
            } catch (error) {
                console.error("Signup Error:", error.message);
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Sign Up';
            }
        });
    }
});
