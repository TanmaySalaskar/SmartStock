document.addEventListener('DOMContentLoaded', function() {
    const transactionsTableBody = document.getElementById('transactions-table').querySelector('tbody');
    const clearHistoryButton = document.getElementById('clear-history');
    const downloadExcelButton = document.getElementById('download-excel');
    
    // Load transactions from localStorage
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    loadTransactions(transactions);

    // Function to load transactions into the table
    function loadTransactions(transactions) {
        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${transaction.type}</td>
                <td>${transaction.stockName}</td>
                <td>₹${transaction.price.toFixed(2)}</td>
                <td>${transaction.quantity}</td>
                <td>₹${transaction.profitLoss ? transaction.profitLoss.toFixed(2) : '0.00'}</td>
                <td>${new Date(transaction.date).toLocaleString()}</td>
            `;
            transactionsTableBody.appendChild(row);
        });
    }

    // Clear history button functionality
    clearHistoryButton.addEventListener('click', function() {
        if (confirm("Are you sure you want to clear the transaction history?")) {
            localStorage.removeItem('transactions'); // Clear transactions from localStorage
            transactionsTableBody.innerHTML = ''; // Clear the table body
            toastr.options = {
                closeButton: true,
                newestOnTop: true,
                progressBar: true,
                positionClass: "toast-top-center",
                preventDuplicates: true,
                timeOut: 6000,
                showEasing: "swing",
                hideEasing: "linear",
                showMethod: "fadeIn",
                hideMethod: "fadeOut",
                tapToDismiss: true,
                };
            toastr.info("Transaction history cleared.");
        }
    });

    // Download Excel button functionality
    downloadExcelButton.addEventListener('click', function() {
        const csvContent = generateCSV(transactions);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'transactions.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Function to generate CSV content
    function generateCSV(transactions) {
        const header = "Type,Stock Name,Price (₹),Quantity,Profit (₹),Date\n";
        const rows = transactions.map(transaction => {
            return `${transaction.type},${transaction.stockName},${transaction.price},${transaction.quantity},${transaction.profitLoss ? transaction.profitLoss : 0},${new Date(transaction.date).toLocaleString()}`;
        }).join("\n");
        return header + rows;
    }
});
