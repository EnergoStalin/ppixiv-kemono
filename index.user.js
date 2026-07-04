//#region \0@oxc-project+runtime@0.137.0/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(n, t, e, r, o, a, c) {
	try {
		var i = n[a](c), u = i.value;
	} catch (n) {
		e(n);
		return;
	}
	i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
	return function() {
		var t = this, e = arguments;
		return new Promise(function(r, o) {
			var a = n.apply(t, e);
			function _next(n) {
				asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
			}
			function _throw(n) {
				asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
			}
			_next(void 0);
		});
	};
}
//#endregion
//#region src/databases/kemono.ts
function toApiUrl$1(u) {
	const url = new URL(u);
	url.hostname = url.hostname.replace(".su", ".cr");
	url.pathname = `/api/v1${url.pathname.replace(/\/$/, "")}/profile`;
	return url.toString();
}
function getCreatorData$3(_x) {
	return _getCreatorData$3.apply(this, arguments);
}
function _getCreatorData$3() {
	_getCreatorData$3 = _asyncToGenerator(function* (u) {
		const url = toApiUrl$1(u);
		const response = yield GM.xmlHttpRequest({
			url,
			headers: { Accept: "text/css" }
		});
		switch (response.status) {
			case 200: return { lastUpdate: JSON.parse(response.responseText).updated.split("T")[0] };
			case 0: throw new Error("Timeout");
			default: throw new Error(`${response.status}`);
		}
	});
	return _getCreatorData$3.apply(this, arguments);
}
function getPostData$2(u) {
	return getCreatorData$3(u);
}
//#endregion
//#region src/databases/nekohouse.ts
const CREATOR_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/;
const POST_LAST_UPDATE_TIME_REGEX = /datetime="(.+)?"/;
function fetchPage(_x) {
	return _fetchPage.apply(this, arguments);
}
function _fetchPage() {
	_fetchPage = _asyncToGenerator(function* (url) {
		let response;
		try {
			response = yield GM.xmlHttpRequest({
				method: "HEAD",
				url
			});
		} catch (_unused) {
			response = yield GM.xmlHttpRequest({
				method: "GET",
				url
			});
		}
		if (response.finalUrl !== url) throw new Error(`creator does not exist ${url}`);
		switch (response.status) {
			case 200: return (yield GM.xmlHttpRequest({
				method: "GET",
				url
			})).responseText;
			case 0: throw new Error("Timeout");
			default: throw new Error(`${response.status}`);
		}
	});
	return _fetchPage.apply(this, arguments);
}
function getCreatorData$2(_x2) {
	return _getCreatorData$2.apply(this, arguments);
}
function _getCreatorData$2() {
	_getCreatorData$2 = _asyncToGenerator(function* (url) {
		var _html$match;
		return { lastUpdate: (_html$match = (yield fetchPage(url)).match(CREATOR_LAST_UPDATE_TIME_REGEX)) === null || _html$match === void 0 || (_html$match = _html$match[1]) === null || _html$match === void 0 ? void 0 : _html$match.split(" ")[0] };
	});
	return _getCreatorData$2.apply(this, arguments);
}
function getPostData$1(_x3) {
	return _getPostData.apply(this, arguments);
}
function _getPostData() {
	_getPostData = _asyncToGenerator(function* (url) {
		var _html$match2;
		return { lastUpdate: (_html$match2 = (yield fetchPage(url)).match(POST_LAST_UPDATE_TIME_REGEX)) === null || _html$match2 === void 0 || (_html$match2 = _html$match2[1]) === null || _html$match2 === void 0 ? void 0 : _html$match2.split(" ")[0] };
	});
	return _getPostData.apply(this, arguments);
}
//#endregion
//#region src/databases/pawchive.ts
function toApiUrl(u) {
	const url = new URL(u);
	url.pathname = `/api/v1${url.pathname.replace(/\/$/, "")}/profile`;
	return url.toString();
}
function getCreatorData$1(_x) {
	return _getCreatorData$1.apply(this, arguments);
}
function _getCreatorData$1() {
	_getCreatorData$1 = _asyncToGenerator(function* (u) {
		const url = toApiUrl(u);
		const response = yield GM.xmlHttpRequest({
			url,
			headers: { Accept: "text/css" }
		});
		switch (response.status) {
			case 200: return { lastUpdate: JSON.parse(response.responseText).updated.split("T")[0] };
			case 0: throw new Error("Timeout");
			default: throw new Error(`${response.status}`);
		}
	});
	return _getCreatorData$1.apply(this, arguments);
}
function getPostData(u) {
	return getCreatorData$1(u);
}
//#endregion
//#region src/databases/index.ts
function getCreatorData(_x) {
	return _getCreatorData.apply(this, arguments);
}
function _getCreatorData() {
	_getCreatorData = _asyncToGenerator(function* (url) {
		console.log(url);
		if (url.includes("kemono")) return url.includes("post") ? getPostData$2(url) : getCreatorData$3(url);
		if (url.includes("nekohouse")) return url.includes("post") ? getPostData$1(url) : getCreatorData$2(url);
		if (url.includes("pawchive")) return url.includes("post") ? getCreatorData$1(url) : getPostData(url);
		throw new Error(`unknown url ${url}`);
	});
	return _getCreatorData.apply(this, arguments);
}
//#endregion
//#region src/links/url.ts
function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
function makeUrl(service, site, userId, postId) {
	const post = postId ? `/post/${postId}` : "";
	return {
		url: new URL(`https://${service}/${site}/user/${userId}/${post}`),
		icon: "mat:money_off",
		type: `${service}_${site}#${userId}`,
		label: `${capitalize(service)} ${site}`
	};
}
function makeUrls(array, site, userId, postId) {
	array.push(makeUrl("kemono.cr", site, userId, postId), makeUrl("nekohouse.su", site, userId, postId), makeUrl("pawchive.pw", site, userId, postId));
}
function normalizeUrl(url) {
	let normalized = url.trim();
	if (!normalized.startsWith("http")) normalized = `https://${normalized}`;
	return normalized;
}
//#endregion
//#region src/ppixiv.ts
const BODY_LINK_REGEX = /[\W\s]((?:https?:\/\/)?(?:\w+[\.\/])+(?:\w?)+)/g;
const labelMatchingMap = {
	patreon: "patreon.com",
	fanbox: "Fanbox",
	fantia: "fantia.jp",
	gumroad: "gumroad.com",
	twitter: "t.co"
};
function preprocessMatches(matches) {
	return matches.map((e) => {
		try {
			const url = new URL(normalizeUrl(e));
			return {
				label: labelMatchingMap[Object.entries(labelMatchingMap).find(([k, v]) => url.host.includes(v) || url.host.includes(k))[0]],
				url
			};
		} catch (_unused) {}
	});
}
function getLinksFromDescription(extraLinks) {
	const normalized = document.body.querySelector(".description").innerText.replaceAll(/\/\s+/g, "/").replaceAll("(dot)", ".");
	return removeDuplicates(preprocessMatches(Array.from(normalized.matchAll(BODY_LINK_REGEX)).map((e) => e[1])).filter((e) => e), extraLinks);
}
function removeDuplicates(links, extraLinks) {
	const labels = new Set(extraLinks.map((e) => e.label));
	const urls = /* @__PURE__ */ new Set();
	return links.filter((e) => {
		const url = e.url.toString();
		if (urls.has(url) || labels.has(e.label)) return false;
		urls.add(url);
		return true;
	});
}
function notifyUserUpdated(userId) {
	unsafeWindow.ppixiv.userCache.callUserModifiedCallbacks(userId);
}
//#endregion
//#region src/avalibility.ts
function fastHash(str) {
	let hash = 0;
	if (str.length === 0) return hash;
	for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
	return hash;
}
const cachedRequests = {};
function cacheRequest(_x) {
	return _cacheRequest.apply(this, arguments);
}
function _cacheRequest() {
	_cacheRequest = _asyncToGenerator(function* (url) {
		try {
			cachedRequests[url] = { lastUpdate: (yield getCreatorData(url)).lastUpdate };
		} catch (error) {
			console.error(error);
			cachedRequests[url] = { error: `${error}` };
		}
	});
	return _cacheRequest.apply(this, arguments);
}
function clampString(s, max) {
	let end = s.length;
	let postfix = "";
	if (s.length > max) {
		end = max - 3;
		postfix = "...";
	}
	return s.slice(0, Math.max(0, end)) + postfix;
}
const pending = /* @__PURE__ */ new Set();
function checkAvalibility(links, userId) {
	const hash = fastHash(JSON.stringify(links));
	if (!pending.has(hash)) {
		pending.add(hash);
		Promise.all(links.filter((e) => cachedRequests[e.url.toString()] === void 0).map((e) => cacheRequest(e.url.toString()))).then((e) => {
			pending.delete(hash);
			if (e.length > 0) notifyUserUpdated(userId);
		}).catch(console.error);
	}
	for (const l of links) {
		const request = cachedRequests[l.url.toString()];
		if (request === void 0) l.disabled = true;
		else if (request.error) {
			l.label += ` (${clampString(request.error, 15)})`;
			l.disabled = true;
		} else l.label += ` (${request.lastUpdate})`;
	}
	return links;
}
//#endregion
//#region src/links/memo.ts
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
const memoizedRegexRequest = memoize(function() {
	var _ref = _asyncToGenerator(function* (url, regex, _default = "undefined") {
		return GM.xmlHttpRequest({
			method: "GET",
			timeout: 5e3,
			url
		}).then((r) => {
			var _r$responseText$match, _r$responseText$match2;
			return (_r$responseText$match = (_r$responseText$match2 = r.responseText.match(regex)) === null || _r$responseText$match2 === void 0 ? void 0 : _r$responseText$match2[1]) !== null && _r$responseText$match !== void 0 ? _r$responseText$match : _default;
		}).catch(console.error);
	});
	return function(_x, _x2) {
		return _ref.apply(this, arguments);
	};
}());
//#endregion
//#region src/links/fanbox.ts
const fanboxId = memoize(function() {
	var _ref = _asyncToGenerator(function* (creatorId) {
		return GM.xmlHttpRequest({
			url: `https://api.fanbox.cc/creator.get?creatorId=${creatorId}`,
			headers: { Origin: "https://fanbox.cc" }
		}).then((r) => JSON.parse(r.responseText).body.user.userId).catch(console.error);
	});
	return function(_x) {
		return _ref.apply(this, arguments);
	};
}());
function makeFanboxUrls(extraLinks, id) {
	makeUrls(extraLinks, "fanbox", id);
}
function fanbox(link, extraLinks, userId) {
	const url = new URL(link.url);
	if (url.host.includes("pixiv.net")) {
		var _url$pathname$split$p;
		makeFanboxUrls(extraLinks, (_url$pathname$split$p = url.pathname.split("/").pop()) !== null && _url$pathname$split$p !== void 0 ? _url$pathname$split$p : "0");
	} else {
		let creatorId = url.host.split(".").shift();
		if (creatorId && (creatorId === "fanbox" || creatorId === "www")) {
			creatorId = url.pathname.replace(/^[/@]*/, "");
			if (creatorId.length === 0) return;
		}
		fanboxId((id) => makeUrls(extraLinks, "fanbox", id), userId, creatorId);
	}
}
//#endregion
//#region src/links/fantia.ts
function fantia(link, extraLinks) {
	makeUrls(extraLinks, "fantia", link.url.toString().split("/").pop());
}
//#endregion
//#region src/links/gumroad.ts
const GUMROAD_ID_REGEX = /"external_id":"(\d+)"/;
function gumroad(link, extraLinks, userId) {
	memoizedRegexRequest((id) => {
		if (!id) {
			link.disabled = true;
			return;
		}
		makeUrls(extraLinks, "gumroad", id);
	}, userId, link.url.toString(), GUMROAD_ID_REGEX);
}
//#endregion
//#region src/links/patreon.ts
function normalizePatreonLink(link) {
	if (typeof link.url === "string") link.url = new URL(normalizeUrl(link.url));
	link.url.protocol = "https";
	if (!link.url.host.startsWith("www.")) link.url.host = `www.${link.url.host}`;
}
const PATREON_ID_REGEX = /* @__PURE__ */ new RegExp("\"creator\":{\"data\":{\"id\":\"(\\d+)\"", "s");
function patreon(link, extraLinks, userId) {
	normalizePatreonLink(link);
	memoizedRegexRequest((id) => {
		if (!id) {
			link.disabled = true;
			return;
		}
		makeUrls(extraLinks, "patreon", id);
	}, userId, link.url.toString(), PATREON_ID_REGEX);
}
//#endregion
//#region src/links/twitter.ts
const URL_REGEX = /URL=(.+?)"/;
function twitter(_x, _x2, _x3) {
	return _twitter.apply(this, arguments);
}
function _twitter() {
	_twitter = _asyncToGenerator(function* (link, newLinks, userId) {
		memoizedRegexRequest((url) => {
			if (!url) return;
			genLinks(preprocessMatches([url]).filter((e) => e), userId).forEach((e) => newLinks.push(e));
		}, userId, link.url.toString(), URL_REGEX);
	});
	return _twitter.apply(this, arguments);
}
//#endregion
//#region src/links/index.ts
function genLinks(extraLinks, userId) {
	const newLinks = [];
	for (const link of extraLinks) switch (link.label) {
		case "Fanbox":
			fanbox(link, newLinks, userId);
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
		case "t.co":
			twitter(link, newLinks, userId);
			break;
		default:
	}
	return newLinks;
}
//#endregion
//#region src/index.ts
const addUserLinks = ({ extraLinks, userInfo }) => {
	const reachableLinks = checkAvalibility(genLinks([...extraLinks, ...getLinksFromDescription(extraLinks)], userInfo.userId), userInfo.userId);
	extraLinks.push(...reachableLinks);
};
unsafeWindow.vviewHooks = { addUserLinks };
//#endregion
