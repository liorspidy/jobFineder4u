const axios = require('axios');
const cheerio = require('cheerio');

// Array containing URLs and their corresponding job types
const jobUrls = [
  {
    url: 'https://www.gotfriends.co.il/jobslobby/software/react-developer/',
    type: 'React Developer',
  },
  {
    url: 'https://www.gotfriends.co.il/jobslobby/software/frontend-developer/',
    type: 'Front-end Developer',
  },
  {
    url: 'https://www.gotfriends.co.il/jobslobby/software/full-stack-developer/',
    type: 'Full-stack Developer',
  },
];

const scrapeJobs = async (url, excludeStrings = []) => {
  try {
    let pagenum = 1;
    let allItems = [];
    let totalPages;

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
          logoUrl: 'https://www.gotfriends.co.il/images/logo.png',
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

const scrapeAllJobs = async (excludeStrings = []) => {
  try {
    const allItems = [];

    for (const job of jobUrls) {
      console.log(`Scraping for ${job.type} jobs...`);
      const jobs = await scrapeJobs(job.url, excludeStrings);
      allItems.push(...jobs);
      console.log(`Scraping for ${job.type} jobs completed.`);
    }

    return allItems;
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  }
};

module.exports = scrapeAllJobs;

// You can call scrapeAllJobs() to start the scraping process for all URLs.
