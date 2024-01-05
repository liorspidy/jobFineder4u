/* eslint-disable react/prop-types */
import classes from '../pages/Main.module.scss';

const Item = ({ item }) => {
  const removeHyphenIfNeeded = (content) => {
    if (content.startsWith('-')) {
      return content.substring(1); // Remove the hyphen
    }
    return content;
  };

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={classes.link}
    >
      <div className={classes.itemContainer}>
        <div className={classes.logoContainer}>
          <img src={item.logoUrl} alt="Company Logo" className={classes.logo} />
        </div>
        <div className={classes.content}>
          <h2 className={classes.title}>{item.title}</h2>
          <p className={classes.jobDesc}>{item.jobDescription}</p>
          <ul className={classes.req}>
            {item.tags.map((tag, idx) => (
              <li key={idx}>{removeHyphenIfNeeded(tag.content)}</li>
            ))}
          </ul>
        </div>
      </div>
    </a>
  );
};

export default Item;
