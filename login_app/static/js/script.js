// document.addEventListener("DOMContentLoaded", () => {
//     const form = document.getElementById("stock-form");
//     const symbolInput = document.getElementById("symbol");
//     const errorElement = document.getElementById("error");
//     const stockInfo = document.getElementById("stock-info");
//     const ctx = document.getElementById("stock-chart").getContext("2d");
//     let chart;

//     form.addEventListener("submit", async (event) => {
//         event.preventDefault();
//         const symbol = symbolInput.value.trim().toUpperCase();
//         if (!symbol) return;

//         try {
//             const response = await fetch(`/api/stock-data?symbol=${symbol}`);
//             const data = await response.json();

//             if (data.error) {
//                 errorElement.textContent = data.error;
//                 stockInfo.textContent = '';
//                 if (chart) chart.destroy();
//                 return;
//             }

//             errorElement.textContent = '';
//             stockInfo.textContent = `${data.companyName} (${data.stockName}) - Current Price: $${data.currentPrice}`;

//             const chartData = {
//                 labels: data.labels,
//                 datasets: [{
//                     label: `${symbol} Stock Price`,
//                     data: data.stockData,
//                     fill: false,
//                     backgroundColor: 'rgba(0, 123, 255, 0.8)',
//                     borderColor: 'rgba(0, 123, 255, 1)',
//                     pointBackgroundColor: 'rgba(0, 123, 255, 1)',
//                     pointBorderColor: '#fff',
//                     tension: 0.1,
//                 }]
//             };

//             const chartOptions = {
//                 responsive: true,
//                 scales: {
//                     x: {
//                         title: {
//                             display: true,
//                             text: 'Date',
//                             color: '#fff'
//                         },
//                         ticks: {
//                             color: '#fff'
//                         }
//                     },
//                     y: {
//                         beginAtZero: false,
//                         title: {
//                             display: true,
//                             text: 'Price (USD)',
//                             color: '#fff'
//                         },
//                         ticks: {
//                             color: '#fff'
//                         }
//                     }
//                 },
//                 plugins: {
//                     legend: {
//                         labels: {
//                             color: '#fff'
//                         }
//                     },
//                     tooltip: {
//                         enabled: true,
//                         callbacks: {
//                             label: function (context) {
//                                 return `Price: $${context.parsed.y}`;
//                             }
//                         }
//                     }
//                 }
//             };

//             if (chart) chart.destroy();
//             chart = new chart(ctx, {
//                 type: 'line',
//                 data: chartData,
//                 options: chartOptions
//             });

//         } catch (error) {
//             console.error('Error fetching stock data:', error);
//             errorElement.textContent = 'Error fetching stock data';
//         }
//     });
// });
