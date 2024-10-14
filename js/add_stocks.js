/* js/add_stocks.js */

const apiURL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', function() {
    const addStockButton = document.getElementById('addStockButton');
    const addStockModal = document.getElementById('addStockModal');
    const closeModal = document.getElementById('closeModal');
    const categorySelect = document.getElementById('categorySelect');
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');
    const quantityLabel = document.getElementById('quantityLabel');
    const unitPriceInfo = document.getElementById('unitPriceInfo');
    const productInfoDiv = document.getElementById('productInfo');
    const totalPriceInfo = document.getElementById('totalPriceInfo');
    const confirmAddStock = document.getElementById('confirmAddStock');
    const addStockForm = document.getElementById('addStockForm');
    const stockDisplay = document.getElementById('stockDisplay');
    const buyOrderButton = document.getElementById('buyOrderButton');
    const cancelBuyOrderButton = document.getElementById('cancelBuyOrderButton'); // Added
    const totalAmountDisplay = document.getElementById('totalAmountDisplay');

    // Buy Order Modal elements
    const buyOrderModal = document.getElementById('buyOrderModal');
    const closeBuyOrderModal = document.getElementById('closeBuyOrderModal');
    const buyOrderForm = document.getElementById('buyOrderForm');
    const currentAmountInfo = document.getElementById('currentAmountInfo');
    const totalDiscountInput = document.getElementById('totalDiscountInput');
    const totalAmountInput = document.getElementById('totalAmountInput');
    const confirmBuyOrder = document.getElementById('confirmBuyOrder');

    let selectedProduct = null;

    // Variable to store added stocks
    let stock = [];

    // Open Add Stock Modal
    addStockButton.addEventListener('click', function() {
        addStockModal.style.display = 'block';
        fetchCategories();
    });

    // Close Add Stock Modal
    closeModal.addEventListener('click', function() {
        resetForm();
        addStockModal.style.display = 'none';
    });

    // Close modal when clicking outside content
    window.addEventListener('click', function(event) {
        if (event.target == addStockModal) {
            resetForm();
            addStockModal.style.display = 'none';
        }
        if (event.target == buyOrderModal) {
            buyOrderModal.style.display = 'none';
            buyOrderForm.reset();
        }
    });

    // Fetch categories from API
    function fetchCategories() {
        fetch(`${apiURL}/categories`)
            .then(response => response.json())
            .then(categories => {
                categorySelect.innerHTML = '<option value="">--Select Category--</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    // Event Listener for Category Selection
    categorySelect.addEventListener('change', function() {
        const selectedCategory = this.value;
        if (selectedCategory) {
            fetchProducts(selectedCategory);
            productSelect.disabled = false;
        } else {
            productSelect.disabled = true;
            productSelect.innerHTML = '<option value="">--Select Product--</option>';
            resetProductInfo();
        }
    });

    // Fetch products for selected category
    function fetchProducts(categoryName) {
        fetch(`${apiURL}/get_product_details/${categoryName}`)
            .then(response => response.json())
            .then(products => {
                productSelect.innerHTML = '<option value="">--Select Product--</option>';
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.product_name;
                    option.textContent = product.product_name;
                    option.dataset.product = JSON.stringify(product);
                    productSelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    // Event Listener for Product Selection
    productSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            selectedProduct = JSON.parse(selectedOption.dataset.product);
            displayProductInfo(selectedProduct);
            quantityInput.disabled = false;
            confirmAddStock.disabled = false;
            calculateTotalPrice();
        } else {
            resetProductInfo();
        }
    });

    // Display product information
    function displayProductInfo(product) {
        productInfoDiv.style.display = 'block';
        // Update Price per unit display
        unitPriceInfo.textContent = `Price per unit: $${product.price_per_unit} / ${product.product_unit}`;
        // Update Quantity label
        quantityLabel.textContent = `Quantity (in ${product.product_unit}):`;
    }

    // Reset product information
    function resetProductInfo() {
        selectedProduct = null;
        productInfoDiv.style.display = 'none';
        quantityInput.value = 1;
        quantityInput.disabled = true;
        confirmAddStock.disabled = true;
        totalPriceInfo.textContent = '';
        quantityLabel.textContent = 'Quantity:';
    }

    // Calculate total price
    function calculateTotalPrice() {
        if (selectedProduct) {
            const quantity = parseFloat(quantityInput.value);
            const totalPrice = quantity * selectedProduct.price_per_unit;
            totalPriceInfo.textContent = `Total Price: $${totalPrice.toFixed(2)} for ${quantity} ${selectedProduct.product_unit}`;
        }
    }

    quantityInput.addEventListener('input', calculateTotalPrice);

    // Handle Add Stock Form Submission
    addStockForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (selectedProduct) {
            const quantity = parseFloat(quantityInput.value);
            const totalPrice = quantity * selectedProduct.price_per_unit;

            // Create product object to add to stock
            const productToAdd = {
                product_name: selectedProduct.product_name,
                product_unit: selectedProduct.product_unit,
                product_weight: selectedProduct.product_weight,
                product_price: selectedProduct.product_price,
                price_per_unit: selectedProduct.price_per_unit,
                product_quantity: quantity,
                product_amount: totalPrice,
                product_image: selectedProduct.product_image
            };

            // Check if category exists in stock
            let categoryExists = false;
            for (let category of stock) {
                if (category.category_name === categorySelect.value) {
                    category.products.push(productToAdd);
                    categoryExists = true;
                    break;
                }
            }

            // If category doesn't exist, create new category
            if (!categoryExists) {
                stock.push({
                    category_name: categorySelect.value,
                    products: [productToAdd]
                });
            }

            // Display the updated stock on the page
            displayStock();

            // Show Buy Order Button and Total Amount if stock has items
            if (stock.length > 0) {
                buyOrderButton.style.display = 'inline-block';
                cancelBuyOrderButton.style.display = 'inline-block'; // Show Cancel Buy Order button
                totalAmountDisplay.style.display = 'block'; // Show Total Amount label
            }

            // Reset form and close modal
            resetForm();
            addStockModal.style.display = 'none';
        }
    });

    // Reset form fields
    function resetForm() {
        addStockForm.reset();
        productSelect.disabled = true;
        resetProductInfo();
        // Clear and reload categories
        categorySelect.innerHTML = '<option value="">--Select Category--</option>';
        fetchCategories();
    }

    // Function to calculate total amount
    function calculateTotalAmount() {
        const totalAmount = stock.reduce((sum, category) => {
            return sum + category.products.reduce((catSum, product) => {
                return catSum + product.product_amount;
            }, 0);
        }, 0);
        return totalAmount;
    }

   // Inside the displayStock() function

function displayStock() {
    stockDisplay.innerHTML = ''; // Clear previous content

    stock.forEach(category => {
        // Create category section
        const categorySection = document.createElement('div');
        categorySection.className = 'category-section';

        // Category title
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'category-title';
        categoryTitle.textContent = category.category_name;
        categorySection.appendChild(categoryTitle);

        // Product list
        const productList = document.createElement('ul');
        productList.className = 'product-list';

        category.products.forEach(product => {
            const productItem = document.createElement('li');
            productItem.className = 'product-item';

            // Close button at the top right corner
            const closeButton = document.createElement('button');
            closeButton.textContent = '✖';
            closeButton.classList.add('close-button');
            closeButton.addEventListener('click', () => {
                // Remove product from category products array
                const productIndexInCategory = category.products.indexOf(product);
                if (productIndexInCategory > -1) {
                    category.products.splice(productIndexInCategory, 1);
                }

                // If category has no products left, remove the category
                if (category.products.length === 0) {
                    const categoryIndexInStock = stock.indexOf(category);
                    if (categoryIndexInStock > -1) {
                        stock.splice(categoryIndexInStock, 1);
                    }
                }

                // If no items left in stock, hide buttons and total amount
                if (stock.length === 0) {
                    buyOrderButton.style.display = 'none';
                    cancelBuyOrderButton.style.display = 'none';
                    totalAmountDisplay.style.display = 'none';
                    totalAmountDisplay.textContent = 'Total Amount: $0.00';
                }

                // Re-display stock
                displayStock();
            });
            productItem.appendChild(closeButton);

            // Product image
            const productImage = document.createElement('img');
            productImage.src = product.product_image;
            productImage.alt = product.product_name;

            // Product details
            const productDetails = document.createElement('div');
            productDetails.className = 'product-details';
            productDetails.innerHTML = `
                <p><strong>${product.product_name}</strong></p>
                <p>Quantity: ${product.product_quantity} ${product.product_unit}</p>
                <p>Total Price: $${product.product_amount.toFixed(2)}</p>
            `;

            productItem.appendChild(productImage);
            productItem.appendChild(productDetails);
            productList.appendChild(productItem);
        });

        categorySection.appendChild(productList);
        stockDisplay.appendChild(categorySection);
    });

    // Update total amount display
    const totalAmount = calculateTotalAmount();
    totalAmountDisplay.textContent = `Total Amount: $${totalAmount.toFixed(2)}`;
}


    // Buy Order Button Click
    buyOrderButton.addEventListener('click', function() {
        // Calculate the total amount of the current stock
        const totalAmount = calculateTotalAmount();

        currentAmountInfo.textContent = `Amount of Buying Items: $${totalAmount.toFixed(2)}`;
        totalAmountInput.value = totalAmount.toFixed(2);
        buyOrderModal.style.display = 'block';
    });

    // Close Buy Order Modal
    closeBuyOrderModal.addEventListener('click', function() {
        buyOrderModal.style.display = 'none';
        buyOrderForm.reset();
    });

    // Calculate total amount after discount
    totalDiscountInput.addEventListener('input', function() {
        const totalAmount = calculateTotalAmount();
        const discount = parseFloat(totalDiscountInput.value) || 0;
        const discountedTotal = totalAmount - (totalAmount * (discount / 100));
        totalAmountInput.value = discountedTotal.toFixed(2);
    });

    // Handle Buy Order Form Submission
    buyOrderForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const shopId = localStorage.getItem('shop_id') || 'default_shop_id'; // Replace with actual shop_id retrieval
        const totalAmount = parseFloat(totalAmountInput.value);
        const discount = parseFloat(totalDiscountInput.value) || 0;

        // Generate a unique buying_order_id (e.g., using timestamp)
        const buyingOrderId = 'BO-' + Date.now();

        const buyingOrder = {
            buying_order_id: buyingOrderId,
            shop_id: shopId,
            date: new Date().toISOString(),
            purchaseItems: stock,
            amount: totalAmount,
            discount: discount,
            total: totalAmount
        };

        // Send data to API
        fetch(`${apiURL}/buying_orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(buyingOrder)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Buying Order Created:', data);
            // Reset stock
            stock = [];
            stockDisplay.innerHTML = '';
            buyOrderButton.style.display = 'none';
            cancelBuyOrderButton.style.display = 'none'; // Hide Cancel Buy Order button
            totalAmountDisplay.style.display = 'none'; // Hide Total Amount label
            buyOrderModal.style.display = 'none';
            buyOrderForm.reset();
            totalAmountDisplay.textContent = 'Total Amount: $0.00';
            alert('Purchase order successfully created!');
        })
        .catch(error => console.error('Error creating buying order:', error));
    });

    // Handle Cancel Buy Order Button Click
    cancelBuyOrderButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel the current buy order?')) {
            // Reset stock
            stock = [];
            stockDisplay.innerHTML = '';
            buyOrderButton.style.display = 'none';
            cancelBuyOrderButton.style.display = 'none'; // Hide Cancel Buy Order button
            totalAmountDisplay.style.display = 'none'; // Hide Total Amount label
            totalAmountDisplay.textContent = 'Total Amount: $0.00';
        }
    });
});
