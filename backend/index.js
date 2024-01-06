const express = require('express');
const cors = require('cors');
const gotFriendsScraper = require('./logicGotFriends');
const drushimScraper = require('./logicDrushim');
const app = express();
const port = 3001;

app.use(cors());

app.get('/scrape/gotfriends', async (req, res) => {
  try {
    console.log('Received scraping request from gotfriends client.');

    const excludeStrings = req.query.excludeStrings
      ? req.query.excludeStrings.split(',')
      : [];
    const pressCounterLimit = req.query.pressCounterLimit
      ? parseInt(req.query.pressCounterLimit)
      : 2;
    const data = await gotFriendsScraper(excludeStrings);

    console.log('Successfully scraped data. Sending response to client.');
    res.json(data);
  } catch (error) {
    console.error('Error occurred while scraping:', error);
    res.status(500).json({ error: 'Failed to scrape data' });
  }
});

app.get('/scrape/drushim', async (req, res) => {
  try {
    console.log('Received scraping request from drushim client.');

    const excludeStrings = req.query.excludeStrings
      ? req.query.excludeStrings.split(',')
      : [];
    const pressCounterLimit = req.query.pressCounterLimit
      ? parseInt(req.query.pressCounterLimit)
      : 2;
    const data = await drushimScraper(pressCounterLimit, excludeStrings);

    console.log('Successfully scraped data. Sending response to client.');
    res.json(data);
  } catch (error) {
    console.error('Error occurred while scraping:', error);
    res.status(500).json({ error: 'Failed to scrape data' });
  }
});

app.listen(port, () => {
  console.log(`Server started and listening on http://localhost:${port}`);
});
