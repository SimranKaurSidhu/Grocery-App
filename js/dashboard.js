document.addEventListener('DOMContentLoaded', function() {

    // Retrieve shop_name from localStorage
    const shopName = localStorage.getItem('shop_name');

    if (shopName) {
        // Display the shop name in the h2 element
        document.getElementById('shopName').textContent = shopName;
        console.log('Shop Name:', shopName);
    } else {
        console.log('No Shop Name found in localStorage.');
        // If shop_name is not found, default to "Dashboard"
        document.getElementById('shopName').textContent = 'Dashboard';
    }

    const tabLinks = document.querySelectorAll('.tab-link');

    // Function to remove 'active' class from all tabs
    function clearActiveClasses() {
        tabLinks.forEach(link => {
            link.classList.remove('active');
        });
    }

    // Add click event to each tab link
    tabLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            clearActiveClasses();
            this.classList.add('active');
        });
    });

    // Highlight the default tab on page load
    if (tabLinks.length > 0) {
        // Check which tab matches the current iframe source
        const iframeSrc = document.querySelector('iframe[name="contentFrame"]').getAttribute('src');
        tabLinks.forEach(link => {
            if (link.getAttribute('href') === iframeSrc) {
                link.classList.add('active');
            }
        });
    }
});
