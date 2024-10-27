document.addEventListener('DOMContentLoaded', function() {
    let stocks = []; // Store multiple stocks
    let stockChart; // Main chart instance
    let intervalIds = []; // Store interval IDs for each stock
    let overallIntervalId; // Interval ID for overall simulation control
    let transactions = []; // Array to track all transactions

    const predefinedStocks = [
        { name: 'Reliance', price: 2950, yesterday: { high: 3200, low: 2800, open: 2910, close: 2945 } },
        { name: 'TATA', price: 4220, yesterday: { high: 4400, low: 4100, open: 4150, close: 4205 } },
        { name: 'HDFC Bank', price: 1650, yesterday: { high: 1850, low: 1600, open: 1610, close: 1635 } },
        { name: 'Infosys', price: 1770, yesterday: { high: 1850, low: 1710, open: 1720, close: 1730 } },
        { name: 'ICICI Bank', price: 1170, yesterday: { high: 1300, low: 1050, open: 1140, close: 1165 } },
        { name: 'LIC', price: 1133, yesterday: { high: 1250, low: 1000, open: 1120, close: 1050 } },
        { name: 'Sun Pharma', price: 1735, yesterday: { high: 1750, low: 1700, open: 1720, close: 1735 } },
        { name: 'JSW', price: 900, yesterday: { high: 920, low: 880, open: 885, close: 895 } },
        { name: 'Adani', price: 3200, yesterday: { high: 3250, low: 3100, open: 3150, close: 3180 } },
        { name: 'Wipro', price: 500, yesterday: { high: 530, low: 490, open: 480, close: 495 } }
    ];

    const stockList = document.getElementById('stock-list');
    const boughtStocksList = document.getElementById('bought-stocks-list');
    const simulationStatusMessage = document.getElementById('simulation-status-message');

    // Populate the predefined stock list
    predefinedStocks.forEach(stock => {
        const listItem = document.createElement('li');
        listItem.textContent = `${stock.name}: ₹${stock.price.toFixed(2)}`;

        listItem.addEventListener('mouseover', function(event) {
            const dropdown = document.getElementById('stock-dropdown');
            dropdown.style.left = '350px';
            dropdown.style.top = `${event.pageY}px`;
            dropdown.style.display = 'block';

            dropdown.innerHTML = `
                <strong>Yesterday's</strong><br>
                High: ₹${stock.yesterday.high}<br>
                Low: ₹${stock.yesterday.low}<br>
                Open: ₹${stock.yesterday.open}<br>
                Close: ₹${stock.yesterday.close}
            `;
        });

        listItem.addEventListener('mouseout', function() {
            document.getElementById('stock-dropdown').style.display = 'none';
        });

        stockList.appendChild(listItem);
    });

    function initChart() {
        const ctx = document.getElementById('stock-graph').getContext('2d');
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'second',
                            tooltipFormat: 'll HH:mm:ss',
                            displayFormats: {
                                second: 'HH:mm:ss'
                            }
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
        
        // Load held stocks from localStorage
        loadHeldStocks();
    }

    function loadHeldStocks() {
        const heldStocks = JSON.parse(localStorage.getItem('heldStocks')) || [];
        
        heldStocks.forEach(stock => {
            // Reconstruct the stock object with necessary properties
            const reconstructedStock = {
                name: stock.name,
                purchasePrice: stock.purchasePrice,
                currentPrice: stock.currentPrice,
                lowLimit: stock.lowLimit,
                highLimit: stock.highLimit,
                boughtTime: stock.boughtTime,
                quantity: stock.quantity,
                chartIndex: stocks.length,
            };

            stocks.push(reconstructedStock);
            addBoughtStockItem(reconstructedStock);
            addStockDataset(reconstructedStock);
            startSimulation(reconstructedStock); // Start simulation for held stocks
        });
    }

    document.getElementById('submit-button').addEventListener('click', function() {
        const stockName = document.getElementById('stock-name').value;
        const selectedStock = predefinedStocks.find(stock => stock.name.toLowerCase() === stockName.toLowerCase());

        if (!selectedStock) {
            toastr.options = {
            closeButton: true,
            newestOnTop: true,
            positionClass: "toast-top-center",
            preventDuplicates: true,
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut",
            tapToDismiss: true,
            };            
            toastr.warning("Please select a valid stock from the list.");
            return;
        }

        const lowLimit = parseFloat(document.getElementById('low-limit').value);
        const highLimit = parseFloat(document.getElementById('high-limit').value);
        const volume = parseInt(document.getElementById('volume').value) || 1;

        if (isNaN(lowLimit) || isNaN(highLimit) || volume <= 0) {
            toastr.options = {
                closeButton: true,
                newestOnTop: true,
                positionClass: "toast-top-center",
                preventDuplicates: true,
                timeOut: 6000,
                showEasing: "swing",
                hideEasing: "linear",
                showMethod: "fadeIn",
                hideMethod: "fadeOut",
                tapToDismiss: true,
                };
            toastr.warning("Please enter valid numeric values for limits and quantity.");
            return;
        }

        // Prepare confirmation message
        const totalCost = selectedStock.price * volume;
        const confirmationMessage = `Are you sure you want to buy ${volume} shares of ${selectedStock.name} at ₹${selectedStock.price.toFixed(2)} each?\nTotal: ₹${totalCost.toFixed(2)}`;

        // Show the payment confirmation modal
        document.getElementById('confirmation-message').textContent = confirmationMessage;
        document.getElementById('payment-confirmation-modal').style.display = 'block';

        // Handle confirmation
        document.getElementById('confirm-payment-button').onclick = function() {
            const stock = {
                name: selectedStock.name,
                purchasePrice: selectedStock.price,
                currentPrice: selectedStock.price,
                lowLimit: lowLimit,
                highLimit: highLimit,
                boughtTime: Date.now(),
                quantity: volume,
                chartIndex: stocks.length,
            };

            stocks.push(stock);
            console.log("Stock added:", stock); // Log added stock
            addBoughtStockItem(stock);
            addStockDataset(stock);
            startSimulation(stock);

             // Store the transaction in localStorage
    transactions.push({
        type: 'Buy',
        stockName: stock.name,
        price: stock.purchasePrice,
        quantity: stock.quantity,
        profitLoss: 0, // No profit/loss at the time of purchase,
        date: stock.boughtTime
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));

            // Close the modal after confirming
            document.getElementById('payment-confirmation-modal').style.display = 'none';
        };

        // Handle cancellation
        document.getElementById('cancel-payment-button').onclick = function() {
            document.getElementById('payment-confirmation-modal').style.display = 'none';
        };
    });

    function addBoughtStockItem(stock) {
        const listItem = document.createElement('li');
        const total = stock.currentPrice * stock.quantity;

        listItem.textContent = `${stock.name} - ₹${stock.currentPrice.toFixed(2)} (Volume: ${stock.quantity}) = ₹${total.toFixed(2)}`;
        listItem.style.color = stock.currentPrice > stock.purchasePrice ? 'green' : 'red'; // Set initial color

        boughtStocksList.appendChild(listItem); // Append list item to the bought stocks list
        stock.listItem = listItem; // Store reference for updating

        console.log("Stock added:", stock.name);
    }


    function addStockDataset(stock) {
        stockChart.data.datasets.push({
            label: stock.name,
            data: [],
            borderColor: randomColor(),
            borderWidth: 3,
            fill: false,
            tension: 0.2 // Adjust tension for smoothness (0 = straight line, 1 = very smooth)
        });
        stockChart.update();
    }

    function randomColor() {
        return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;
    }

    function startSimulation(stock) {
        if (!overallIntervalId) {
            overallIntervalId = setTimeout(() => {
                clearAllSimulations();
                showOverallCompletionNotification();
            }, 90000); // Change this to 90000 for 90 seconds
        }

        const intervalId = setInterval(() => {
            simulatePriceChange(stock);
        }, 5000);
        
        intervalIds.push(intervalId);
        simulatePriceChange(stock);
    }

    function clearAllSimulations() {
        intervalIds.forEach(intervalId => clearInterval(intervalId)); // Clear all individual stock intervals
        intervalIds = []; // Reset the array
        if (overallIntervalId) {
            clearTimeout(overallIntervalId); // Clear the overall timeout
            overallIntervalId = null; // Reset the variable
        }
    }

    function simulatePriceChange(stock) {
        const fluctuation = (Math.random() - 0.5) * 50; // Random price fluctuation
        const previousPrice = stock.currentPrice;

        stock.currentPrice = Math.max(0, stock.currentPrice + fluctuation); // Update price

        // Update chart data
    const labelTime = luxon.DateTime.now().toJSDate();
    stockChart.data.labels.push(labelTime);
    stockChart.data.datasets[stock.chartIndex].data.push(stock.currentPrice);
    stockChart.update(); // Update the chart after adding new data

        // Update the bought stocks list with the new price
        if (stock.listItem) {
            const total = stock.currentPrice * stock.quantity;
            stock.listItem.textContent = `${stock.name} - ₹${stock.currentPrice.toFixed(2)} (Volume: ${stock.quantity}) = ₹${total.toFixed(2)}, LowLimit: ${stock.lowLimit}, HighLimit: ${stock.highLimit}`;

            // Change color based on current price
            stock.listItem.style.color = stock.currentPrice > stock.purchasePrice ? 'green' : 'red';

            // Create sell button if not already created
            if (!stock.listItem.querySelector('.sell-button')) {
                createSellButton(stock);
            }
        }

        checkSellConditions(stock); // Check for sell conditions
        updateSimulationStatus(); // Update simulation status
    }

    function createSellButton(stock) {
        const sellButton = document.createElement('button');
        sellButton.textContent = 'Sell';
        sellButton.classList.add('sell-button');

        // Show the confirmation modal when sell button is clicked
        sellButton.addEventListener('click', function() {
            document.getElementById('bank-confirmation-modal').style.display = 'block';
            const confirmButton = document.getElementById('confirm-bank-account');

            // Handle bank account confirmation
            confirmButton.onclick = function() {
                const accountNumber = document.getElementById('bank-account-number').value;

                if (accountNumber) {
                    // Proceed with selling
                    const confirmationMessage = `Are you sure you want to sell ${stock.quantity} shares of ${stock.name} at ₹${stock.currentPrice.toFixed(2)} each?`;
                    if (confirm(confirmationMessage)) {
                        const profitLoss = (stock.currentPrice - stock.purchasePrice) * stock.quantity;
                        toastr.options = {
                            closeButton: true,
                            newestOnTop: true,
                            positionClass: "toast-top-center",
                            timeOut: 10000,
                            preventDuplicates: true,
                            showEasing: "swing",
                            hideEasing: "linear",
                            showMethod: "fadeIn",
                            hideMethod: "fadeOut",
                            tapToDismiss: true,
                            };
                        toastr.success(`Sold ${stock.quantity} shares of ${stock.name}. Profit/Loss: ₹${profitLoss.toFixed(2)}`);

    // Log the transaction
    transactions.push({
        type: 'Sell',
        stockName: stock.name,
        price: stock.currentPrice,
        quantity: stock.quantity,
        profitLoss: profitLoss, // Store calculated profit/loss
        date: Date.now()
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));


                        // Remove the stock from the bought stocks list
                        stocks = stocks.filter(s => s !== stock); // Remove from stocks array
                        clearInterval(intervalIds[stock.chartIndex]); // Stop the simulation for this stock
                        intervalIds.splice(stock.chartIndex, 1); // Remove the interval ID
                        stock.listItem.remove(); // Remove from display

                        // Remove from chart dataset
                        stockChart.data.datasets.splice(stock.chartIndex, 1);
                        stockChart.update();
                        updateSimulationStatus(); // Update simulation status
                    }
                    // Close the modal
                    document.getElementById('bank-confirmation-modal').style.display = 'none';
                } else {
                    toastr.options = {
                        closeButton: true,
                        newestOnTop: true,
                        positionClass: "toast-top-center",
                        preventDuplicates: true,
                        showEasing: "swing",
                        hideEasing: "linear",
                        showMethod: "fadeIn",
                        hideMethod: "fadeOut",
                        tapToDismiss: true,
                        };
                    toastr.warning('Please enter a valid bank account number.');
                }
            };

            // Close modal on clicking the close button
            document.getElementById('close-modal').onclick = function() {
                document.getElementById('bank-confirmation-modal').style.display = 'none';
            };

        })
        stock.listItem.appendChild(sellButton); // Append the sell button to the list item
    
    }

   
    function updateSimulationStatus() {
        simulationStatusMessage.textContent = `Current Status: Running... (Total Stocks: ${stocks.length})`;
    }

    let lowLimitSound = new Audio('low-sound.mp3');
let highLimitSound = new Audio('high-sound.mp3');

function checkSellConditions(stock) {
    if (stock.currentPrice <= stock.purchasePrice) {
        // Ensure sound is played in response to user action
        playSound(lowLimitSound);
    }
    if (stock.currentPrice >= stock.purchasePrice) {
        // Ensure sound is played in response to user action
        playSound(highLimitSound);
    }
}

function playSound(sound) {
    // Play sound only if user has interacted with the document
    sound.play().catch(error => {
        console.error('Failed to play sound:', error);
    });
}


    function showOverallCompletionNotification() {
        const heldStocks = []; // Array to track held stocks
        stocks.forEach(stock => {
            // Alert the current stock price
            toastr.options = {
                closeButton: true,
                newestOnTop: true,
                positionClass: "toast-top-center",
                timeOut: 10000,
                preventDuplicates: true,
                showEasing: "swing",
                hideEasing: "linear",
                showMethod: "fadeIn",
                hideMethod: "fadeOut",
                tapToDismiss: true,
                };
            toastr.info(`${stock.name} is being held. Current price: ₹${stock.currentPrice.toFixed(2)}`);

            // Check if current price is above the high limit
            if (stock.currentPrice > stock.highLimit) {
                const profitLoss = (stock.currentPrice - stock.purchasePrice) * stock.quantity;
                toastr.options = {
                    closeButton: true,
                    newestOnTop: true,
                    positionClass: "toast-top-center",
                    timeOut: 10000,
                    preventDuplicates: true,
                    showEasing: "swing",
                    hideEasing: "linear",
                    showMethod: "fadeIn",
                    hideMethod: "fadeOut",
                    tapToDismiss: true,
                    };
                toastr.success(`Selling ${stock.quantity} shares of ${stock.name} at ₹${stock.currentPrice.toFixed(2)} each due to high limit exceeded. Profit/Loss: ₹${profitLoss.toFixed(2)}`);

                // Log the transaction
    transactions.push({
        type: 'Sell',
        stockName: stock.name,
        price: stock.currentPrice,
        quantity: stock.quantity,
        profitLoss: profitLoss, // Store calculated profit/loss
        date: Date.now()
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));

                // Remove the stock from the bought stocks list
                stocks = stocks.filter(s => s !== stock); // Remove from stocks array
                clearInterval(intervalIds[stock.chartIndex]); // Stop the simulation for this stock
                intervalIds.splice(stock.chartIndex, 1); // Remove the interval ID
                stock.listItem.remove(); // Remove from display
                
                // Remove from chart dataset
                stockChart.data.datasets.splice(stock.chartIndex, 1);
                stockChart.update();
            } else {
                heldStocks.push(stock); // Track held stocks if not sold
            }

            
        });

        // Store held stocks and transactions in localStorage
        localStorage.setItem('heldStocks', JSON.stringify(heldStocks));
        localStorage.setItem('transactions', JSON.stringify(transactions)); // Save transactions
        
        const popup = document.getElementById('popup-notification');
        popup.style.display = 'block';
        finishSound = new Audio("finish.mp3");
        finishSound.play();
        popup.querySelector('p').textContent = 'All stock simulations completed!';
    }

    document.getElementById('close-popup').addEventListener('click', function() {
        document.getElementById('popup-notification').style.display = 'none';
    });

    initChart();
});
