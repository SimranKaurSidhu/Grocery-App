document.addEventListener('DOMContentLoaded', function() {
    const orders = [
        { orderId: 'ORD001', itemCode: 'ITM1001', quantity: 10, status: 'Pending' },
        { orderId: 'ORD002', itemCode: 'ITM1002', quantity: 5, status: 'Shipped' },
        // Add more orders as needed
    ];

    const ordersTableBody = document.querySelector('#ordersTable tbody');

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.orderId}</td>
            <td>${order.itemCode}</td>
            <td>${order.quantity}</td>
            <td>${order.status}</td>
        `;
        ordersTableBody.appendChild(row);
    });
});
