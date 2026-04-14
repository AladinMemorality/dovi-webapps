/**
 * Dovi Webapp SDK
 *
 * Lightweight helper for building webapps that run inside the Dovi mobile app.
 * Include this script in your webapp's HTML:
 *
 *   <script src="/webapps/sdk/dovi.js"></script>
 *
 * API:
 *   dovi.token        — Access token from the URL (auto-extracted)
 *   dovi.baseUrl      — Server base URL (auto-detected)
 *   dovi.api(path, opts) — Authenticated fetch to server API
 *   dovi.exec(cmd)    — Run a bash command via /api/exec
 *   dovi.copy(text)   — Copy text to clipboard (native bridge)
 *   dovi.openUrl(url) — Open URL in system browser (native bridge)
 *   dovi.done()       — Navigate back to the app list
 */
(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var token = params.get('token') || '';

  // Derive base URL from current page origin
  var baseUrl = window.location.origin;

  /**
   * Authenticated fetch to the dovi-server API.
   * @param {string} path — e.g. '/api/exec'
   * @param {RequestInit} [opts]
   * @returns {Promise<any>} parsed JSON response
   */
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign(
      { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      opts.headers || {}
    );
    return fetch(baseUrl + path, opts).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /**
   * Run a bash command on the server.
   * @param {string} cmd — bash command to execute
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  function exec(cmd) {
    return api('/api/exec', {
      method: 'POST',
      body: JSON.stringify({ cmd: cmd }),
    });
  }

  /**
   * Send a message to the native app via the WebView bridge.
   * @param {object} msg
   */
  function bridge(msg) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }

  /**
   * Copy text to the device clipboard.
   * Falls back to navigator.clipboard if not inside the native app.
   * @param {string} text
   */
  function copy(text) {
    bridge({ type: 'copy', text: text });
    // Fallback for web testing
    if (!window.ReactNativeWebView && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(function () {});
    }
  }

  /**
   * Open a URL in the system browser (not the webview).
   * @param {string} url
   */
  function openUrl(url) {
    bridge({ type: 'openUrl', url: url });
  }

  /**
   * Navigate back to the app list.
   */
  function done() {
    bridge({ type: 'done' });
  }

  // Export
  window.dovi = {
    token: token,
    baseUrl: baseUrl,
    api: api,
    exec: exec,
    copy: copy,
    openUrl: openUrl,
    done: done,
  };
})();
