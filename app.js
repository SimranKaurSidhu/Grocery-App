// Firebase configuration (replace with your Firebase project configuration)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC8uT3Sd99NwYjYn6sP7vCkjBEx0cTGTa8",
    authDomain: "grocery-webapp-2b121.firebaseapp.com",
    databaseURL: "https://grocery-webapp-2b121-default-rtdb.firebaseio.com",
    projectId: "grocery-webapp-2b121",
    storageBucket: "grocery-webapp-2b121.appspot.com",
    messagingSenderId: "335065925622",
    appId: "1:335065925622:web:7814f5a09fa9d2d11869d7",
    measurementId: "G-HQYZQ6W0J5"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM elements
const signUpBtn = document.getElementById('sign-up-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const messageBox = document.getElementById('message-box');

// Sign Up Event
signUpBtn.addEventListener('click', () => {
    const email = document.getElementById('sign-up-email').value;
    const password = document.getElementById('sign-up-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            messageBox.textContent = `Sign up successful! Welcome, ${userCredential.user.email}`;
            messageBox.style.color = "green";
            logoutBtn.style.display = 'block';
            clearInputs();
        })
        .catch((error) => {
            messageBox.textContent = error.message;
        });
});

// Login Event
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            messageBox.textContent = `Logged in successfully! Welcome, ${userCredential.user.email}`;
            messageBox.style.color = "green";
            logoutBtn.style.display = 'block';
            clearInputs();
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            messageBox.textContent = error.message;
        });
});

// Logout Event
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        messageBox.textContent = "Logged out successfully!";
        messageBox.style.color = "green";
        logoutBtn.style.display = 'none';
    }).catch((error) => {
        messageBox.textContent = error.message;
    });
});

// Clear Input Fields
function clearInputs() {
    document.getElementById('sign-up-email').value = '';
    document.getElementById('sign-up-password').value = '';
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

// Monitor Auth State
auth.onAuthStateChanged((user) => {
    if (user) {
        logoutBtn.style.display = 'block';
        messageBox.textContent = `Welcome back, ${user.email}`;
        messageBox.style.color = "green";
    } else {
        messageBox.textContent = "Please log in or sign up.";
        messageBox.style.color = "red";
    }
});
