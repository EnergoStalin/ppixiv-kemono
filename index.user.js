// ==UserScript==
// @name          kemono.su links for ppixiv
// @author        EnergoStalin
// @description   Add kemono.su patreon & fanbox & fantia links into ppixiv
// @license       AGPL-3.0-only
// @version       1.6.1
// @namespace     https://pixiv.net
// @match         https://*.pixiv.net/*
// @run-at        document-body
// @icon          https://www.google.com/s2/favicons?sz=64&domain=pixiv.net
// @connect       gumroad.com
// @connect       www.patreon.com
// @connect       kemono.su
// @grant         GM.xmlHttpRequest
// ==/UserScript==

"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/kemono.ts
  function toApiUrl(u) {
    const url = new URL(u);
    url.pathname = `/api/v1${url.pathname}/profile`;
    return url.toString();
  }
  __name(toApiUrl, "toApiUrl");
  function getCreatorData(u) {
    return __async(this, null, function* () {
      const url = toApiUrl(u);
      const response = yield GM.xmlHttpRequest({
        url
      });
      if (response.status === 404)
        throw "Creator dont exists";
      return JSON.parse(response.responseText);
    });
  }
  __name(getCreatorData, "getCreatorData");

  // src/utils.ts
  function normalizeUrl(url) {
    let normalized = url.trim();
    if (!normalized.startsWith("http"))
      normalized = `https://${normalized}`;
    return normalized;
  }
  __name(normalizeUrl, "normalizeUrl");
  function memoize(fn) {
    const cache = /* @__PURE__ */ new Map();
    let mutex = false;
    return function(onHit, userId, ...args) {
      if (mutex)
        return;
      mutex = true;
      const key = args[0];
      if (cache.has(key)) {
        mutex = false;
        return onHit(cache.get(key));
      }
      fn.apply(this, args).then((e) => {
        cache.set(key, e);
        notifyUserUpdated(userId);
        mutex = false;
      });
    };
  }
  __name(memoize, "memoize");

  // src/ppixiv.ts
  var BODY_LINK_REGEX = /[\W\s]((?:https?:\/\/)?(?:\w+[\.\/])+(?:\w?)+)/g;
  var labelMatchingMap = {
    patreon: "patreon.com",
    fanbox: "Fanbox",
    fantia: "fantia.jp",
    gumroad: "gumroad.com"
  };
  function preprocessMatches(matches) {
    return matches.map((e) => {
      try {
        const url = new URL(normalizeUrl(e));
        return {
          label: labelMatchingMap[Object.keys(labelMatchingMap).find((e2) => url.host.includes(e2))],
          url
        };
      } catch (e2) {
      }
      return void 0;
    });
  }
  __name(preprocessMatches, "preprocessMatches");
  function getLinksFromDescription(extraLinks) {
    const desc = document.body.querySelector(".description");
    const normalized = desc.innerText.replaceAll(/\/\s+/g, "/").replaceAll("(dot)", ".");
    return removeDuplicates(preprocessMatches(Array.from(normalized.matchAll(BODY_LINK_REGEX)).map((e) => e[1])).filter((e) => e), extraLinks);
  }
  __name(getLinksFromDescription, "getLinksFromDescription");
  function removeDuplicates(links, extraLinks) {
    const labels = extraLinks.map((e) => e.label);
    return links.filter((e) => !labels.includes(e.label));
  }
  __name(removeDuplicates, "removeDuplicates");
  function notifyUserUpdated(userId) {
    unsafeWindow.ppixiv.userCache.callUserModifiedCallbacks(userId);
  }
  __name(notifyUserUpdated, "notifyUserUpdated");

  // src/postprocessLinks.ts
  function fastHash(str) {
    let hash = 0;
    if (str.length === 0)
      return hash;
    for (let i = 0; i < str.length; i++) {
      hash += str.charCodeAt(i);
    }
    return hash;
  }
  __name(fastHash, "fastHash");
  var cachedRequests = {};
  function cacheRequest(url) {
    return __async(this, null, function* () {
      try {
        const data = yield getCreatorData(url);
        cachedRequests[url] = {
          redirected: false,
          lastUpdate: data.updated.split("T")[0]
        };
      } catch (e) {
        cachedRequests[url] = {
          redirected: true
        };
      }
    });
  }
  __name(cacheRequest, "cacheRequest");
  var pending = /* @__PURE__ */ new Set();
  function postprocessLinks(links, userInfo) {
    const hash = fastHash(JSON.stringify(links));
    if (!pending.has(hash)) {
      pending.add(hash);
      Promise.all(links.filter((e) => cachedRequests[e.url.toString()] === void 0).map((e) => cacheRequest(e.url.toString()))).then((e) => {
        pending.delete(hash);
        if (e.length > 0) {
          notifyUserUpdated(userInfo.userId);
        }
      }).catch(console.error);
    }
    for (const l of links) {
      const request = cachedRequests[l.url.toString()];
      if ((request == null ? void 0 : request.redirected) === true) {
        l.label += " (Redirected)";
        l.disabled = true;
      } else if (request === void 0) {
        l.disabled = true;
      } else {
        l.label += ` (${request.lastUpdate})`;
      }
    }
    return links;
  }
  __name(postprocessLinks, "postprocessLinks");

  // src/sites/fanbox.ts
  function fanbox(extraLinks, userId) {
    extraLinks.push({
      url: new URL(`https://kemono.su/fanbox/user/${userId}`),
      icon: "mat:money_off",
      type: `kemono_fanbox#${userId}`,
      label: "Kemono fanbox"
    });
  }
  __name(fanbox, "fanbox");

  // src/sites/fantia.ts
  function fantia(link, extraLinks) {
    const id = link.url.toString().split("/").pop();
    extraLinks.push({
      url: new URL(`https://kemono.su/fantia/user/${id}`),
      icon: "mat:money_off",
      type: `kemono_fantia#${id}`,
      label: "Kemono fantia"
    });
  }
  __name(fantia, "fantia");

  // src/sites/gumroad.ts
  var GUMROAD_ID_REGEX = /"external_id":"(\d+)"/;
  var ripGumroadId = memoize((link) => __async(void 0, null, function* () {
    return GM.xmlHttpRequest({
      method: "GET",
      timeout: 5e3,
      url: link
    }).then((e) => {
      var _a, _b;
      return (_b = (_a = e.responseText.match(GUMROAD_ID_REGEX)) == null ? void 0 : _a[1]) != null ? _b : "undefined";
    }).catch(console.error);
  }));
  function gumroad(link, extraLinks, userId) {
    ripGumroadId((id) => {
      if (!id) {
        link.disabled = true;
        return;
      }
      extraLinks.push({
        url: new URL(`https://kemono.su/gumroad/user/${id}`),
        icon: "mat:money_off",
        type: `kemono_gumroad#{id}`,
        label: `Kemono gumroad`
      });
    }, userId, link.url.toString());
  }
  __name(gumroad, "gumroad");

  // src/sites/parteon.ts
  function normalizePatreonLink(link) {
    if (typeof link.url === "string")
      link.url = new URL(normalizeUrl(link.url));
    link.url.protocol = "https";
    if (!link.url.host.startsWith("www."))
      link.url.host = `www.${link.url.host}`;
  }
  __name(normalizePatreonLink, "normalizePatreonLink");
  var PATREON_ID_REGEX = new RegExp('"id":\\s*"(\\d+)",[\\n\\s]*"type":\\s*"user"', "ms");
  var ripPatreonId = memoize((link) => __async(void 0, null, function* () {
    return GM.xmlHttpRequest({
      method: "GET",
      timeout: 5e3,
      url: link
    }).then((e) => {
      var _a, _b;
      return (_b = (_a = e.responseText.match(PATREON_ID_REGEX)) == null ? void 0 : _a[1]) != null ? _b : "undefined";
    }).catch(console.error);
  }));
  function patreon(link, extraLinks, userId) {
    normalizePatreonLink(link);
    const url = link.url.toString();
    ripPatreonId((cachedId) => {
      if (!cachedId) {
        link.disabled = true;
        return;
      }
      extraLinks.push({
        url: new URL(`https://kemono.su/patreon/user/${cachedId}`),
        icon: "mat:money_off",
        type: `kemono_patreon#${cachedId}`,
        label: `Kemono patreon`
      });
    }, userId, url);
  }
  __name(patreon, "patreon");

  // src/index.ts
  var addUserLinks = /* @__PURE__ */ __name(({ extraLinks, userInfo }) => {
    const toBeChecked = [];
    for (const link of [
      ...extraLinks,
      ...getLinksFromDescription(extraLinks)
    ]) {
      switch (link.label) {
        case "Fanbox":
          fanbox(toBeChecked, userInfo.userId);
          break;
        case "patreon.com":
          patreon(link, toBeChecked, userInfo.userId);
          break;
        case "gumroad.com":
          gumroad(link, toBeChecked, userInfo.userId);
          break;
        case "fantia.jp":
          fantia(link, toBeChecked);
          break;
        default:
      }
    }
    const discoveredLinks = postprocessLinks(toBeChecked, userInfo);
    extraLinks.push(...discoveredLinks);
  }, "addUserLinks");
  unsafeWindow.vviewHooks = {
    addUserLinks
  };
})();