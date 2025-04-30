import React, { useState, useEffect } from 'react';

function BookSearch() {
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('Harry Potter');
  const [bookList, setBookList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch books based on query and page
  const fetchBooks = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&page=${page}&limit=10`;
      const response = await fetch(url);
      const data = await response.json();
      setBookList(data.docs.slice(0, 10));
      setHasNextPage(data.numFound > page * 10);
    } catch (err) {
      setError('Failed to fetch books. Please try again later.');
      setBookList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions based on input
  const fetchSuggestions = async (input) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }

    setSuggestLoading(true);
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(input)}&limit=5`;
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data.docs.slice(0, 5));
    } catch (err) {
      setSuggestions([]);
    } finally {
      setSuggestLoading(false);
    }
  };

  // Debounce input changes for suggestions
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSuggestions(searchInput);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Fetch books when query or page changes
  useEffect(() => {
    fetchBooks();
  }, [query, page]);

  // Handle clicking suggestion
  const handleSuggestionClick = (title) => {
    setQuery(title);
    setSearchInput(title);
    setPage(1);
    setSuggestions([]);
  };

  // Highlight the matched part of the suggestion
  const highlightText = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi')); // Split by query and highlight
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} style={{ fontWeight: 'bold', color: '#007bff' }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="book-search-container app">
      <h1>📚 INCOGNITO</h1>

      <div className="search-form" style={{ position: 'relative' }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search for a book..."
          className="search-input"
        />
        {suggestLoading && (
          <div style={{ position: 'absolute', top: '100%', left: 0, fontSize: '0.9rem', color: '#007bff' }}>
            Loading suggestions...
          </div>
        )}
        {suggestions.length > 0 && (
          <ul
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              background: 'white',
              border: '1px solid #cce0ff',
              borderTop: 'none',
              borderRadius: '0 0 8px 8px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 10,
              listStyle: 'none',
              margin: 0,
              padding: 0,
            }}
          >
            {suggestions.map((sug, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(sug.title)}
                style={{
                  padding: '0.7rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: '#fdfdfd',
                  transition: 'background-color 0.2s',
                }}
              >
                {highlightText(sug.title, searchInput)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && <p>⏳ Loading books...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && bookList.length > 0 ? (
        <>
          <ul className="book-list">
            {bookList.map((book, index) => (
              <li key={`${book.key}-${index}`} className="book-item">
                <a
                  href={`https://openlibrary.org${book.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="book-link"
                >
                  <h3>{book.title}</h3>
                </a>
                <p>Author: {book.author_name?.join(', ') || 'Unknown'}</p>
                <p>First Published: {book.first_publish_year || 'N/A'}</p>
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
              ⬅ Previous
            </button>
            <span>Page {page}</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasNextPage}>
              Next ➡
            </button>
          </div>
        </>
      ) : !loading && query ? (
        <p>No results found for "{query}".</p>
      ) : (
        <p>Enter a book title to begin your search.</p>
      )}
    </div>
  );
}

export default BookSearch;
