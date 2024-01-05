const axios = require('axios');
const cheerio = require('cheerio');

const scrapeJobs = async (url, excludeStrings = []) => {
  try {
    let pagenum = 1;
    let allItems = [];
    let totalPages;
    let logoUrl = 'https://www.gotfriends.co.il/images/logo.png';

    console.log(`Starting scraping process for ${url}...`);

    const homePageResponse = await axios.get('https://www.gotfriends.co.il/');

    while (true) {
      console.log(`Fetching page ${pagenum}...`);
      const response = await axios.get(`${url}?page=${pagenum}`);
      console.log(`Received response for page ${pagenum}.`);

      const $ = cheerio.load(response.data);

      if (!totalPages) {
        const lastPageAnchor = $('.pagination li:last-child a');
        const match = lastPageAnchor.attr('href').match(/total=(\d+)/);

        if (match && match[1]) {
          totalPages = parseInt(match[1], 10);
          console.log(`Total pages found: ${totalPages}`);
        }
      }

      const items = [];

      $('.list.panel.no-scroll .item').each((index, element) => {
        let title = $(element)
          .find('a h2.title')
          .text()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/<span\s*\/?>/gi, '')
          .replace(/&nbsp;/g, '');

        let jobDescription = $(element)
          .find('.desc')
          .first()
          .text()
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/<span\s*\/?>/gi, '')
          .replace(/&nbsp;/g, '');

        let shouldSkip = false;
        for (const exclude of excludeStrings) {
          if (
            title.toLowerCase().includes(exclude.toLowerCase()) ||
            jobDescription.toLowerCase().includes(exclude.toLowerCase())
          ) {
            shouldSkip = true;
            break;
          }
        }

        const structuredTags = [];
        $(element)
          .find('.desc')
          .eq(1)
          .find('p')
          .each((_, p) => {
            const rawHtml = $(p).html();
            const tags = rawHtml.split('<br>');
            tags.forEach((tag) => {
              const cleanTag = tag
                .trim()
                .replace(/\s+/g, ' ')
                .replace(/<span\s*\/?>/gi, '')
                .replace(/&nbsp;/g, '');
              for (const exclude of excludeStrings) {
                if (cleanTag.toLowerCase().includes(exclude.toLowerCase())) {
                  shouldSkip = true;
                  break;
                }
              }
              structuredTags.push({ content: cleanTag });
            });
          });

        const relativeLink = $(element).find('a.position').attr('href');
        const link = `https://www.gotfriends.co.il${relativeLink}`;

        if (shouldSkip) {
          return true;
        }

        items.push({
          title,
          jobDescription,
          tags: structuredTags,
          link,
          logoUrl,
        });
      });

      console.log(`Scraped ${items.length} items from page ${pagenum}.`);
      allItems = allItems.concat(items);

      if (pagenum === totalPages) {
        console.log('Reached last page. Exiting...');
        break;
      }

      pagenum++;
    }

    console.log(`Scraping completed for ${url}.`);
    return allItems;
  } catch (error) {
    console.error(`Error during scraping for ${url}:`, error);
    return [];
  }
};

const scrapeBothJobs = async (excludeStrings = []) => {
  try {
    const reactDeveloperUrl =
      'https://www.gotfriends.co.il/jobslobby/software/react-developer/';
    const headOfFrontEndTeamUrl =
      'https://www.gotfriends.co.il/jobslobby/software/frontend-developer/';

    const allReactDeveloperJobs = await scrapeJobs(
      reactDeveloperUrl,
      excludeStrings
    );
    console.log('Scraping for React Developer jobs completed.');

    const allHeadOfFrontEndTeamJobs = await scrapeJobs(
      headOfFrontEndTeamUrl,
      excludeStrings
    );
    console.log('Scraping for Front-end jobs completed.');

    const allItems = [...allReactDeveloperJobs, ...allHeadOfFrontEndTeamJobs];
    console.log('Combined results:', allItems);

    return allItems;
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  }
};

module.exports = scrapeBothJobs;

// You can call scrapeBothJobs() to start the scraping process for both URLs.
