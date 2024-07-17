// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// var link = document.createElement('link');


// link.rel = 'stylesheet';
// link.type = 'text/css';
// link.href = '/static/css/news.css'; 


// document.head.appendChild(link);

// const News = () => {
//   const [news, setNews] = useState([]);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchNews = async () => {
//       try {
//         const response = await axios.get(
//           'https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=caf7af6dd41c45a6aa1d32530867c5d8'
//         );
//         setNews(response.data.articles);
//       } catch (error) {
//         setError('Error fetching news');
//         console.error('Error fetching news:', error);
//       }
//     };

//     fetchNews();
//   }, []);

//   return (
//     <div className="news-container">
//       <h2>LATEST NEWS</h2>
//       {error && <p className="error-message">{error}</p>}
//       <div className="news-list">
//         {news.length > 0 ? (
//           <ul className="news-scrollable">
//             {news.map((article, index) => (
//               <li key={index} className="news-item">
//                 <h3>{article.title}</h3>
//                 <p>{article.description}</p>
//                 <a
//                   href={article.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="read-more-link"
//                 >
//                   Read more
//                 </a>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p>Loading...</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default News;
// Create a link element
var link = document.createElement('link');

// Set the attributes
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = '/static/css/news.css';

// Append the link element to the head
document.head.appendChild(link);

document.addEventListener("DOMContentLoaded", function() {
    const newsContainer = document.querySelector('.news-container');
    const errorMessage = document.querySelector('.error-message');
    const newsList = document.querySelector('.news-list');
    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Loading...';
    newsList.appendChild(loadingMessage);

    axios.get('https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=caf7af6dd41c45a6aa1d32530867c5d8')
        .then(response => {
            loadingMessage.style.display = 'none';
            const articles = response.data.articles;
            if (articles.length > 0) {
                const ul = document.createElement('ul');
                ul.className = 'news-scrollable';
                articles.forEach(article => {
                    const listItem = document.createElement('li');
                    listItem.className = 'news-item';

                    const title = document.createElement('h3');
                    title.textContent = article.title;

                    const description = document.createElement('p');
                    description.textContent = article.description;

                    const readMoreLink = document.createElement('a');
                    readMoreLink.href = article.url;
                    readMoreLink.target = '_blank';
                    readMoreLink.rel = 'noopener noreferrer';
                    readMoreLink.className = 'read-more-link';
                    readMoreLink.textContent = 'Read more';

                    listItem.appendChild(title);
                    listItem.appendChild(description);
                    listItem.appendChild(readMoreLink);
                    ul.appendChild(listItem);
                });
                newsList.appendChild(ul);
            } else {
                newsList.textContent = 'No news available.';
            }
        })
        .catch(error => {
            loadingMessage.style.display = 'none';
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Error fetching news';
            console.error('Error fetching news:', error);
        });
});
