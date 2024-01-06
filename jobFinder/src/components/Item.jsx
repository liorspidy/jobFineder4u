/* eslint-disable react/prop-types */
import classes from '../pages/Main.module.scss';

const Item = ({ item }) => {
  const removeHyphenIfNeeded = (content) => {
    if (content.startsWith('•') || content.startsWith('-')) {
      return content.substring(1).trim(); // Remove bullet point or hyphen and trim whitespace
    }
    return content.trim();
  };

  console.log(item.jobRequirements);

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={classes.link}
    >
      <div className={classes.itemContainer}>
        <div className={classes.logoContainer}>
          <h1 className={classes.jobType}>{item.type}</h1>
          <img src={item.logoUrl} alt="Company Logo" className={classes.logo} />
        </div>
        <div className={classes.content}>
          <h2 className={classes.title}>{item.title}</h2>
          <p className={classes.jobDesc}>{item.jobDescription}</p>
          <ul className={classes.req}>
            {item.jobRequirements ? (
              item.jobRequirements
                .split('<br>')
                .map((requirement, idx) => (
                  <li key={idx}>{removeHyphenIfNeeded(requirement)}</li>
                ))
            ) : (
              <li>No requirements available</li>
            )}
          </ul>
        </div>
      </div>
    </a>
  );
};

export default Item;
