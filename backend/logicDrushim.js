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
      console.log(`Press counter remaining: ${pressCounterLimit}`);

      await page.goto(baseUrl);
      console.log('Navigated to base URL and waiting for job list to load...');
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

      console.log(`Found ${jobLinks.length} unique job links on this page.`);

      for (const link of jobLinks) {
        if (processedLinks.has(link)) {
          console.log(`Link ${link} already processed. Skipping...`);
          continue;
        }

        console.log(`Processing job details for link: ${link}`);

        const newPage = await browser.newPage();
        await newPage.goto(link);

        const jobDetails = await newPage.evaluate(
          (link, excludeStrings) => {
            const title = document.querySelector('h1')?.innerText.trim() || '';
            const jobDescription =
              document.querySelector('.job-details p')?.innerText.trim() || '';
            const jobRequirements =
              document.querySelector('.job-requirements p')?.innerHTML || '';

            let shouldSkip = false;
            for (const exclude of excludeStrings) {
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
              return null;
            }

            return {
              type: 'React Developer',
              title,
              jobDescription,
              jobRequirements,
              link,
              siteName: 'drushim',
              logoUrl: 'https://www.drushim.co.il/_nuxt/img/logo.e75be30.svg',
            };
          },
          link,
          excludeStrings
        );

        if (jobDetails) {
          allItems.push(jobDetails);
          processedLinks.add(link);
          console.log(`Added job titled "${jobDetails.title}" to the list.`);
        }

        await newPage.close();
      }

      pressCounterLimit--;
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
