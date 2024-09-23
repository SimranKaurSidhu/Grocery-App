document.getElementById('signUpForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const shopName = document.getElementById('shop_name').value;
    const shopAddress = document.getElementById('shop_address').value;
    const shopPhoneNumber = document.getElementById('shop_phone_number').value;
    const password = document.getElementById('password').value;

    // Create a new shop object
    const shopDetails = {
        shop_id: generateShopID(),
        shop_name: shopName,
        shop_address: shopAddress,
        shop_phone_number: shopPhoneNumber,
        password: password,
        stock: []
    };

    // Save shop details to localStorage (for demo purposes)
    localStorage.setItem('shopDetails', JSON.stringify(shopDetails));

    alert('Account created successfully!');
    window.location.href = 'login.html';
});

function generateShopID() {
    return 'SHOP' + Math.floor(Math.random() * 1000000);
}
