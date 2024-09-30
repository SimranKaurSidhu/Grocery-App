const apiURL = 'http://127.0.0.1:8000'; // Ensure no trailing space

document.getElementById('signUpForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const shopName = document.getElementById('shop_name').value;
    const shopAddress = document.getElementById('shop_address').value;
    const shopPhoneNumber = document.getElementById('shop_phone_number').value;
    const password = document.getElementById('password').value;

    // Generate shop ID (you might want to handle this on the backend)
    const shopID = generateShopID();

    // Create a new shop object
    const shopDetails = {
        shop_id: shopID,
        shop_name: shopName,
        shop_address: shopAddress,
        shop_phone_number: shopPhoneNumber,
        password: password,
        stock: []
    };

    // Send a POST request to the FastAPI backend
    fetch(apiURL + '/shops', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(shopDetails)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    // Extract error message from response
                    throw new Error(data.detail || 'An error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Account created successfully!');
            // Optionally, store shop details in localStorage
            localStorage.setItem('shop_id', shopID);
            localStorage.setItem('shop_name', shopName);
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});

function generateShopID() {
    return 'SHOP' + Math.floor(Math.random() * 1000000);
}
