const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://www.drushim.co.il/jobs/search/react/';

const drushimScraper = async (excludeStrings = []) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let allItems = [];
    const processedLinks = new Set();

    console.log('Starting scraping process for Drushim jobs.');

    await page.goto(baseUrl);
    await page.waitForSelector('.jobList_vacancy');

    let jobLinks = [];

    while (true) {
      const newJobLinks = await page.$$eval('.jobList_vacancy a', (links) => {
        const uniqueLinks = new Set();
        links.forEach((link) => {
          if (link.href.includes('drushim.co.il/job')) {
            uniqueLinks.add(link.href);
          }
        });
        return Array.from(uniqueLinks);
      });

      console.log(`Found ${newJobLinks.length} unique job links on this page.`);
      jobLinks = jobLinks.concat(newJobLinks);

      const loadMoreBtnExists = await page.$('.load_jobs_btn');
      if (loadMoreBtnExists) {
        await page.click('.load_jobs_btn');
        await page.waitForTimeout(2000);
      } else {
        console.log('Load More button not found. Exiting the loop.');
        break;
      }
    }

    for (let i = 0; i < jobLinks.length; i++) {
      const link = jobLinks[i];

      if (processedLinks.has(link)) {
        console.log(`Link ${link} already processed. Skipping...`);
        continue;
      }

      console.log(`Processing job details for link: ${link}`);

      try {
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);

        const titleElement = $('h1').first();
        const jobDescriptionElement = $('.job-details p').first();
        const jobRequirementsElement = $('.job-requirements p').first();

        if (
          !titleElement.length ||
          !jobDescriptionElement.length ||
          !jobRequirementsElement.length
        ) {
          console.log(`Skipped job due to missing elements for link: ${link}`);
          continue;
        }

        const title = titleElement.text().trim();
        const jobDescription = jobDescriptionElement.text().trim();
        const jobRequirements = jobRequirementsElement.html();

        let shouldSkip = false;

        for (const exclude of excludeStrings) {
          // Check for exact matches using word boundaries
          const regex = new RegExp(`\\b${exclude}\\b`, 'gi');

          if (
            regex.test(title) ||
            regex.test(jobDescription) ||
            regex.test(jobRequirements)
          ) {
            shouldSkip = true;
            break;
          }

          // Check for partial matches using .includes()
          if (
            title.toLowerCase().includes(exclude.toLowerCase()) ||
            jobDescription.toLowerCase().includes(exclude.toLowerCase()) ||
            jobRequirements.toLowerCase().includes(exclude.toLowerCase())
          ) {
            shouldSkip = true;
            break;
          }
        }

        if (shouldSkip) {
          console.log(
            `Skipped job titled "${title}" due to exclusion criteria.`
          );
          continue;
        }

        const jobDetails = {
          type: 'React Developer', // Adjust as needed
          title,
          jobDescription,
          jobRequirements,
          link,
          siteName: 'drushim',
          logoUrl: 'https://www.drushim.co.il/_nuxt/img/logo.e75be30.svg',
        };

        allItems.push(jobDetails);
        processedLinks.add(link);
        console.log(`Added job titled "${jobDetails.title}" to the list.`);
      } catch (error) {
        console.error(
          `Error fetching or parsing job details for link: ${link}`,
          error
        );
      }
    }

    await browser.close();
    console.log(
      `Scraping completed for Drushim jobs. Total jobs scraped: ${allItems.length}`
    );
    return allItems;
  } catch (error) {
    console.error('Error during scraping for Drushim jobs:', error);
    return [];
  }
};

module.exports = drushimScraper;
