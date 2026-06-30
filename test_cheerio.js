const fetch = require('node-fetch');
const cheerio = require('cheerio');
(async () => {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log("Found sections:", $('section').length);
  $('section').each((i, el) => {
    console.log('\n--- SECTION', i, '---');
    console.log('id:', $(el).attr('id'));
    console.log('class:', $(el).attr('class'));
    console.log('text:', $(el).text().substring(0, 150).replace(/\n/g, ' '));
  });
  
  console.log("\n--- OTHER CONTAINERS ---");
  // Check what's between LatestNews and Magazine
  // By finding 'ताज़ा खबरें' (Latest News) and 'पत्रिका डेस्क' (Patrika Desk)
  console.log("Has Load More:", html.includes("Load More Articles") || html.includes("और अधिक लेख लोड करें"));
  console.log("Has Patrika Desk:", html.includes("पत्रिका डेस्क"));
})();
