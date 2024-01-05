/* eslint-disable react/prop-types */
import { useEffect } from 'react';
import classes from '../pages/Main.module.scss';

const Pagination = ({
  allItems,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}) => {
  const totalPages = Math.ceil(allItems.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  useEffect(() => {
    if (currentPage !== +localStorage.getItem('currentPage')) {
      localStorage.setItem('currentPage', +currentPage);
    }
  }, [currentPage]);

  return (
    <div className={classes.pagination}>
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className={classes.paginationButton}
      >
        {'<'}
      </button>
      {Array.from({ length: totalPages }).map((_, index) => {
        return (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`${
              +currentPage !== index + 1
                ? classes.paginationButton
                : `${classes.paginationButton} ${classes.current}`
            } ${currentPage === index + 1 ? classes.activePage : ''}`}
          >
            {index + 1}
          </button>
        );
      })}
      <button
        onClick={nextPage}
        disabled={currentPage === totalPages}
        className={classes.paginationButton}
      >
        {'>'}
      </button>
    </div>
  );
};

export default Pagination;
