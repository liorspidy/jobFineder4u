const puppeteer = require('puppeteer');

const baseUrl = 'https://www.drushim.co.il/jobs/search/react/';

const drushimScraper = async (pressCounterLimit = 2, excludeStrings = []) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let allItems = [];
    const processedLinks = new Set();

    console.log(
      `Starting scraping process for Drushim jobs with pressCounterLimit: ${pressCounterLimit}`
    );

    while (pressCounterLimit > 0) {
      await page.goto(baseUrl);
      await page.waitForSelector('.jobList_vacancy');

      const jobLinks = await page.$$eval('.jobList_vacancy a', (links) => {
        const uniqueLinks = new Set();
        links.forEach((link) => {
          if (link.href.includes('drushim.co.il/job')) {
            uniqueLinks.add(link.href);
          }
        });
        return Array.from(uniqueLinks);
      });

      for (const link of jobLinks) {
        if (processedLinks.has(link)) {
          continue;
        }

        const newPage = await browser.newPage();
        await newPage.goto(link);

        const jobDetails = await newPage.evaluate(() => {
          const title = document.querySelector('h1')?.innerText.trim() || '';
          const company =
            document.querySelector('.job-details-top span')?.innerText.trim() ||
            '';
          const jobDescription =
            document.querySelector('.job-details p')?.innerText.trim() || '';
          const jobRequirements =
            document.querySelector('.job-requirements p')?.innerHTML || '';

          return {
            type: 'React Developer',
            title,
            jobDescription,
            jobRequirements,
            company,
            link,
            siteName: 'drushim',
            logoUrl: 'https://www.drushim.co.il/_nuxt/img/logo.e75be30.svg',
          };
        });

        allItems.push(jobDetails);
        processedLinks.add(link);
        await newPage.close();
      }

      pressCounterLimit--;
    }

    await browser.close();
    console.log('Scraping completed for Drushim jobs.');
    return allItems;
  } catch (error) {
    console.error('Error during scraping for Drushim jobs:', error);
    return [];
  }
};

module.exports = drushimScraper;
