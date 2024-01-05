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
  const maxButtons = 5;

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

  const renderPageButtons = () => {
    const buttons = [];
    let start = 1;
    let end = totalPages;

    if (totalPages > maxButtons) {
      start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
      end = start + maxButtons - 1;
      if (end > totalPages) {
        end = totalPages;
        start = end - maxButtons + 1;
      }
    }

    if (start > 1) {
      buttons.push(
        <button
          className={classes.paginationButton}
          key="start"
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>
      );
      if (start > 2) {
        buttons.push(
          <span className={classes.morePages} key="ellipsis-start">
            ...
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={
            i === currentPage
              ? ` ${classes.paginationButton} ${classes.current}`
              : ` ${classes.paginationButton}`
          }
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        buttons.push(
          <span className={classes.morePages} key="ellipsis-end">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          className={classes.paginationButton}
          key="end"
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className={classes.pagination}>
      <button
        onClick={prevPage}
        disabled={currentPage === 1}
        className={classes.paginationButton}
      >
        {'<'}
      </button>
      {renderPageButtons()}
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
