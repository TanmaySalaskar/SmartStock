document.addEventListener('DOMContentLoaded', function() {
    let stockChart;
    let intervalId; // Declare intervalId in the outer scope

    const predefinedStocks = [
        { name: 'Reliance', price: 2950, open: 2800, high: 3100, low: 2795, close: 2900 },
        { name: 'TATA', price: 4220, open: 4150, high: 4380, low: 4100, close: 4218 },
        { name: 'HDFC Bank', price: 1650, open: 1500, high: 1700, low: 1600, close: 1630 },
        { name: 'Infosys', price: 1770, open: 1650, high: 1800, low: 1600, close: 1700 },
        { name: 'ICICI Bank', price: 1170, open: 1000, high: 1200, low: 1100, close: 1152 },
        { name: 'LIC', price: 1133, open: 998, high: 1150, low: 1100, close: 1128 },
        { name: 'Sun Pharma', price: 1735, open: 1688, high: 1800, low: 1700, close: 1721 },
        { name: 'JSW', price: 900, open: 852, high: 950, low: 850, close: 888 },
        { name: 'Adani', price: 3200, open: 3001, high: 3300, low: 3100, close: 3164 },
        { name: 'Wipro', price: 500, open: 421, high: 520, low: 480, close: 493 }
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
            dropdown.style.border = '1px solid';
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
            let message = `Stock: ${selectedStock.name} `;
            let action = '';
            let profitOrLoss = 0;

            if (stock.currentPrice <= lowLimit) {
                profitOrLoss = stock.purchasePrice - stock.currentPrice;
                message += `Selling at ₹${stock.currentPrice.toFixed(2)} - Loss: ₹${profitOrLoss.toFixed(2)}`;
                action = 'Sold';
            } else if (stock.currentPrice >= highLimit + 1) { // Sell if price goes 1 rupee above the high limit
                profitOrLoss = stock.currentPrice - stock.purchasePrice;
                message += `Selling at ₹${stock.currentPrice.toFixed(2)} - Profit: ₹${profitOrLoss.toFixed(2)}`;
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
        
        function showNotification(message, soundType) {
            const container = document.getElementById('notification-container');
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.style.backgroundColor = 'white';
            notification.style.color = 'black';
            notification.style.padding = '10px';
            notification.style.marginBottom = '5px';
            notification.style.borderRadius = '5px';
            notification.style.boxShadow = '0px 0px 5px rgba(0,0,0,0.5)';
            notification.style.position = 'relative';
            notification.style.animation = 'popin 0.5s ease-out';
            notification.textContent = message;
            container.appendChild(notification);
        
            // Play the appropriate notification sound if it exists
            const audio = document.getElementById(`notification-sound-${soundType}`);
            if (audio) {
                audio.play().catch(error => {
                    console.warn(`Error playing sound ${soundType}: ${error}`);
                });
            }
        
            // Automatically remove the notification after a few seconds
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
        
        function simulateContinuousPriceChanges() {
            const startTime = Date.now();
            const simulationDuration = 30000; // 30 seconds
        
            intervalId = setInterval(() => {
                const currentTime = Date.now();
        
                // If the simulation duration is reached, stop the simulation
                if (currentTime - startTime >= simulationDuration) {
                    clearInterval(intervalId);
        
                    const { message, action } = updateStatus(stock);
                    statusLabel.textContent = message;
        
                    if (action === 'Sold') {
                        saveTransaction(selectedStock.name, action, stock.purchasePrice, stock.currentPrice, 1, new Date().toLocaleString());
                    }
        
                    // Update the chart with final data
                    stockChart.data.labels.push(luxon.DateTime.now().toJSDate());
                    stockChart.data.datasets[0].data.push(stock.currentPrice);
                    stockChart.update();
                } else {
                    // Random fluctuation in price
                    const fluctuation = (Math.random() - 0.5) * 300;
                    stock.currentPrice += fluctuation;
        
                    // Notify if price hits or exceeds the high limit
                    if (stock.currentPrice > highLimit) {
                        showNotification("Price went high", "high");
                    }
        
                    // Notify if price drops below the purchase price
                    if (stock.currentPrice < stock.purchasePrice) {
                        showNotification("Price getting low", "low");
                    }
        
                    // Update the status label
                    const { message } = updateStatus(stock);
                    statusLabel.textContent = message;
        
                    // Update the chart with current price
                    stockChart.data.labels.push(luxon.DateTime.now().toJSDate());
                    stockChart.data.datasets[0].data.push(stock.currentPrice);
                    stockChart.update();
                }
            }, 3000); // Update every 3 seconds
        }
        

        simulateContinuousPriceChanges();  // Start simulating continuous price changes
    });
});