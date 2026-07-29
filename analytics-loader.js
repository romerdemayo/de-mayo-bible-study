/* De Mayo Bible Studies — privacy-first analytics loader */
(function () {
  'use strict';

  var config = window.DE_MAYO_ANALYTICS || {};
  var token = String(config.token || '').trim();
  var placeholder = !token || token === 'PASTE_YOUR_CLOUDFLARE_TOKEN_HERE';
  var isHttp = location.protocol === 'https:' || location.protocol === 'http:';
  var expectedHost = String(config.liveHostname || '').trim().toLowerCase();
  var isExpectedHost = !expectedHost || location.hostname.toLowerCase() === expectedHost;

  // Never send analytics while testing files offline or before a real token is added.
  if (config.enabled !== true || placeholder || !isHttp || !isExpectedHost) return;

  var script = document.createElement('script');
  script.defer = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.setAttribute('data-cf-beacon', JSON.stringify({ token: token }));
  script.setAttribute('data-de-mayo-analytics', 'cloudflare');
  document.head.appendChild(script);
}());
