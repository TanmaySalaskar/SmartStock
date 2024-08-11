document.addEventListener('DOMContentLoaded', function() {
    const tradeTableBody = document.getElementById('trade-table').querySelector('tbody');

    // Function to load transactions into the table
    function loadTransactions() {
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        tradeTableBody.innerHTML = ''; // Clear existing table rows

        // Sort transactions to have the latest on top
        transactions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        transactions.forEach(transaction => {
            const row = document.createElement('tr');

            // Check if the stock has been sold
            const profitOrLoss = transaction.sellingPrice ? 
                (transaction.sellingPrice - transaction.buyingPrice).toFixed(2) : 
                'N/A';

            // Calculate time since purchase
            const timeSincePurchase = (new Date() - new Date(transaction.dateTime)) / 1000;
            const profitOrLossDisplay = profitOrLoss !== 'N/A' ? 
                `₹${profitOrLoss}` : 
                (timeSincePurchase > 8 ? 'Held' : 'N/A');

            row.innerHTML = `
                <td>${transaction.stockName}</td>
                <td>${transaction.action}</td>
                <td>₹${transaction.buyingPrice ? transaction.buyingPrice.toFixed(2) : 'N/A'}</td>
                <td>₹${transaction.sellingPrice ? transaction.sellingPrice.toFixed(2) : 'N/A'}</td>
                <td>${profitOrLossDisplay}</td>
                <td>${transaction.dateTime}</td>
            `;
            tradeTableBody.appendChild(row);
        });
    }

    // Event listener for clearing transaction history
    document.getElementById('clear-history-button').addEventListener('click', function() {
        localStorage.removeItem('transactions');
        loadTransactions(); // Refresh the table
    });

    // Event listener for downloading transaction history as Excel
    document.getElementById('download-excel-button').addEventListener('click', function() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

        // Create a workbook and a worksheet
        const wb = XLSX.utils.book_new();
        const wsData = transactions.map(transaction => ({
            'Stock Name': transaction.stockName,
            'Action': transaction.action,
            'Buying Price': transaction.buyingPrice ? `₹${transaction.buyingPrice.toFixed(2)}` : 'N/A',
            'Selling Price': transaction.sellingPrice ? `₹${transaction.sellingPrice.toFixed(2)}` : 'N/A',
            'Profit/Loss': transaction.sellingPrice ? `₹${(transaction.sellingPrice - transaction.buyingPrice).toFixed(2)}` : 
                         ((new Date() - new Date(transaction.dateTime)) / 1000 > 8 ? 'Held' : 'N/A'),
            'Date/Time': transaction.dateTime
        }));

        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

        // Generate a downloadable file
        XLSX.writeFile(wb, 'Transaction_History.xlsx');
    });

    // Initial load of transactions
    loadTransactions();
});
