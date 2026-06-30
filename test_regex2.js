(async () => {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();
  console.log(html.substring(0, 1000));
})();
