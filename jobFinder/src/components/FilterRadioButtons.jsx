/* eslint-disable react/prop-types */
import classes from '../pages/Main.module.scss';

const FilterRadioButtons = ({ selectedSite, handleSiteSelection }) => (
  <div className={classes.searchFilters}>
    <label>
      <input
        type="radio"
        value="drushim"
        checked={selectedSite === 'drushim'}
        onChange={() => handleSiteSelection('drushim')}
      />
      Drushim
    </label>
    <label>
      <input
        type="radio"
        value="gotfriends"
        checked={selectedSite === 'gotfriends'}
        onChange={() => handleSiteSelection('gotfriends')}
      />
      GotFriends
    </label>
    <label>
      <input
        type="radio"
        value="all"
        checked={selectedSite === 'all'}
        onChange={() => handleSiteSelection('all')}
      />
      All
    </label>
  </div>
);

export default FilterRadioButtons;
