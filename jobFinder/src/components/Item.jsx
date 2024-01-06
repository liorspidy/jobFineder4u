/* eslint-disable react/prop-types */
import classes from '../pages/Main.module.scss';

const Item = ({ item }) => {
  const removeHyphenIfNeeded = (content) => {
    if (content.startsWith('•') || content.startsWith('-')) {
      return content.substring(1).trim();
    }
    return content.trim();
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
          <h1 className={classes.jobType}>{item.type}</h1>
          <img src={item.logoUrl} alt="Company Logo" className={classes.logo} />
        </div>
        <div className={classes.content}>
          <h2 className={classes.title}>{item.title}</h2>
          <p className={classes.jobDesc}>{item.jobDescription}</p>
          {item.jobRequirements && (
            <div className={classes.req}>
              {Array.isArray(item.jobRequirements) ? (
                <ul>
                  {item.jobRequirements.map((jobRequirement, idx) => (
                    <li key={idx}>
                      {removeHyphenIfNeeded(jobRequirement.content)}
                    </li>
                  ))}
                </ul>
              ) : !!item.jobRequirements.length ? (
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
              ) : (
                <p>{removeHyphenIfNeeded(item.jobRequirements)}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </a>
  );
};

export default Item;
