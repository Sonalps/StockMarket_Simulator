document.addEventListener('DOMContentLoaded', function() {
    let stockData = [];
    let labels = [];
    let symbol = '';
    let error = '';
    let stockName = '';
    let companyName = '';
    let currentPrice = null;
    let stockChart;

    const apiKey = 'NFQZ04MF0EQOW46F';
    const stockForm = document.getElementById('stock-form');
    const stockSymbolInput = document.getElementById('stock-symbol-input');
    const errorMessage = document.getElementById('error-message');
    const stockInfo = document.getElementById('stock-info');
    const tradesContainer = document.getElementById('trades-container');

    function fetchStockData(stockSymbol) {
        axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${apiKey}`)
            .then(timeSeriesResponse => {
                const timeSeries = timeSeriesResponse.data['Time Series (Daily)'];
                if (!timeSeries) {
                    setError('No data found for this stock symbol');
                    return;
                }
                return axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${stockSymbol}&apikey=${apiKey}`)
                    .then(overviewResponse => {
                        const companyOverview = overviewResponse.data;
                        const metaData = timeSeriesResponse.data['Meta Data'];
                        stockName = metaData['2. Symbol'].toUpperCase();
                        companyName = companyOverview['Name'];
                        currentPrice = parseFloat(timeSeries[Object.keys(timeSeries)[0]]['1. open']);
                        labels = Object.keys(timeSeries).slice(0, 365).reverse();
                        stockData = labels.map(date => parseFloat(timeSeries[date]['1. open']));
                        renderStockChart(labels, stockData);
                        updateStockInfo();
                        setError('');
                    });
            })
            .catch(error => {
                setError('Error fetching stock data');
                console.error('Error fetching stock data:', error);
            });
    }

    function renderStockChart(labels, data) {
        const ctx = document.getElementById('stock-chart').getContext('2d');
        if (stockChart) {
            stockChart.destroy();
        }
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.map(label => moment(label).format('MMM YYYY')),
                datasets: [{
                    label: `${symbol.toUpperCase()} Stock Price`,
                    data: data,
                    fill: false,
                    backgroundColor: 'rgba(0, 123, 255, 0.8)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    pointBackgroundColor: 'rgba(0, 123, 255, 1)',
                    pointBorderColor: '#fff',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#fff'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Price (USD)',
                            color: '#fff'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function(context) {
                                return `Price: $${context.parsed.y}`;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateStockInfo() {
        stockInfo.innerHTML = `
            <h3>${companyName} (${stockName}) - Current Price: <span style="color: #90ee90;">$${currentPrice}</span></h3>
        `;
    }

    function setError(message) {
        errorMessage.textContent = message;
    }

    stockForm.addEventListener('submit', function(e) {
        e.preventDefault();
        symbol = stockSymbolInput.value.toUpperCase();
        fetchStockData(symbol);
    });

    function addTrade(trade) {
        const tradeItem = document.createElement('div');
        tradeItem.className = 'trade-item';
        tradeItem.innerHTML = `${trade.action.toUpperCase()} ${trade.quantity} shares of ${trade.symbol.toUpperCase()} at ${trade.price}`;
        tradesContainer.appendChild(tradeItem);
    }

    function fetchTrades() {
        axios.get('/api/trades')
            .then(response => {
                const trades = response.data;
                tradesContainer.innerHTML = '';
                trades.forEach(trade => addTrade(trade));
            })
            .catch(error => console.error('Error fetching trades:', error));
    }

    fetchTrades();

    const eventSource = new EventSource('/api/trades/stream');
    eventSource.onmessage = function(event) {
        const trade = JSON.parse(event.data);
        addTrade(trade);
    };
});
document.addEventListener('DOMContentLoaded', function() {
    const recentTradesList = document.getElementById('recent-trades-list');

    function fetchRecentTrades() {
        axios.get('/trades')
            .then(response => {
                const trades = response.data;
                recentTradesList.innerHTML = '';
                trades.forEach(trade => {
                    const tradeItem = document.createElement('li');
                    tradeItem.textContent = `${trade.action.toUpperCase()} ${trade.quantity} ${trade.symbol} (${trade.order_type.toUpperCase()})`;
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Sell';
                    deleteButton.onclick = () => deleteTrade(trade.id);
                    tradeItem.appendChild(deleteButton);
                    recentTradesList.appendChild(tradeItem);
                });
            })
            .catch(error => {
                console.error('Error fetching recent trades:', error);
            });
    }

    function deleteTrade(tradeId) {
        axios.post(`/delete_trade/${tradeId}`)
            .then(response => {
                fetchRecentTrades();
            })
            .catch(error => {
                console.error('Error deleting trade:', error);
            });
    }

    fetchRecentTrades();
});
// document.addEventListener('DOMContentLoaded', function() {
//     fetchPortfolioValue();
//     fetchRecentTrades();
// });

// async function fetchPortfolioValue() {
//     try {
//         const response = await axios.get('/api/portfolio');
//         const portfolio = response.data;
//         document.getElementById('account-value').innerText = portfolio.account_value.toFixed(2);
//         // Update other fields similarly
//         document.getElementById('todays-change').innerText = portfolio.todays_change.toFixed(2);
//         document.getElementById('annual-return').innerText = portfolio.annual_return.toFixed(2) + '%';
//         document.getElementById('buying-power').innerText = portfolio.buying_power.toFixed(2);
//         document.getElementById('cash').innerText = portfolio.cash.toFixed(2);
//     } catch (error) {
//         console.error('Error fetching portfolio value:', error);
//     }
// }

// async function fetchRecentTrades() {
//     try {
//         const response = await axios.get('/api/trades');
//         const trades = response.data;
//         const tradesList = document.getElementById('trades-list');
//         tradesList.innerHTML = '';
//         trades.forEach(trade => {
//             const li = document.createElement('li');
//             li.classList.add('trade-item');
//             li.innerHTML = `
//                 <span>${trade.symbol}</span>
//                 <span>${trade.action}</span>
//                 <span>${trade.quantity}</span>
//                 <span>${trade.order_type}</span>
//                 <button onclick="deleteTrade(${trade.id})">Delete</button>
//             `;
//             tradesList.appendChild(li);
//         });
//     } catch (error) {
//         console.error('Error fetching recent trades:', error);
//     }
// }

// async function deleteTrade(id) {
//     try {
//         await axios.post(`/delete_trade/${id}`);
//         fetchRecentTrades();
//         fetchPortfolioValue();
//     } catch (error) {
//         console.error('Error deleting trade:', error);
//     }
// }
      




