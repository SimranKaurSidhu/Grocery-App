document.addEventListener('DOMContentLoaded', function() {
    const returnForm = document.getElementById('returnForm');

    returnForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const orderId = document.getElementById('orderId').value;
        const reason = document.getElementById('reason').value;

        // Process the return order (placeholder logic)
        alert(`Return processed for Order ID: ${orderId}\nReason: ${reason}`);
    });
});
