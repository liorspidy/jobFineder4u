import { useState, useEffect } from 'react';
import axios from 'axios';
import Item from '../components/Item';
import classes from './Main.module.scss';

const Main = () => {
  const [allItems, setAllItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [excludeStringsArray, setExcludeStringsArray] = useState([]);

  useEffect(() => {
    // Load data from local storage when the component mounts
    const storedItems = localStorage.getItem('allItems');
    if (storedItems) {
      setAllItems(JSON.parse(storedItems));
    }

    // Load tags from local storage when the component mounts
    const storedTags = localStorage.getItem('excludeStringsArray');
    if (storedTags) {
      setExcludeStringsArray(JSON.parse(storedTags));
    }
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      setExcludeStringsArray((prevArray) => {
        const newArray = [...prevArray, inputValue.trim()];
        localStorage.setItem('excludeStringsArray', JSON.stringify(newArray)); // Save to local storage
        return newArray;
      });
      setInputValue(''); // Clear input after adding tag
    }
  };

  const removeTag = (tagToRemove) => {
    setExcludeStringsArray((prevArray) => {
      const newArray = prevArray.filter((tag) => tag !== tagToRemove);
      localStorage.setItem('excludeStringsArray', JSON.stringify(newArray)); // Save to local storage
      return newArray;
    });
  };

  const fetchData = async () => {
    const excludeStrings = excludeStringsArray.join(',');

    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/scrape?excludeStrings=${excludeStrings}`
      );
      setAllItems(response.data);
      setIsLoading(false);
      localStorage.setItem('allItems', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to fetch data. Please try again later.');
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  if (error) {
    return <div className={classes.error}>Error: {error}</div>;
  }

  return (
    <div className={classes.container}>
      <div className={classes.actions}>
        <div className={classes.buttonAndMore}>
          <button onClick={handleSearch} className={classes.searchButton}>
            Start Search
          </button>
          {!isLoading && allItems.length > 0 && (
            <div className={classes.resultsCount}>
              Total Results: {allItems.length}
            </div>
          )}
        </div>
        <div className={classes.searching}>
          <input
            className={classes.searchInput}
            type="text"
            placeholder="Enter tags..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <div className={classes.tagsContainer}>
            <p className={classes.tagTitle}>These are your searching tags:</p>
            <div className={classes.tagsContent}>
              {excludeStringsArray.map((tag, index) => (
                <span
                  key={index}
                  className={classes.tag}
                  onClick={() => removeTag(tag)} // Add onClick handler to remove the tag
                >
                  {tag}
                  <span className={classes.tagCloseIcon}>✖</span>{' '}
                  {/* Close icon for styling */}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isLoading && <div className={classes.loading}>Loading...</div>}
      {!isLoading && (
        <div className={classes.list}>
          {allItems.map((item, index) => (
            <Item key={index} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Main;
