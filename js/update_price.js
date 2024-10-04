const apiURL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
    const productTableBody = document.querySelector('#productTable tbody');
    const shopId = localStorage.getItem('shop_id');

    if (!shopId) {
        alert('Shop ID not found. Please log in.');
        window.location.href = 'login.html'; // Redirect to login page or appropriate page
        return;
    }

    // Fetch shop details and populate the table
    fetch(`${apiURL}/shops/${shopId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Shop not found');
            }
            return response.json();
        })
        .then(shop => {
            const products = [];
            shop.stock.forEach(category => {
                category.products.forEach(product => {
                    products.push(product);
                });
            });
            populateTable(products);
        })
        .catch(error => {
            console.error('Error fetching shop details:', error);
            productTableBody.innerHTML = '<tr><td colspan="5">Error loading products</td></tr>';
        });

    function populateTable(products) {
        if (products.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="5">No products available</td></tr>';
            return;
        }

        products.forEach(product => {
            const row = document.createElement('tr');

            // Product Name
            const nameCell = document.createElement('td');
            nameCell.textContent = product.product_name;
            row.appendChild(nameCell);

            // Price per Unit
            const priceCell = document.createElement('td');
            const priceInput = document.createElement('input');
            priceInput.type = 'number';
            priceInput.value = product.price_per_unit;
            priceInput.step = '0.01';
            priceInput.disabled = true;
            priceCell.appendChild(priceInput);
            row.appendChild(priceCell);

            // Quantity
            const quantityCell = document.createElement('td');
            quantityCell.textContent = product.product_quantity;
            row.appendChild(quantityCell);

            // Total Amount
            const amountCell = document.createElement('td');
            amountCell.textContent = `$${(product.price_per_unit * product.product_quantity).toFixed(2)}`;
            row.appendChild(amountCell);

            // Edit Button Cell
            const editCell = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-button');
            editCell.appendChild(editButton);
            row.appendChild(editCell);

            // Event listener for Edit button
            editButton.addEventListener('click', () => {
                // Make price input editable
                priceInput.disabled = false;
                priceInput.focus();

                // Replace Edit button with Update and Cancel buttons
                editCell.removeChild(editButton);

                const updateButton = document.createElement('button');
                updateButton.classList.add('update-button');
                updateButton.title = 'Update';
                updateButton.innerHTML = '&#10003;'; // Checkmark symbol

                const cancelButton = document.createElement('button');
                cancelButton.classList.add('cancel-button');
                cancelButton.title = 'Cancel';
                cancelButton.innerHTML = '&#10005;'; // Cross symbol

                editCell.appendChild(updateButton);
                editCell.appendChild(cancelButton);

                const originalPrice = product.price_per_unit; // Store original price

                updateButton.addEventListener('click', () => {
                    const newPrice = parseFloat(priceInput.value);
                    if (isNaN(newPrice) || newPrice <= 0) {
                        alert('Please enter a valid price.');
                        return;
                    }

                    // Update price in the backend
                    updateProductPrice(shopId, product.product_name, newPrice)
                        .then(updatedProduct => {
                            product.price_per_unit = updatedProduct.price_per_unit;
                            amountCell.textContent = `$${(product.price_per_unit * product.product_quantity).toFixed(2)}`;
                            priceInput.disabled = true;

                            // Replace Update and Cancel buttons with Edit button
                            editCell.removeChild(updateButton);
                            editCell.removeChild(cancelButton);
                            editCell.appendChild(editButton);

                            alert('Price updated successfully!');
                        })
                        .catch(error => {
                            console.error('Error updating product price:', error);
                            alert('Failed to update price.');
                        });
                });

                cancelButton.addEventListener('click', () => {
                    // Revert price input to original value
                    priceInput.value = originalPrice;
                    priceInput.disabled = true;

                    // Replace Update and Cancel buttons with Edit button
                    editCell.removeChild(updateButton);
                    editCell.removeChild(cancelButton);
                    editCell.appendChild(editButton);
                });
            });

            productTableBody.appendChild(row);
        });
    }

    function updateProductPrice(shopId, productName, newPrice) {
        // Prepare data to send
        const data = {
            shop_id: shopId,
            product_name: productName,
            new_price: newPrice
        };

        // Send PUT request to update price
        return fetch(`${apiURL}/update_price`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update price');
                }
                return response.json();
            });
    }
});
