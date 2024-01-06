import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classes from './Main.module.scss';
import Item from '../components/Item';
import Pagination from '../components/Pagination';
import FilterRadioButtons from '../components/FilterRadioButtons';
import SearchBar from '../components/SearchBar';

const Main = () => {
  const [allItems, setAllItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [excludeStringsArray, setExcludeStringsArray] = useState([]);
  const [currentPage, setCurrentPage] = useState(
    +localStorage.getItem('currentPage') || 1
  );
  const [selectedSite, setSelectedSite] = useState('all');

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
      let drushimData = [];
      let gotfriendsData = [];

      if (selectedSite === 'drushim' || selectedSite === 'all') {
        const drushimResponse = await axios.get(
          `http://localhost:3001/scrape/drushim?excludeStrings=${excludeStringsArray.join(
            ','
          )}`
        );
        drushimData = drushimResponse.data;
      }

      if (selectedSite === 'gotfriends' || selectedSite === 'all') {
        const gotfriendsResponse = await axios.get(
          `http://localhost:3001/scrape/gotfriends?excludeStrings=${excludeStringsArray.join(
            ','
          )}`
        );
        gotfriendsData = gotfriendsResponse.data;
      }

      // Concatenate the two sets of data if "All" is selected
      if (selectedSite === 'all') {
        setAllItems([...drushimData, ...gotfriendsData]);
        localStorage.setItem(
          'allItems',
          JSON.stringify([...drushimData, ...gotfriendsData])
        );
      } else if (selectedSite === 'drushim') {
        setAllItems(drushimData);
        localStorage.setItem('allItems', JSON.stringify(drushimData));
      } else if (selectedSite === 'gotfriends') {
        setAllItems(gotfriendsData);
        localStorage.setItem('allItems', JSON.stringify(gotfriendsData));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to fetch data. Please try again later.');
      setIsLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = allItems.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={classes.container}>
      <div className={classes.actions}>
        <button onClick={fetchData} className={classes.searchButton}>
          Start Search
        </button>
        <FilterRadioButtons
          selectedSite={selectedSite}
          handleSiteSelection={handleSiteSelection}
        />
        <SearchBar
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleKeyPress={handleKeyPress}
          excludeStringsArray={excludeStringsArray}
          removeTag={removeTag}
        />
      </div>
      {isLoading && <div className={classes.loading}>Loading...</div>}
      {!!allItems.length && !isLoading && (
        <Pagination
          allItems={allItems}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
        />
      )}
      {!!allItems.length && !isLoading && (
        <div className={classes.list}>
          {currentItems.map((item, index) => (
            <Item key={index} item={item} />
          ))}
        </div>
      )}
      {!!allItems.length && !isLoading && (
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
