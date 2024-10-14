/* js/sell_items.js */

const apiURL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', function () {
    const stockContainer = document.getElementById('stockContainer');
    const orderHeader = document.getElementById('orderHeader');

    let stock = [];
    let stockMap = {};
    let orderItems = [];
    let specialOffers = [];
    let selectedOffer = null;

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

    // Fetch special offers for the shop
    fetch(`${apiURL}/get_special_offers/${shopId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch special offers');
            }
            return response.json();
        })
        .then(data => {
            specialOffers = data;
        })
        .catch(error => {
            console.error('Error fetching special offers:', error);
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
            const heading = document.createElement('h3');
            heading.textContent = 'Ordered Items';
            orderHeader.appendChild(heading);

            const orderContainer = document.createElement('div');
            orderContainer.classList.add('order-container');

            const orderItemsContainer = document.createElement('div');
            orderItemsContainer.classList.add('order-items-container');

            orderItems.forEach((item, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('order-item', 'order-card');

                // Close button at the top right corner
                const closeButton = document.createElement('button');
                closeButton.textContent = '✖';
                closeButton.classList.add('close-button');
                closeButton.addEventListener('click', () => {
                    const stockItem = stockMap[item.product_name];
                    // Increase available quantity by item.quantity
                    stockItem.available_quantity += item.quantity;
                    // Remove item from order
                    orderItems.splice(index, 1);
                    renderOrderItems();
                    displayStock();
                });
                itemDiv.appendChild(closeButton);

                const img = document.createElement('img');
                img.src = item.product_image;
                img.alt = item.product_name;

                const name = document.createElement('p');
                name.textContent = item.product_name;

                const amountDisplay = document.createElement('p');
                amountDisplay.textContent = `Price: $${item.amount} for ${item.quantity} ${item.product_unit}`;

                const qtyControls = document.createElement('div');
                qtyControls.classList.add('qty-controls');

                const minusButton = document.createElement('button');
                minusButton.textContent = '-';
                minusButton.classList.add('qty-button');

                const qtyDisplay = document.createElement('span');
                qtyDisplay.textContent = item.quantity;
                qtyDisplay.classList.add('qty-display');

                const plusButton = document.createElement('button');
                plusButton.textContent = '+';
                plusButton.classList.add('qty-button');

                // Handle minus button click
                minusButton.addEventListener('click', () => {
                    const stockItem = stockMap[item.product_name];
                    if (item.quantity > 1) {
                        item.quantity -= 1;
                        item.amount = (item.price_per_unit * item.quantity).toFixed(2);
                        qtyDisplay.textContent = item.quantity;
                        amountDisplay.textContent = `Price: $${item.amount} for ${item.quantity} ${item.product_unit}`;
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
                        amountDisplay.textContent = `Price: $${item.amount} for ${item.quantity} ${item.product_unit}`;
                        // Decrease available quantity
                        stockItem.available_quantity -= 1;
                        renderOrderItems();
                        displayStock();
                    } else {
                        alert('No more stock available for this item.');
                    }
                });

                qtyControls.appendChild(minusButton);
                qtyControls.appendChild(qtyDisplay);
                qtyControls.appendChild(plusButton);

                itemDiv.appendChild(img);
                itemDiv.appendChild(name);
                itemDiv.appendChild(amountDisplay);
                itemDiv.appendChild(qtyControls);

                orderItemsContainer.appendChild(itemDiv);
            });

            // Calculate total amount
            const totalAmount = orderItems.reduce((sum, item) => sum + parseFloat(item.amount), 0);

            let discount = 0;

            if (selectedOffer) {
                if (selectedOffer.discount_percentage > 0) {
                    discount = (totalAmount * (selectedOffer.discount_percentage / 100));
                } else if (selectedOffer.discount_amount > 0) {
                    discount = selectedOffer.discount_amount;
                }
            }

            const total = (totalAmount - discount).toFixed(2);

            // Create summary item
            const summaryDiv = document.createElement('div');
            summaryDiv.classList.add('order-summary', 'order-card');

            // Center the order details vertically
            summaryDiv.style.display = 'flex';
            summaryDiv.style.flexDirection = 'column';
            summaryDiv.style.justifyContent = 'center';

            const totalAmountP = document.createElement('p');
            totalAmountP.textContent = `Total Amount: $${totalAmount.toFixed(2)}`;
            summaryDiv.appendChild(totalAmountP);

            // Special Offer label
            const specialOfferP = document.createElement('button');
            specialOfferP.style.backgroundColor = '#fff';
            specialOfferP.style.color = '#e67e22';
            specialOfferP.style.fontWeight = 'bold';
            specialOfferP.style.fontSize = '1.1em';
            specialOfferP.style.padding = '5px 10px';
            specialOfferP.style.border = '2px solid #e67e22';
            specialOfferP.innerHTML = `Special Offer: <br><span id="specialOfferText">${selectedOffer ? selectedOffer.offer_name : '&#10005;'}</span>`;
            specialOfferP.style.cursor = 'pointer';
            specialOfferP.addEventListener('click', openSpecialOfferPopup);
            summaryDiv.appendChild(specialOfferP);

            const discountP = document.createElement('p');
            discountP.textContent = `Discount: $${discount.toFixed(2)}`;
            summaryDiv.appendChild(discountP);

            const totalP = document.createElement('p');
            totalP.textContent = `Total Amount: $${total}`;
            summaryDiv.appendChild(totalP);

            // Sell Items Button
            const placeOrderButton = document.createElement('button');
            placeOrderButton.textContent = 'Sell Items';
            placeOrderButton.classList.add('place-order-button');
            placeOrderButton.addEventListener('click', () => {
                openOrderPopup(totalAmount.toFixed(2), discount.toFixed(2), total);
            });
            summaryDiv.appendChild(placeOrderButton);

            // Append summaryDiv to orderItemsContainer
            orderItemsContainer.appendChild(summaryDiv);

            // Append orderItemsContainer to orderContainer
            orderContainer.appendChild(orderItemsContainer);

            orderHeader.appendChild(orderContainer);
        }

        // Function to open the special offer selection popup
        function openSpecialOfferPopup() {
            // Create overlay
            const overlay = document.createElement('div');
            overlay.classList.add('modal-overlay');

            // Create modal content
            const modal = document.createElement('div');
            modal.classList.add('modal');

            const modalHeader = document.createElement('h3');
            modalHeader.textContent = 'Select Special Offer';
            modal.appendChild(modalHeader);

            // Check if specialOffers is empty
            if (specialOffers.length === 0) {
                const noOffersP = document.createElement('p');
                noOffersP.textContent = 'No special offers available.';
                modal.appendChild(noOffersP);
            } else {
                // Create list of offers
                const offersList = document.createElement('ul');
                offersList.style.listStyleType = 'none';
                offersList.style.padding = '0';

                specialOffers.forEach(offer => {
                    const offerItem = document.createElement('li');
                    offerItem.classList.add('offer-item'); // Add this line
                    offerItem.style.marginBottom = '10px';
                    

                    // Radio button input
                    const radioInput = document.createElement('input');
                    radioInput.type = 'radio';
                    radioInput.name = 'specialOffer';
                    radioInput.value = offer.offer_id;
                    radioInput.id = `offer-${offer.offer_id}`;
                    radioInput.style.width = '30px';

                    // If this offer is currently selected, check the radio button
                    if (selectedOffer && selectedOffer.offer_id === offer.offer_id) {
                        radioInput.checked = true;
                    }

                    // Offer label
                    const label = document.createElement('label');
                    label.htmlFor = `offer-${offer.offer_id}`;
                    label.classList.add('offer-label'); // Add this line
                    label.textContent = `${offer.offer_name} - `;
                    // Display discount percentage or amount
                    if (offer.discount_percentage > 0) {
                        label.textContent += `${offer.discount_percentage}% off`;
                    } else if (offer.discount_amount > 0) {
                        label.textContent += `$${offer.discount_amount} off`;
                    }

                    offerItem.appendChild(radioInput);
                    offerItem.appendChild(label);

                    offersList.appendChild(offerItem);
                });

                // Option to deselect special offer
                const offerItem = document.createElement('li');
                offerItem.classList.add('offer-item'); // Add this line
                offerItem.style.marginBottom = '10px';

                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = 'specialOffer';
                radioInput.value = 'none';
                radioInput.id = 'offer-none';
                radioInput.style.width = '30px';

                if (!selectedOffer) {
                    radioInput.checked = true;
                }

                const label = document.createElement('label');
                label.htmlFor = 'offer-none';
                label.classList.add('offer-label'); // Add this line
                label.textContent = 'No Special Offer';

                offerItem.appendChild(radioInput);
                offerItem.appendChild(label);

                offersList.appendChild(offerItem);

                modal.appendChild(offersList);
            }

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
                // Get selected offer
                const selectedRadio = modal.querySelector('input[name="specialOffer"]:checked');
                if (selectedRadio && selectedRadio.value !== 'none') {
                    const offerId = selectedRadio.value;
                    selectedOffer = specialOffers.find(offer => offer.offer_id === offerId);
                } else {
                    selectedOffer = null;
                }

                // Update the order summary
                renderOrderItems();

                document.body.removeChild(overlay);
            });

            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(confirmButton);

            modal.appendChild(buttonContainer);
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
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
            amountP.textContent = `Amount: $${parseFloat(amount).toFixed(2)}`;
            modal.appendChild(amountP);

            const discountP = document.createElement('p');
            discountP.textContent = `Discount: $${parseFloat(discount).toFixed(2)}`;
            modal.appendChild(discountP);

            const totalP = document.createElement('p');
            totalP.textContent = `Total: $${parseFloat(total).toFixed(2)}`;
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
                    offer: selectedOffer ? selectedOffer : null,
                    amount: parseFloat(amount),
                    discount: parseFloat(discount),
                    total: parseFloat(total)
                };

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
                        selectedOffer = null;
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
                .then(data => {
                    console.log('Stock updated successfully:', data);
                })
                .catch(error => {
                    console.error('Error updating stock:', error);
                    alert('Failed to update stock.');
                });
        }
    }
});