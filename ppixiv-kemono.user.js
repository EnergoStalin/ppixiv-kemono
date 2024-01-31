// ==UserScript==
// @name         kemono.su links for ppixiv
// @namespace    https://www.pixiv.net/
// @version      1.4.0
// @description  Add kemono.su buttons on ppixiv user dropdown
// @author       EnergoStalin
// @match        https://*.pixiv.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pixiv.net
// @license      AGPL-3.0-only
// @grant        GM_xmlhttpRequest
// @connect      www.patreon.com
// @connect      kemono.su
// @run-at       document-start
// ==/UserScript==

(function() {
  'use strict';

  const cachedPatreonUsers = {};
  const cachedRedirects = {};
  const labelMatchingMap = {
      "patreon": "patreon.com",
      "fanbox": "Fanbox",
      "fantia": "fantia.jp",
  };
  const labelList = Object.values(labelMatchingMap);

  const patreonIdRegex = /"id":\s*"(\d+)",[\n\s]*"type":\s*"user"/sm;
  const linkRegex = /[\W\s]((?:https?:\/\/)?(?:\w+[\.\/].+){2,})/g;

  function notifyUserUpdated(userId) {
      unsafeWindow.ppixiv.userCache.callUserModifiedCallbacks(userId);
  }

  function normalizeUrl(url) {
      url = url.trim();
      if(!url.startsWith("http")) url = `https://${url}`;

      return url;
  }

  function getLinksFromDescription(extraLinks) {
      return removeDuplicates(
          preprocessMatches(
              Array.from(document.body.querySelector(".description").innerText.matchAll(linkRegex)).map(e => e[1])
          ).filter(e => e),
          extraLinks
      );
  }

  function removeDuplicates(links, extraLinks) {
      const labels = extraLinks.map(e => e.label);
      return links.filter(e => !labels.includes(e.label));
  }

  function preprocessMatches(matches) {
      return matches.map(e => {
          try {
              const url = new URL(normalizeUrl(e));
              return {
                  label: labelMatchingMap[Object.keys(labelMatchingMap).filter(e => url.host.includes(e))[0]],
                  url
              };
          } catch {
              return;
          }
      });
  }

  function normalizePatreonLink(link) {
      if(typeof(link.url) === "string") link.url = new URL(normalizeUrl(link.url));

      link.url.protocol = "https";
      if(!link.url.host.startsWith("www.")) link.url.host = `www.${link.url.host}`;
  }

  async function ripPatreonId(link) {
      const response = await GM.xmlHttpRequest({
          method: "GET",
          url: link,
      });
      return response.responseText.match(patreonIdRegex)[1];
  }

  function patreon(link, extraLinks, userInfo) {
      normalizePatreonLink(link);
      const url = link.url.toString();
      const cachedId = cachedPatreonUsers[url];
      if(!cachedId) {
          ripPatreonId(url).then(id => {
              cachedPatreonUsers[url] = id;
              notifyUserUpdated(userInfo.userId);
          }).catch(console.error)
      } else {
          extraLinks.push({
              url: new URL(`https://kemono.su/patreon/user/${cachedId}`),
              icon: "mat:money_off",
              type: "kemono_patreon",
              label: "Kemono patreon"
          });
      }
  }

  function fanbox(extraLinks, userInfo) {
      extraLinks.push({
          url: new URL(`https://kemono.su/fanbox/user/${userInfo.userId}`),
          icon: "mat:money_off",
          type: "kemono_fanbox",
          label: "Kemono fanbox"
      });
  }

  function fantia(link, extraLinks) {
      const id = link.url.toString().split("/").pop();
      extraLinks.push({
          url: new URL(`https://kemono.su/fantia/user/${id}`),
          icon: "mat:money_off",
          type: "kemono_fantia",
          label: "Kemono fantia"
      });
  }

  async function checkRedirect(cache, url) {
      const response = await GM.xmlHttpRequest({
          method: "GET",
          redirect: "manual",
          url: url,
      });
      const value = response.finalUrl !== url;
      cache[url] = value
  }

  String.prototype.hashCode = function() {
      var hash = 0,
          i, chr;
      if (this.length === 0) return hash;
      for (i = 0; i < this.length; i++) {
          chr = this.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
      }
      return hash;
  }

  const pending = new Set()
  function removeDeadLinks(links, userInfo) {
      const hash = JSON.stringify(links.map(e => e.url.toString()).sort()).hashCode()

      if(!pending.has(hash)) {
          pending.add(hash)

          Promise.all(
              links
              .filter(e => cachedRedirects[e.url.toString()] === undefined)
              .map(e => checkRedirect(cachedRedirects, e.url.toString()))
          ).then(e => {
              pending.delete(hash)
              if(e.length) {
                  notifyUserUpdated(userInfo.userId)
              }
          }).catch(console.error)
      }

      for(const l of links) {
          l.disabled = true
          if(cachedRedirects[l.url.toString()] === true) {
              l.label += ' (Redirected)'
          } else {
              delete l.disabled
          }
      }

      return links
  }

  function addUserLinks({ extraLinks, userInfo }) {
      const toBeChecked = []
      for(const link of [...extraLinks, ...getLinksFromDescription(toBeChecked)]) {
          switch(link.label) {
              case "Fanbox": fanbox(toBeChecked, userInfo); break;
              case "patreon.com": patreon(link, toBeChecked, userInfo); break;
              case "fantia.jp": fantia(link, toBeChecked); break;
          }
      }

      extraLinks.push(...removeDeadLinks(toBeChecked, userInfo))
  }

  unsafeWindow.vviewHooks = {
      addUserLinks
  };
})();
