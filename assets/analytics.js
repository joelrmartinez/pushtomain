// PostHog analytics. Inert until POSTHOG_KEY is set.
// The key is the public project key (phc_...). It is safe in client code,
// but leave it empty here until Joel supplies it.
// Privacy: no session recording, no autocapture of inputs, anonymous visitors
// only (no person profiles), and Do Not Track / Global Privacy Control are honored.
(function () {
  var POSTHOG_KEY = "";
  var POSTHOG_HOST = "https://us.i.posthog.com";

  if (!POSTHOG_KEY) return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true) return;
  var host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return;

  var s = document.createElement("script");
  s.async = true;
  s.src = POSTHOG_HOST.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
  s.onload = function () {
    if (!window.posthog) return;
    window.posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: true,
      autocapture: { dom_event_allowlist: ["click"], element_allowlist: ["a", "button"] },
      respect_dnt: true
    });
  };
  document.head.appendChild(s);
})();
