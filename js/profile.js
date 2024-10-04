const apiURL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
    const shopNameInput = document.getElementById('shopName');
    const shopAddressInput = document.getElementById('shopAddress');
    const shopPhoneInput = document.getElementById('shopPhone');

    const editButton = document.getElementById('editButton');
    const updateButton = document.getElementById('updateButton');
    const cancelButton = document.getElementById('cancelButton');
    const logoutButton = document.getElementById('logoutButton');

    const shopId = localStorage.getItem('shop_id');

    if (!shopId) {
        alert('Shop ID not found. Please log in.');
        window.location.href = 'login.html'; // Redirect to login page or appropriate page
        return;
    }

    let originalShopName = '';
    let originalShopAddress = '';

    // Fetch shop details and populate the inputs
    fetch(`${apiURL}/shops/${shopId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Shop not found');
            }
            return response.json();
        })
        .then(shop => {
            shopNameInput.value = shop.shop_name;
            shopAddressInput.value = shop.shop_address;
            shopPhoneInput.value = shop.shop_phone_number;

            // Store original values
            originalShopName = shop.shop_name;
            originalShopAddress = shop.shop_address;
        })
        .catch(error => {
            console.error('Error fetching shop details:', error);
            alert('Error loading shop details.');
        });

    // Edit button event listener
    editButton.addEventListener('click', () => {
        shopNameInput.disabled = false;
        shopAddressInput.disabled = false;

        editButton.style.display = 'none';
        updateButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';
    });

    // Cancel button event listener
    cancelButton.addEventListener('click', () => {
        // Revert to original values
        shopNameInput.value = originalShopName;
        shopAddressInput.value = originalShopAddress;

        shopNameInput.disabled = true;
        shopAddressInput.disabled = true;

        editButton.style.display = 'inline-block';
        updateButton.style.display = 'none';
        cancelButton.style.display = 'none';
    });

    // Update button event listener
    updateButton.addEventListener('click', () => {
        const newShopName = shopNameInput.value.trim();
        const newShopAddress = shopAddressInput.value.trim();

        if (newShopName === '' || newShopAddress === '') {
            alert('Shop name and address cannot be empty.');
            return;
        }

        // Prepare data to send
        const data = {
            shop_id: shopId,
            shop_name: newShopName,
            shop_address: newShopAddress
        };

        // Send PUT request to update shop details
        fetch(`${apiURL}/update_shop`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update shop details');
                }
                return response.json();
            })
            .then(updatedShop => {
                alert('Shop details updated successfully!');
                shopNameInput.disabled = true;
                shopAddressInput.disabled = true;

                // Update original values
                originalShopName = updatedShop.shop_name;
                originalShopAddress = updatedShop.shop_address;

                editButton.style.display = 'inline-block';
                updateButton.style.display = 'none';
                cancelButton.style.display = 'none';
            })
            .catch(error => {
                console.error('Error updating shop details:', error);
                alert('Failed to update shop details.');
            });
    });

    // Logout button event listener
    logoutButton.addEventListener('click', () => {
        // Clear localStorage and redirect to login page
        localStorage.removeItem('shop_id');
        window.location.href = 'login.html';
    });
});
