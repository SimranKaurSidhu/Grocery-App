const apiURL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', function() {
    const addStockButton = document.getElementById('addStockButton');
    const addStockModal = document.getElementById('addStockModal');
    const closeModal = document.getElementById('closeModal');
    const categorySelect = document.getElementById('categorySelect');
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');
    const discountInput = document.getElementById('discountInput');
    const priceInfo = document.getElementById('priceInfo');
    const unitPriceInfo = document.getElementById('unitPriceInfo');
    const productInfoDiv = document.getElementById('productInfo');
    const totalPriceInfo = document.getElementById('totalPriceInfo');
    const confirmAddStock = document.getElementById('confirmAddStock');
    const addStockForm = document.getElementById('addStockForm');
    const stockDisplay = document.getElementById('stockDisplay');
    const buyOrderButton = document.getElementById('buyOrderButton');

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
            discountInput.disabled = false;
            confirmAddStock.disabled = false;
            calculateTotalPrice();
        } else {
            resetProductInfo();
        }
    });

    // Display product information
    function displayProductInfo(product) {
        productInfoDiv.style.display = 'block';
        priceInfo.textContent = `${product.product_weight} ${product.product_unit} / $${product.product_price}`;
        unitPriceInfo.textContent = `Price per unit: $${product.price_per_unit} / ${product.product_weight} ${product.product_unit}`;
    }

    // Reset product information
    function resetProductInfo() {
        selectedProduct = null;
        productInfoDiv.style.display = 'none';
        quantityInput.value = 1;
        discountInput.value = 0;
        quantityInput.disabled = true;
        discountInput.disabled = true;
        confirmAddStock.disabled = true;
        totalPriceInfo.textContent = '';
    }

    // Calculate total price
    function calculateTotalPrice() {
        if (selectedProduct) {
            const quantity = parseFloat(quantityInput.value);
            const discount = parseFloat(discountInput.value);
            const totalPrice = quantity * selectedProduct.price_per_unit;
            const discountedPrice = totalPrice - (totalPrice * (discount / 100));
            totalPriceInfo.textContent = `Total Price: $${discountedPrice.toFixed(2)}`;
        }
    }

    quantityInput.addEventListener('input', calculateTotalPrice);
    discountInput.addEventListener('input', calculateTotalPrice);

    // Handle Add Stock Form Submission
    addStockForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (selectedProduct) {
            const quantity = parseFloat(quantityInput.value);
            const discount = parseFloat(discountInput.value);
            const totalPrice = quantity * selectedProduct.price_per_unit;
            const discountedPrice = totalPrice - (totalPrice * (discount / 100));

            // Create product object to add to stock
            const productToAdd = {
                product_name: selectedProduct.product_name,
                product_unit: selectedProduct.product_unit,
                product_weight: selectedProduct.product_weight,
                product_price: selectedProduct.product_price,
                price_per_unit: selectedProduct.price_per_unit,
                product_quantity: quantity,
                product_discount: discount,
                product_amount: discountedPrice,
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

            // Display in console
            console.log('Current Stock:', JSON.stringify(stock, null, 2));

            // Show Buy Order Button if stock has items
            if (stock.length > 0) {
                buyOrderButton.style.display = 'inline-block';
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

    // Function to display the current stock on the page
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

                // Product details
                productItem.innerHTML = `
                    <p><strong>Product Name:</strong> ${product.product_name}</p>
                    <p><strong>Quantity:</strong> ${product.product_quantity}</p>
                    <p><strong>Discount:</strong> ${product.product_discount}%</p>
                    <p><strong>Total Amount:</strong> $${product.product_amount.toFixed(2)}</p>
                `;

                productList.appendChild(productItem);
            });

            categorySection.appendChild(productList);
            stockDisplay.appendChild(categorySection);
        });
    }

    // Buy Order Button Click
    buyOrderButton.addEventListener('click', function() {
        // Calculate the total amount of the current stock
        const totalAmount = stock.reduce((sum, category) => {
            return sum + category.products.reduce((catSum, product) => {
                return catSum + product.product_amount;
            }, 0);
        }, 0);

        currentAmountInfo.textContent = `Amount of Current Stock: $${totalAmount.toFixed(2)}`;
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
        const totalAmount = parseFloat(totalAmountInput.value);
        const discount = parseFloat(totalDiscountInput.value);
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

        console.log('Buying Order:', buyingOrder);
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
            buyOrderModal.style.display = 'none';
            buyOrderForm.reset();
            alert('Purchase order successfully created!');
        })
        .catch(error => console.error('Error creating buying order:', error));
    });
});
