document.addEventListener('DOMContentLoaded', function() {
    const tradeTableBody = document.getElementById('trade-table').querySelector('tbody');

    function loadTransactions() {
        let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        tradeTableBody.innerHTML = ''; // Clear existing table rows

        // Sort transactions to have the latest on top
        transactions.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            const profitOrLoss = transaction.sellingPrice ? 
                (transaction.sellingPrice - transaction.buyingPrice).toFixed(2) : 
                'N/A';

            row.innerHTML = `
                <td>${transaction.stockName}</td>
                <td>${transaction.action}</td>
                <td>₹${transaction.buyingPrice?.toFixed(2) || 'N/A'}</td>
                <td>₹${transaction.sellingPrice?.toFixed(2) || 'N/A'}</td>
                <td>${profitOrLoss !== 'N/A' ? `₹${profitOrLoss}` : profitOrLoss}</td>
                <td>${transaction.dateTime}</td>
            `;
            tradeTableBody.appendChild(row);
        });
    }

    document.getElementById('clear-history-button').addEventListener('click', function() {
        localStorage.removeItem('transactions');
        loadTransactions(); // Refresh the table
    });

    document.getElementById('download-excel-button').addEventListener('click', function() {
        const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

        // Create a workbook and a worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(transactions.map(transaction => ({
            'Stock Name': transaction.stockName,
            'Action': transaction.action,
            'Buying Price': transaction.buyingPrice ? `₹${transaction.buyingPrice.toFixed(2)}` : 'N/A',
            'Selling Price': transaction.sellingPrice ? `₹${transaction.sellingPrice.toFixed(2)}` : 'N/A',
            'Profit/Loss': transaction.sellingPrice ? `₹${(transaction.sellingPrice - transaction.buyingPrice).toFixed(2)}` : 'N/A',
            'Date/Time': transaction.dateTime
        })));

        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

        // Generate a downloadable file
        XLSX.writeFile(wb, 'Transaction_History.xlsx');
    });

    loadTransactions(); // Initial load of transactions
});
