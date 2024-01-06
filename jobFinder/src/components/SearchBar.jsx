/* eslint-disable react/prop-types */
import classes from '../pages/Main.module.scss';

const SearchBar = ({
  inputValue,
  handleInputChange,
  handleKeyPress,
  excludeStringsArray,
  removeTag,
}) => (
  <div className={classes.searching}>
    <input
      className={classes.searchInput}
      type="text"
      placeholder="Enter tags to exclude..."
      value={inputValue}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
    />
    <div className={classes.tagsContainer}>
      <p className={classes.tagTitle}>These are your excluded phrases tags:</p>
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
);

export default SearchBar;
