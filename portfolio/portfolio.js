document.addEventListener('DOMContentLoaded', function() {
    const heldStocks = JSON.parse(localStorage.getItem('heldStocks')) || [];
    const stockNames = heldStocks.map(stock => stock.name);
    const stockValues = heldStocks.map(stock => stock.currentPrice * stock.quantity);
    const stockVol = heldStocks.map(stock => stock.quantity);

    const ctx = document.getElementById('portfolio-chart').getContext('2d');
    const portfolioChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: stockNames,
            datasets: [{
                label: 'Stock Holdings',
                data: stockValues,
                backgroundColor: stockNames.map(() => randomColor()), // Random colors for each segment
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Portfolio Distribution'
                }
            }
        }
    });

    function randomColor() {
        return `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`;
    }
});
