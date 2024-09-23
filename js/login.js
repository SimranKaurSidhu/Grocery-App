document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const shopPhoneNumber = document.getElementById('shop_phone_number').value;
    const password = document.getElementById('password').value;

    // Retrieve shop details from localStorage (for demo purposes)
    const storedShopDetails = JSON.parse(localStorage.getItem('shopDetails'));

    if (storedShopDetails &&
        storedShopDetails.shop_phone_number === shopPhoneNumber &&
        storedShopDetails.password === password) {
        alert('Login successful!');
        // Redirect to dashboard or main page
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid phone number or password.');
    }
});
