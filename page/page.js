document.addEventListener('DOMContentLoaded', function() {
    let stockChart;
    let intervalId; // Declare intervalId in the outer scope

    const predefinedStocks = [
        { name: 'Reliance', price: 2950, open: 2800, high: 3100, low: 2795, close: 2900 },
        { name: 'TATA', price: 4220, open: 4150, high: 4380, low: 4100, close: 4218 },
        { name: 'HDFC Bank', price: 1650, open: 1, high: 1700, low: 1600, close: 1 },
        { name: 'Infosys', price: 1770, open: 1, high: 1800, low: 1600, close: 1 },
        { name: 'ICICI Bank', price: 1170, open: 1, high: 1200, low: 1100, close: 1 },
        { name: 'LIC', price: 1133, open: 1, high: 1150, low: 1100, close: 1 },
        { name: 'Sun Pharma', price: 1735, open: 1, high: 1800, low: 1700, close: 1 },
        { name: 'JSW', price: 900, open: 1, high: 950, low: 850, close: 1 },
        { name: 'Adani', price: 3200, open: 1, high: 3300, low: 3100, close: 1 },
        { name: 'Wipro', price: 500, open: 1, high: 520, low: 480, close: 1 }
    ];

    const stockList = document.getElementById('stock-list');
    predefinedStocks.forEach(stock => {
        const listItem = document.createElement('li');
        listItem.textContent = `${stock.name}: ₹${stock.price.toFixed(2)}`;
        listItem.dataset.price = stock.price;
        listItem.dataset.open = stock.open;
        listItem.dataset.high = stock.high;
        listItem.dataset.low = stock.low;
        listItem.dataset.close = stock.close;
        stockList.appendChild(listItem);

        listItem.addEventListener('mouseover', function() {
            let dropdown = document.createElement('div');
            dropdown.className = 'dropdown';
            dropdown.style.position = 'absolute';
            dropdown.style.backgroundColor = 'white';
            dropdown.style.border = '1px solid #ccc';
            dropdown.style.padding = '5px';
            dropdown.style.boxShadow = '0px 0px 10px rgba(0,0,0,0.1)';
            dropdown.innerHTML = `
                <h3>YESTERDAY'S</h3>
                <p>Open: ₹${listItem.dataset.open}</p>
                <p>High: ₹${listItem.dataset.high}</p>
                <p>Low: ₹${listItem.dataset.low}</p>
                <p>Close: ₹${listItem.dataset.close}</p>
            `;
            listItem.appendChild(dropdown);

            listItem.addEventListener('mouseleave', function() {
                dropdown.remove();
            });
        });
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

        // Create a new chart instance
        const ctx = document.getElementById('stock-graph').getContext('2d');
        if (stockChart) {
            stockChart.destroy();
        }

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

            return { message, action };
        }

        function saveTransaction(stockName, action, buyingPrice, sellingPrice, quantity, dateTime) {
            let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
            transactions.push({ stockName, action, buyingPrice, sellingPrice, quantity, dateTime });
            localStorage.setItem('transactions', JSON.stringify(transactions));
        }

        // Function to show a non-intrusive notification with sound
        function showNotification(message) {
            const container = document.getElementById('notification-container');
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            notification.style.color = 'white';
            notification.style.padding = '10px';
            notification.style.marginBottom = '5px';
            notification.style.borderRadius = '5px';
            notification.style.boxShadow = '0px 0px 5px rgba(0,0,0,0.5)';
            notification.style.position = 'relative';
            notification.style.animation = 'popin 0.5s ease-out';
            notification.textContent = message;
            container.appendChild(notification);

            // Play the notification sound
            const audio = document.getElementById('notification-sound');
            audio.play();

            // Automatically remove the notification after a few seconds
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }

        // Simulate continuous price changes
        function simulateContinuousPriceChanges() {
            const startTime = Date.now();
            const simulationDuration = 30000; // 30 seconds

            intervalId = setInterval(() => {
                const currentTime = Date.now();

                // Ensure the price does not go below the low limit
                if (stock.currentPrice < lowLimit) {
                    stock.currentPrice = lowLimit;
                }

                // Notify if price is dropping below the purchase price
                if (stock.currentPrice < stock.purchasePrice) {
                    showNotification("Price getting low");  // Show a non-intrusive notification
                }

                if (currentTime - startTime >= simulationDuration) {
                    clearInterval(intervalId);  // Stop the simulation

                    // Update the status label
                    const { message, action } = updateStatus(stock);
                    statusLabel.textContent = message;

                    // Save the transaction if the action was 'Sold'
                    if (action === 'Sold') {
                        saveTransaction(selectedStock.name, action, stock.purchasePrice, stock.currentPrice, 1, new Date().toLocaleString());
                    }

                    // Update the chart with the final data
                    stockChart.data.labels.push(luxon.DateTime.now().toJSDate());
                    stockChart.data.datasets[0].data.push(stock.currentPrice);
                    stockChart.update();
                } else {
                    const fluctuation = (Math.random() - 0.5) * 300;  // Random fluctuation
                    stock.currentPrice += fluctuation;  // Adjust current price

                    // Ensure the price does not go below the low limit
                    if (stock.currentPrice < lowLimit) {
                        stock.currentPrice = lowLimit;
                    }

                    // Check if the price exceeds the high limit
                    if (stock.currentPrice > highLimit) {
                        showNotification("Price went high");  // Show a non-intrusive notification
                    }

                    // Update the status label
                    const { message } = updateStatus(stock);
                    statusLabel.textContent = message;

                    // Update the chart
                    stockChart.data.labels.push(luxon.DateTime.now().toJSDate());
                    stockChart.data.datasets[0].data.push(stock.currentPrice);
                    stockChart.update();
                }
            }, 3000);  // Update every 3 seconds
        }

        simulateContinuousPriceChanges();  // Start simulating continuous price changes
    });
});
