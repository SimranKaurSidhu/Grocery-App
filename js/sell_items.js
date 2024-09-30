document.addEventListener('DOMContentLoaded', function() {
    const sellForm = document.getElementById('sellForm');

    sellForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const itemCode = document.getElementById('itemCode').value;
        const quantity = document.getElementById('quantity').value;

        // Process the sale (placeholder logic)
        alert(`Sold ${quantity} units of Item Code: ${itemCode}`);
    });
});
