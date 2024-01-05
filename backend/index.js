const express = require('express');
const cors = require('cors');
const scraper = require('./logicGotFriends');
const app = express();
const port = 3001;

app.use(cors());

app.get('/scrape', async (req, res) => {
  try {
    console.log('Received scraping request from client.');

    const excludeStrings = req.query.excludeStrings
      ? req.query.excludeStrings.split(',')
      : [];
    const data = await scraper(excludeStrings);

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
