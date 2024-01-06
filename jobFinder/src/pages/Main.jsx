import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from './Main.module.scss';
import Item from '../components/Item';
import Pagination from '../components/Pagination';

const Main = () => {
  const [allItems, setAllItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [excludeStringsArray, setExcludeStringsArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(
    +localStorage.getItem('currentPage') || 1
  );
  const [selectedSite, setSelectedSite] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    const storedItems = localStorage.getItem('allItems');
    if (storedItems) {
      setAllItems(JSON.parse(storedItems));
    }

    const storedTags = localStorage.getItem('excludeStringsArray');
    if (storedTags) {
      setExcludeStringsArray(JSON.parse(storedTags));
    }

    const storedCurrentPage = localStorage.getItem('currentPage');
    if (storedCurrentPage) {
      setCurrentPage(+storedCurrentPage);
    }
  }, []);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      setExcludeStringsArray((prevArray) => {
        const newArray = [...prevArray, inputValue.trim()];
        localStorage.setItem('excludeStringsArray', JSON.stringify(newArray));
        return newArray;
      });
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    setExcludeStringsArray((prevArray) => {
      const newArray = prevArray.filter((tag) => tag !== tagToRemove);
      localStorage.setItem('excludeStringsArray', JSON.stringify(newArray));
      return newArray;
    });
  };

  const handleSiteSelection = (site) => {
    setSelectedSite(site);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let response;
      if (selectedSite === 'drushim') {
        response = await axios.get(
          `http://localhost:3001/scrape/drushim?excludeStrings=${excludeStringsArray.join(
            ','
          )}&pressCounterLimit=2`
        );
      } else if (selectedSite === 'gotfriends') {
        response = await axios.get(
          `http://localhost:3001/scrape/gotfriends?excludeStrings=${excludeStringsArray.join(
            ','
          )}`
        );
      }

      setAllItems(response.data);
      setIsLoading(false);
      localStorage.setItem('allItems', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to fetch data. Please try again later.');
      setIsLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allItems.slice(indexOfFirstItem, indexOfLastItem);

  if (error) {
    return <div className={classes.error}>Error: {error}</div>;
  }

  return (
    <div className={classes.container}>
      <div className={classes.actions}>
        <div className={classes.buttonAndMore}>
          <button onClick={fetchData} className={classes.searchButton}>
            Start Search
          </button>
          <div className={classes.searchFilters}>
            <button onClick={() => handleSiteSelection('drushim')}>
              Drushim
            </button>
            <button onClick={() => handleSiteSelection('gotfriends')}>
              GotFriends
            </button>
            <button onClick={() => handleSiteSelection('all')}>All</button>
          </div>
        </div>
        <input
          className={classes.searchInput}
          type="text"
          placeholder="Enter tags to exclude..."
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <div className={classes.tagsContainer}>
          <p className={classes.tagTitle}>
            These are your excluded phrases tags:
          </p>
          <div className={classes.tagsContent}>
            {excludeStringsArray.map((tag, index) => (
              <span
                key={index}
                className={classes.tag}
                onClick={() => removeTag(tag)}
              >
                {tag}
                <span className={classes.tagCloseIcon}>✖</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      {isLoading && <div className={classes.loading}>Loading...</div>}
      {!isLoading && !!allItems.length && (
        <Pagination
          allItems={allItems}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      )}
      {!isLoading && !!allItems.length && (
        <div className={classes.list}>
          {currentItems.map((item, index) => (
            <Item key={index} item={item} />
          ))}
        </div>
      )}
      {!isLoading && !!allItems.length && (
        <Pagination
          allItems={allItems}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
};

export default Main;
