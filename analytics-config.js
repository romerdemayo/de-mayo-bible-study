/*
  De Mayo Bible Studies — Private Cloudflare Web Analytics

  SETUP:
  1. Create a free Cloudflare account.
  2. Open Web Analytics and add this hostname:
       romerdemayo.github.io
  3. Copy the token from Cloudflare's JavaScript snippet.
  4. Replace e7206f8725674a47be161746576c305b below with that token.

  Only the Cloudflare account owner can see the analytics dashboard.
  This file does not collect notes, prayers, favourites, names, emails,
  reading history, or other private app content.
*/
window.DE_MAYO_ANALYTICS = Object.freeze({
  enabled: true,
  token: 'e7206f8725674a47be161746576c305b',
  liveHostname: 'romerdemayo.github.io'
});
