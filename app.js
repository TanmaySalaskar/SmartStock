document.addEventListener('DOMContentLoaded', function() {
    let stockChart; // Reference to the chart instance

    // Predefined list of stocks
    const predefinedStocks = [
        { name: 'Reliance', price: 2950 },
        { name: 'TATA', price: 4220 },
        { name: 'HDFC Bank', price: 1650 },
        { name: 'Infosys', price: 1770 },
        { name: 'ICICI Bank', price: 1170 },
        { name: 'LIC', price: 1133 },
        { name: 'Sun Pharma', price: 1735 },
        { name: 'JSW', price: 900 },
        { name: 'Adani', price: 3200 },
        { name: 'Wipro', price: 500 }
    ];

    // Populate the stock list
    const stockList = document.getElementById('stock-list');
    predefinedStocks.forEach(stock => {
        const listItem = document.createElement('li');
        listItem.textContent = `${stock.name}: ₹${stock.price.toFixed(2)}`;
        listItem.dataset.price = stock.price;  // Store the price in data attribute
        stockList.appendChild(listItem);
    });

    document.getElementById('submit-button').addEventListener('click', function() {
        const stockName = document.getElementById('stock-name').value;
        const selectedStock = predefinedStocks.find(stock => stock.name.toLowerCase() === stockName.toLowerCase());

        if (!selectedStock) {
            alert('Please select a valid stock from the list.');
            return;
        }

        const lowLimit = parseFloat(document.getElementById('low-limit').value);
        const highLimit = parseFloat(document.getElementById('high-limit').value);

        if (isNaN(lowLimit) || isNaN(highLimit)) {
            alert('Please enter valid numeric values for limits.');
            return;
        }

        let stock = {
            id: 1,
            purchasePrice: selectedStock.price,
            currentPrice: selectedStock.price,
            boughtTime: Date.now()
        };

        const statusLabel = document.getElementById('status-label');

        saveTransaction(selectedStock.name, 'Bought', selectedStock.price, null, 1, new Date().toLocaleString());

        // Destroy previous chart instance if it exists
        if (stockChart) {
            stockChart.destroy();
        }

        // Create a new chart instance
        const ctx = document.getElementById('stock-graph').getContext('2d');
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: `${selectedStock.name} Price`,
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'second'
                        },
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price (₹)'
                        }
                    }
                }
            }
        });

        function updateStatus(stock) {
            let message = `Stock: `;
            let action = '';
            let profitOrLoss = 0;

            if (stock.currentPrice <= lowLimit) {
                profitOrLoss = stock.purchasePrice - stock.currentPrice;
                message += `Sold at ₹${stock.currentPrice.toFixed(2)} - Loss: ₹${profitOrLoss.toFixed(2)}`;
                action = 'Sold';
            } else if (stock.currentPrice > highLimit + 1) { // Sell if price goes 1 rupee above the high limit
                profitOrLoss = stock.currentPrice - stock.purchasePrice;
                message += `Sold at ₹${stock.currentPrice.toFixed(2)} - Profit: ₹${profitOrLoss.toFixed(2)}`;
                action = 'Sold';
            } else {
                message += `No Sale. Holding at ₹${stock.currentPrice.toFixed(2)}`;
                action = 'Held';
            }

            if (action === 'Sold') {
                saveTransaction(selectedStock.name, action, stock.purchasePrice, stock.currentPrice, 1, new Date().toLocaleString());
            }

            return message;
        }

        function saveTransaction(stockName, action, buyingPrice, sellingPrice, quantity, dateTime) {
            let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            transactions.push({ stockName, action, buyingPrice, sellingPrice, quantity, dateTime });
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }

        // Simulate continuous price changes
        function simulateContinuousPriceChanges() {
            setTimeout(() => {
                const fluctuation = (Math.random() - 0.6) * 200;  // Random fluctuation
                stock.currentPrice += fluctuation;  // Adjust current price

                // Ensure the price doesn't drop below the low limit
                if (stock.currentPrice < lowLimit) {
                    stock.currentPrice = lowLimit;
                }

                const message = updateStatus(stock);
                statusLabel.textContent = message;

                // Update the chart
                stockChart.data.labels.push(luxon.DateTime.now().toJSDate());
                stockChart.data.datasets[0].data.push(stock.currentPrice);
                stockChart.update();

                if (statusLabel.textContent.includes('Holding')) {
                    simulateContinuousPriceChanges();  // Continue simulation if holding
                }
            }, 1000);  // Update every 1 second
        }

        simulateContinuousPriceChanges();  // Start simulating continuous price changes
    });
});
