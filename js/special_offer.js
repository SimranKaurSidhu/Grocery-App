/* js/special_offer.js */

const apiURL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
    const offerTableBody = document.querySelector('#offerTable tbody');
    const addOfferButton = document.getElementById('addOfferButton');

    const offerModal = document.getElementById('offerModal');
    const modalTitle = document.getElementById('modalTitle');
    const closeButton = document.querySelector('.close-button');
    const cancelButton = document.getElementById('cancelButton');
    const saveButton = document.getElementById('saveButton');

    const offerForm = document.getElementById('offerForm');
    const offerNameInput = document.getElementById('offerName');
    const discountPercentageInput = document.getElementById('discountPercentage');
    const discountAmountInput = document.getElementById('discountAmount');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    const shopId = localStorage.getItem('shop_id');

    if (!shopId) {
        alert('Shop ID not found. Please log in.');
        window.location.href = 'login.html'; // Redirect to login page or appropriate page
        return;
    }

    let offers = [];
    let editingOfferId = null;

    // Fetch existing offers
    fetch(`${apiURL}/special_offers/${shopId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch offers.');
            }
            return response.json();
        })
        .then(data => {
            offers = data;
            renderOffers();
        })
        .catch(error => {
            console.error('Error fetching offers:', error);
            offerTableBody.innerHTML = '<tr><td colspan="6">Error loading offers</td></tr>';
        });

    // Function to render offers in the table
    function renderOffers() {
        offerTableBody.innerHTML = '';
        if (offers.length === 0) {
            offerTableBody.innerHTML = '<tr><td colspan="6">No special offers available.</td></tr>';
            return;
        }

        offers.forEach(offer => {
            const row = document.createElement('tr');

            // Offer Name
            const nameCell = document.createElement('td');
            nameCell.textContent = offer.offer_name;
            row.appendChild(nameCell);

            // Discount Percentage
            const percentageCell = document.createElement('td');
            percentageCell.textContent = offer.discount_percentage ? `${offer.discount_percentage}%` : '-';
            row.appendChild(percentageCell);

            // Discount Amount
            const amountCell = document.createElement('td');
            amountCell.textContent = offer.discount_amount ? `$${offer.discount_amount}` : '-';
            row.appendChild(amountCell);

            // Start Date
            const startDateCell = document.createElement('td');
            startDateCell.textContent = offer.offer_start_date;
            row.appendChild(startDateCell);

            // End Date
            const endDateCell = document.createElement('td');
            endDateCell.textContent = offer.offer_end_date;
            row.appendChild(endDateCell);

            // Actions
            const actionCell = document.createElement('td');
            actionCell.classList.add('action-buttons');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => {
                openModal('Edit Offer', offer);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', () => {
                deleteOffer(offer.offer_id);
            });

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            offerTableBody.appendChild(row);
        });
    }

    // Function to open the modal for adding/editing
    function openModal(title, offer = null) {
        modalTitle.textContent = title;
        offerModal.style.display = 'block';

        if (offer) {
            // Editing existing offer
            editingOfferId = offer.offer_id;
            offerNameInput.value = offer.offer_name;
            discountPercentageInput.value = offer.discount_percentage || '';
            discountAmountInput.value = offer.discount_amount || '';
            startDateInput.value = offer.offer_start_date;
            endDateInput.value = offer.offer_end_date;
        } else {
            // Adding new offer
            editingOfferId = null;
            offerForm.reset();
        }
    }

    // Function to close the modal
    function closeModal() {
        offerModal.style.display = 'none';
    }

    // Add Offer button event listener
    addOfferButton.addEventListener('click', () => {
        openModal('Add New Offer');
    });

    // Close button event listener
    closeButton.addEventListener('click', closeModal);

    // Cancel button event listener
    cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    // Save button (form submit) event listener
    offerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const offerName = offerNameInput.value.trim();
        const discountPercentage = parseFloat(discountPercentageInput.value) || 0;
        const discountAmount = parseFloat(discountAmountInput.value) || 0;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (offerName === '' || startDate === '' || endDate === '') {
            alert('Please fill in all required fields.');
            return;
        }

        if (discountPercentage <= 0 && discountAmount <= 0) {
            alert('Please provide a discount percentage or amount.');
            return;
        }

        if (editingOfferId) {
            // Update existing offer
            const offerData = {
                offer_id: editingOfferId,
                offer_name: offerName,
                shop_id: shopId,
                discount_percentage: discountPercentage,
                discount_amount: discountAmount,
                offer_start_date: startDate,
                offer_end_date: endDate
            };

            fetch(`${apiURL}/special_offers/${editingOfferId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(offerData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update offer.');
                }
                return response.json();
            })
            .then(updatedOffer => {
                // Update offer in the list
                const index = offers.findIndex(o => o.offer_id === editingOfferId);
                offers[index] = updatedOffer;
                renderOffers();
                closeModal();
                alert('Offer updated successfully!');
            })
            .catch(error => {
                console.error('Error updating offer:', error);
                alert('Failed to update offer.');
            });
        } else {
            // Create new offer
            const offerId = 'OF-' + Date.now(); // Generate a unique offer_id
            const offerData = {
                offer_id: offerId,
                offer_name: offerName,
                shop_id: shopId,
                discount_percentage: discountPercentage,
                discount_amount: discountAmount,
                offer_start_date: startDate,
                offer_end_date: endDate
            };

            fetch(`${apiURL}/special_offers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(offerData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to create offer.');
                }
                return response.json();
            })
            .then(newOffer => {
                offers.push(newOffer);
                renderOffers();
                closeModal();
                alert('Offer created successfully!');
            })
            .catch(error => {
                console.error('Error creating offer:', error);
                alert('Failed to create offer.');
            });
        }
    });

    // Function to delete an offer
    function deleteOffer(offerId) {
        if (!confirm('Are you sure you want to delete this offer?')) {
            return;
        }

        fetch(`${apiURL}/special_offers/${offerId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete offer.');
            }
            // Remove offer from the list
            offers = offers.filter(o => o.offer_id !== offerId);
            renderOffers();
            alert('Offer deleted successfully!');
        })
        .catch(error => {
            console.error('Error deleting offer:', error);
            alert('Failed to delete offer.');
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === offerModal) {
            closeModal();
        }
    });
});
