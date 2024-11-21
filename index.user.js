// ==UserScript==
// @name          kemono.su links for ppixiv
// @author        EnergoStalin
// @description   Add kemono.su patreon & fanbox & fantia links into ppixiv
// @license       AGPL-3.0-only
// @version       1.7.2
// @namespace     https://pixiv.net
// @match         https://*.pixiv.net/*
// @run-at        document-body
// @icon          https://www.google.com/s2/favicons?sz=64&domain=pixiv.net
// @connect       gumroad.com
// @connect       www.patreon.com
// @connect       kemono.su
// @connect       nekohouse.su
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

  // src/databases/kemono.ts
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
      if (response.status === 404) throw "Creator dont exists";
      const data = JSON.parse(response.responseText);
      return {
        lastUpdate: data.updated.split("T")[0]
      };
    });
  }
  __name(getCreatorData, "getCreatorData");
  function getPostData(u) {
    return getCreatorData(u);
  }
  __name(getPostData, "getPostData");

  // src/databases/nekohouse.ts
  var CREATOR_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/;
  var POST_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/;
  function fetchPage(url) {
    return __async(this, null, function* () {
      const response = yield GM.xmlHttpRequest({
        method: "GET",
        url
      });
      if (response.finalUrl !== url) throw new Error(`creator does not exists ${url}`);
      return response.responseText;
    });
  }
  __name(fetchPage, "fetchPage");
  function getCreatorData2(url) {
    return __async(this, null, function* () {
      var _a, _b;
      const html = yield fetchPage(url);
      return {
        lastUpdate: (_b = (_a = html.match(CREATOR_LAST_UPDATE_TIME_REGEX)) == null ? void 0 : _a[1]) == null ? void 0 : _b.split(" ")[0]
      };
    });
  }
  __name(getCreatorData2, "getCreatorData");
  function getPostData2(url) {
    return __async(this, null, function* () {
      var _a, _b;
      const html = yield fetchPage(url);
      return {
        lastUpdate: (_b = (_a = html.match(POST_LAST_UPDATE_TIME_REGEX)) == null ? void 0 : _a[1]) == null ? void 0 : _b.split(" ")[0]
      };
    });
  }
  __name(getPostData2, "getPostData");

  // src/databases/index.ts
  function getCreatorData3(url) {
    return __async(this, null, function* () {
      if (url.includes("kemono")) return url.includes("post") ? getPostData(url) : getCreatorData(url);
      if (url.includes("nekohouse")) return url.includes("post") ? getPostData2(url) : getCreatorData2(url);
      throw new Error(`unknown url ${url}`);
    });
  }
  __name(getCreatorData3, "getCreatorData");

  // src/links/url.ts
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  __name(capitalize, "capitalize");
  function makeUrl(service, site, userId, postId) {
    const post = postId ? `/post/${postId}` : "";
    return {
      url: new URL(`https://${service}.su/${site}/user/${userId}/${post}`),
      icon: "mat:money_off",
      type: `${service}_${site}#{userId}`,
      label: `${capitalize(service)} ${site}`
    };
  }
  __name(makeUrl, "makeUrl");
  function normalizeUrl(url) {
    let normalized = url.trim();
    if (!normalized.startsWith("http")) normalized = `https://${normalized}`;
    return normalized;
  }
  __name(normalizeUrl, "normalizeUrl");

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

  // src/avalibility.ts
  function fastHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
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
        const data = yield getCreatorData3(url);
        cachedRequests[url] = {
          redirected: false,
          lastUpdate: data.lastUpdate
        };
      } catch (error) {
        console.error(error);
        cachedRequests[url] = {
          redirected: true
        };
      }
    });
  }
  __name(cacheRequest, "cacheRequest");
  var pending = /* @__PURE__ */ new Set();
  function checkAvalibility(links, userId) {
    const hash = fastHash(JSON.stringify(links));
    if (!pending.has(hash)) {
      pending.add(hash);
      Promise.all(links.filter((e) => cachedRequests[e.url.toString()] === void 0).map((e) => cacheRequest(e.url.toString()))).then((e) => {
        pending.delete(hash);
        if (e.length > 0) {
          notifyUserUpdated(userId);
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
  __name(checkAvalibility, "checkAvalibility");

  // src/links/fanbox.ts
  function fanbox(extraLinks, userId) {
    extraLinks.push(makeUrl("kemono", "fanbox", userId));
    extraLinks.push(makeUrl("nekohouse", "fanbox", userId));
  }
  __name(fanbox, "fanbox");

  // src/links/fantia.ts
  function fantia(link, extraLinks) {
    const id = link.url.toString().split("/").pop();
    extraLinks.push(makeUrl("kemono", "fantia", id));
    extraLinks.push(makeUrl("nekohouse", "fantia", id));
  }
  __name(fantia, "fantia");

  // src/links/memo.ts
  function memoize(fn) {
    const cache = /* @__PURE__ */ new Map();
    let mutex = false;
    return function(onHit, userId, ...args) {
      if (mutex) return;
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

  // src/links/gumroad.ts
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
      extraLinks.push(makeUrl("kemono", "gumroad", id));
      extraLinks.push(makeUrl("nekohouse", "gumroad", id));
    }, userId, link.url.toString());
  }
  __name(gumroad, "gumroad");

  // src/links/patreon.ts
  function normalizePatreonLink(link) {
    if (typeof link.url === "string") link.url = new URL(normalizeUrl(link.url));
    link.url.protocol = "https";
    if (!link.url.host.startsWith("www.")) link.url.host = `www.${link.url.host}`;
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
      extraLinks.push(makeUrl("kemono", "patreon", cachedId));
      extraLinks.push(makeUrl("nekohouse", "patreon", cachedId));
    }, userId, url);
  }
  __name(patreon, "patreon");

  // src/links/index.ts
  function genLinks(extraLinks, userId) {
    const newLinks = [];
    for (const link of [
      ...extraLinks,
      ...getLinksFromDescription(extraLinks)
    ]) {
      switch (link.label) {
        case "Fanbox":
          fanbox(newLinks, userId);
          break;
        case "patreon.com":
          patreon(link, newLinks, userId);
          break;
        case "gumroad.com":
          gumroad(link, newLinks, userId);
          break;
        case "fantia.jp":
          fantia(link, newLinks);
          break;
        default:
      }
    }
    return newLinks;
  }
  __name(genLinks, "genLinks");

  // src/index.ts
  var addUserLinks = /* @__PURE__ */ __name(({ extraLinks, userInfo }) => {
    const toBeChecked = genLinks(extraLinks, userInfo.userId);
    const reachableLinks = checkAvalibility(toBeChecked, userInfo.userId);
    extraLinks.push(...reachableLinks);
  }, "addUserLinks");
  unsafeWindow.vviewHooks = {
    addUserLinks
  };
})();