/* js/sell_items.js */

const apiURL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', function() {
    const stockContainer = document.getElementById('stockContainer');
    const orderHeader = document.getElementById('orderHeader');

    let stock = [];
    let stockMap = {};
    let orderItems = [];

    const shopId = localStorage.getItem('shop_id');

    if (!shopId) {
        alert('Shop ID not found. Please log in.');
        window.location.href = 'login.html'; // Redirect to login page or appropriate page
        return;
    }

    // Fetch stock data from the API
    fetch(`${apiURL}/get_stock/${shopId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Shop not found');
            }
            return response.json();
        })
        .then(data => {
            // Store stock data grouped by category
            stock = data.map(category => {
                return {
                    ...category,
                    products: category.products.map(product => ({
                        ...product,
                        category_name: category.category_name,
                        available_quantity: product.product_quantity // Initialize available quantity
                    }))
                };
            });
            // Build stockMap
            stock.forEach(category => {
                category.products.forEach(product => {
                    stockMap[product.product_name] = product;
                });
            });
            if (stock.length === 0) {
                stockContainer.innerHTML = '<p>No stock available</p>';
            } else {
                displayStock();
            }
        })
        .catch(error => {
            console.error('Error fetching stock:', error);
            stockContainer.innerHTML = '<p>Error loading stock</p>';
        });

    // Function to display stock items grouped by category
    function displayStock() {
        stockContainer.innerHTML = ''; // Clear previous content

        stock.forEach(category => {
            // Filter out items that are in orderItems or have no available quantity
            const itemsToDisplay = category.products.filter(product =>
                product.available_quantity > 0 &&
                !orderItems.some(orderItem => orderItem.product_name === product.product_name)
            );

            if (itemsToDisplay.length > 0) {
                // Create category section
                const categorySection = document.createElement('div');
                categorySection.className = 'category-section';

                // Category title
                const categoryTitle = document.createElement('h3');
                categoryTitle.className = 'category-title';
                categoryTitle.textContent = category.category_name;
                categorySection.appendChild(categoryTitle);

                // Product list
                const productList = document.createElement('div'); // Use 'div' instead of 'ul'
                productList.className = 'product-list';

                itemsToDisplay.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'stock-item';

                    // Product image
                    const productImage = document.createElement('img');
                    productImage.src = product.product_image;
                    productImage.alt = product.product_name;

                    // Product name
                    const name = document.createElement('p');
                    name.textContent = product.product_name;

                    // Price per unit
                    const price = document.createElement('p');
                    price.textContent = `Price per unit: $${product.price_per_unit} / ${product.product_unit}`;

                    // Sell Button
                    const sellButton = document.createElement('button');
                    sellButton.className = 'sell-button';
                    sellButton.textContent = 'Sell Item';
                    sellButton.addEventListener('click', () => {
                        sellItem(product);
                    });

                    // Append elements to product item
                    productItem.appendChild(productImage);
                    productItem.appendChild(name);
                    productItem.appendChild(price);
                    productItem.appendChild(sellButton);

                    // Append product item to product list
                    productList.appendChild(productItem);
                });

                categorySection.appendChild(productList);
                stockContainer.appendChild(categorySection);
            }
        });
    }

    // Function to add item to order
    function sellItem(item) {
        const stockItem = stockMap[item.product_name];
        if (stockItem.available_quantity > 0) {
            // Add item to orderItems
            orderItems.push({
                ...item,
                quantity: 1,
                amount: (item.price_per_unit * 1).toFixed(2)
            });
            // Decrease available quantity
            stockItem.available_quantity -= 1;
            renderOrderItems();
            displayStock();
        } else {
            alert('No more stock available for this item.');
        }
    }

    // Function to render order items
    function renderOrderItems() {
        orderHeader.innerHTML = '';
        if (orderItems.length > 0) {
            const heading = document.createElement('h2');
            heading.textContent = 'Ordered Items';
            orderHeader.appendChild(heading);

            const orderContainer = document.createElement('div');
            orderContainer.classList.add('order-container');

            const orderItemsContainer = document.createElement('div');
            orderItemsContainer.classList.add('order-items-container');

            orderItems.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('order-item');

                const img = document.createElement('img');
                img.src = item.product_image;
                img.alt = item.product_name;

                const name = document.createElement('p');
                name.textContent = item.product_name;

                const amountDisplay = document.createElement('p');
                amountDisplay.textContent = `Amount: $${item.amount} for ${item.quantity} ${item.product_unit}`;

                const qtyControls = document.createElement('div');
                qtyControls.classList.add('qty-controls');

                const minusButton = document.createElement('button');
                minusButton.textContent = '-';
                const qtyDisplay = document.createElement('span');
                qtyDisplay.textContent = item.quantity;
                const plusButton = document.createElement('button');
                plusButton.textContent = '+';
                const closeButton = document.createElement('button');
                closeButton.textContent = '✖'; // Close button

                // Handle minus button click
                minusButton.addEventListener('click', () => {
                    const stockItem = stockMap[item.product_name];
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        item.amount = (item.price_per_unit * item.quantity).toFixed(2);
                        qtyDisplay.textContent = item.quantity;
                        amountDisplay.textContent = `Amount: $${item.amount} for ${item.quantity} ${item.product_unit}`;
                        // Increase available quantity
                        stockItem.available_quantity += 1;
                    } else {
                        // Remove item from order
                        orderItems.splice(index, 1);
                        // Increase available quantity by 1
                        stockItem.available_quantity += 1;
                    }
                    renderOrderItems();
                    displayStock();
                });

                // Handle plus button click
                plusButton.addEventListener('click', () => {
                    const stockItem = stockMap[item.product_name];
                    if (stockItem.available_quantity > 0) {
                        item.quantity += 1;
                        item.amount = (item.price_per_unit * item.quantity).toFixed(2);
                        qtyDisplay.textContent = item.quantity;
                        amountDisplay.textContent = `Amount: $${item.amount} for ${item.quantity} ${item.product_unit}`;
                        // Decrease available quantity
                        stockItem.available_quantity -= 1;
                    } else {
                        alert('No more stock available for this item.');
                    }
                });

                // Handle close button click
                closeButton.addEventListener('click', () => {
                    const stockItem = stockMap[item.product_name];
                    // Increase available quantity by item.quantity
                    stockItem.available_quantity += item.quantity;
                    // Remove item from order
                    orderItems.splice(index, 1);
                    renderOrderItems();
                    displayStock();
                });

                qtyControls.appendChild(minusButton);
                qtyControls.appendChild(qtyDisplay);
                qtyControls.appendChild(plusButton);
                qtyControls.appendChild(closeButton);

                itemDiv.appendChild(img);
                itemDiv.appendChild(name);
                itemDiv.appendChild(amountDisplay);
                itemDiv.appendChild(qtyControls);

                orderItemsContainer.appendChild(itemDiv);
            });

            // Calculate total amount
            const totalAmount = orderItems.reduce((sum, item) => sum + parseFloat(item.amount), 0).toFixed(2);
            const specialOffer = 'None';
            const discount = 0;
            const total = (totalAmount - discount).toFixed(2);

            // Create summary section
            const summaryDiv = document.createElement('div');
            summaryDiv.classList.add('order-summary');

            const totalAmountP = document.createElement('p');
            totalAmountP.textContent = `Amount: $${totalAmount}`;
            summaryDiv.appendChild(totalAmountP);

            const specialOfferP = document.createElement('p');
            specialOfferP.textContent = `Special Offer: ${specialOffer}`;
            summaryDiv.appendChild(specialOfferP);

            const discountP = document.createElement('p');
            discountP.textContent = `Discount: $${discount}`;
            summaryDiv.appendChild(discountP);

            const totalP = document.createElement('p');
            totalP.textContent = `Total: $${total}`;
            summaryDiv.appendChild(totalP);

            // Place Order Button
            const placeOrderButton = document.createElement('button');
            placeOrderButton.textContent = 'Place Order';
            placeOrderButton.classList.add('place-order-button');
            placeOrderButton.addEventListener('click', () => {
                openOrderPopup(totalAmount, discount, total);
            });
            summaryDiv.appendChild(placeOrderButton);

            // Append orderItemsContainer and summaryDiv to orderContainer
            orderContainer.appendChild(orderItemsContainer);
            orderContainer.appendChild(summaryDiv);

            orderHeader.appendChild(orderContainer);
        }
    }

    // Function to open the order confirmation popup
    function openOrderPopup(amount, discount, total) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.classList.add('modal-overlay');

        // Create modal content
        const modal = document.createElement('div');
        modal.classList.add('modal');

        const modalHeader = document.createElement('h3');
        modalHeader.textContent = 'Confirm Order';
        modal.appendChild(modalHeader);

        const amountP = document.createElement('p');
        amountP.textContent = `Amount: $${amount}`;
        modal.appendChild(amountP);

        const discountP = document.createElement('p');
        discountP.textContent = `Discount: $${discount}`;
        modal.appendChild(discountP);

        const totalP = document.createElement('p');
        totalP.textContent = `Total: $${total}`;
        modal.appendChild(totalP);

        // Customer Name
        const customerNameLabel = document.createElement('label');
        customerNameLabel.textContent = 'Customer Name: ';
        customerNameLabel.setAttribute('for', 'customer-name');
        modal.appendChild(customerNameLabel);

        const customerNameInput = document.createElement('input');
        customerNameInput.type = 'text';
        customerNameInput.id = 'customer-name';
        customerNameInput.placeholder = 'Enter customer name';
        customerNameInput.required = true;
        modal.appendChild(customerNameInput);

        // Customer Mobile Number
        const customerMobileLabel = document.createElement('label');
        customerMobileLabel.textContent = 'Customer Mobile Number: ';
        customerMobileLabel.setAttribute('for', 'customer-mobile');
        modal.appendChild(customerMobileLabel);

        const customerMobileInput = document.createElement('input');
        customerMobileInput.type = 'tel';
        customerMobileInput.id = 'customer-mobile';
        customerMobileInput.placeholder = 'Enter mobile number';
        customerMobileInput.required = true;
        modal.appendChild(customerMobileInput);

        // Button Container
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('modal-buttons');

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('cancel-button');
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm';
        confirmButton.classList.add('confirm-button');
        confirmButton.addEventListener('click', () => {
            const customerName = customerNameInput.value.trim();
            const customerMobile = customerMobileInput.value.trim();

            if (customerName === '' || customerMobile === '') {
                alert('Please enter customer name and mobile number.');
                return;
            }

            // Prepare order data
            const orderId = 'SO-' + Date.now();

            // Group orderItems by category
            const soldItems = [];

            orderItems.forEach(item => {
                // Find or create category in soldItems
                let category = soldItems.find(cat => cat.category_name === item.category_name);
                if (!category) {
                    category = {
                        category_name: item.category_name,
                        products: []
                    };
                    soldItems.push(category);
                }
                // Add product to category
                category.products.push({
                    product_name: item.product_name,
                    product_unit: item.product_unit,
                    product_weight: item.product_weight,
                    product_price: item.product_price,
                    price_per_unit: item.price_per_unit,
                    product_quantity: item.quantity,
                    product_amount: parseFloat(item.amount),
                    product_image: item.product_image
                });
            });

            const sellingOrder = {
                selling_order_id: orderId,
                shop_id: shopId,
                date: new Date().toISOString(),
                customer_name: customerName,
                customer_mobile: customerMobile,
                soldItems: soldItems,
                offer: "null", // Assuming no special offer
                amount: parseFloat(amount),
                discount: parseFloat(discount),
                total: parseFloat(total)
            };

            console.log('Selling Order:', sellingOrder);
            // Send data to API
            fetch(`${apiURL}/selling_orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sellingOrder)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to place order.');
                }
                return response.json();
            })
            .then(data => {
                // Update stock quantities
                updateStockQuantities();
                // Clear orderItems and re-render
                orderItems = [];
                renderOrderItems();
                alert('Order placed successfully!');
                document.body.removeChild(overlay);
            })
            .catch(error => {
                console.error('Error placing order:', error);
                alert('Failed to place order.');
            });
        });

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);

        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // Function to update stock quantities in the backend
    function updateStockQuantities() {
        // Prepare data to send
        const stockUpdate = {
            shop_id: shopId,
            stock: stock.map(category => ({
                category_name: category.category_name,
                products: category.products.map(product => ({
                    product_name: product.product_name,
                    product_quantity: product.available_quantity
                }))
            }))
        };

        // Send PUT request to update stock
        fetch(`${apiURL}/update_stock`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stockUpdate)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update stock.');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error updating stock:', error);
            alert('Failed to update stock.');
        });
    }
});
