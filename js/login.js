// Define the API URL without any trailing spaces
const apiURL = 'http://127.0.0.1:8000';

// Add an event listener to the login form
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Retrieve values from the input fields
    const shopPhoneNumber = document.getElementById('shop_phone_number').value;
    const password = document.getElementById('password').value;

    // Construct the URL by directly appending the phone number and password
    const loginURL = `${apiURL}/shop/${shopPhoneNumber}/${password}`;

    // Make a GET request to the FastAPI endpoint
    fetch(loginURL)
        .then(response => {
            if (!response.ok) {
                // If the response is not OK (e.g., 404), throw an error
                throw new Error('Invalid phone number or password');
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(shopDetails => {
            // Handle successful login
            alert('Login successful!');
            // Store the shop details in localStorage for later use
            localStorage.setItem('shop_id', shopDetails.shop_id);
            localStorage.setItem('shop_name', shopDetails.shop_name);
            // Redirect the user to the dashboard or desired page
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            alert(error.message);
        });
});
