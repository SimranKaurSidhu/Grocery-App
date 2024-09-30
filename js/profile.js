document.addEventListener('DOMContentLoaded', function() {
    const editProfileButton = document.getElementById('editProfile');

    editProfileButton.addEventListener('click', function() {
        // Placeholder logic for editing profile
        alert('Edit profile functionality goes here.');
    });

    // Load profile information (placeholder logic)
    const ownerName = localStorage.getItem('owner_name') || 'John Doe';
    const shopName = localStorage.getItem('shop_name') || 'My Shop';
    const email = localStorage.getItem('email') || 'john.doe@example.com';

    document.getElementById('ownerName').textContent = ownerName;
    document.getElementById('shopName').textContent = shopName;
    document.getElementById('email').textContent = email;
});
