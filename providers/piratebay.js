/**
 * piratebay - Built from src/piratebay/
 * Generated: 2026-07-25T17:20:01.533Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
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

// src/_shared/http.js
var DEFAULT_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
  "Cache-Control": "no-cache"
};
function fetchText(_0) {
  return __async(this, arguments, function* (url, options = {}, retries = 2) {
    const _a = options, { headers: extraHeaders } = _a, restOptions = __objRest(_a, ["headers"]);
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = yield fetch(url, __spreadValues({
          headers: __spreadValues(__spreadValues({}, DEFAULT_HEADERS), extraHeaders)
        }, restOptions));
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${url}`);
        }
        return yield response.text();
      } catch (err) {
        if (attempt === retries) {
          throw err;
        }
        yield new Promise((r) => setTimeout(r, (attempt + 1) * 1e3));
      }
    }
  });
}
function fetchJson(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    const text = yield fetchText(url, __spreadProps(__spreadValues({}, options), {
      headers: __spreadValues({
        "Accept": "application/json"
      }, options.headers || {})
    }));
    return JSON.parse(text);
  });
}

// src/piratebay/http.js
var API_URL = "https://apibay.org";
var SITE_URL = "https://thepiratebay.org";
var HEADERS = __spreadProps(__spreadValues({}, DEFAULT_HEADERS), {
  "Referer": `${SITE_URL}/`
});
function fetchJson2(_0) {
  return __async(this, arguments, function* (url, options = {}) {
    return fetchJson(url, __spreadProps(__spreadValues({}, options), {
      headers: __spreadValues(__spreadValues({}, HEADERS), options.headers || {})
    }));
  });
}

// src/_shared/tmdb.js
var TMDB_API_KEY = "ebfc7be4cc7fa987bd5616de3c688c5d";
var TMDB_BASE = "https://api.themoviedb.org/3";
var cache = {};
function getTmdbInfo(tmdbId, mediaType) {
  return __async(this, null, function* () {
    const cacheKey = `${mediaType}_${tmdbId}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }
    try {
      const url = `${TMDB_BASE}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US`;
      const data = yield fetchJson(url);
      const title = mediaType === "movie" ? data.title : data.name;
      const originalTitle = mediaType === "movie" ? data.original_title : data.original_name;
      const releaseDate = mediaType === "movie" ? data.release_date : data.first_air_date;
      const year = releaseDate ? releaseDate.split("-")[0] : "";
      const info = {
        title: title || originalTitle || "",
        originalTitle: originalTitle || title || "",
        year,
        imdbId: data.imdb_id || ""
      };
      cache[cacheKey] = info;
      return info;
    } catch (err) {
      console.error(`[TMDB] Error fetching ${mediaType}/${tmdbId}: ${err.message}`);
      return { title: "", originalTitle: "", year: "", imdbId: "" };
    }
  });
}

// src/_shared/quality.js
function parseQuality(title) {
  const t = title || "";
  const upper = t.toUpperCase();
  const is4K = /2160[pP]|4K|UHD/i.test(t);
  const is1080p = /1080[pP]/i.test(t);
  const is720p = /720[pP]/i.test(t);
  const isHDR = /HDR10\+?|HDR/i.test(t);
  const isDV = /\bDV\b|Dolby[\s\-]?Vision/i.test(t);
  const isRemux = /REMUX/i.test(t);
  const isIMAX = /IMAX/i.test(t);
  const isAtmos = /Atmos/i.test(t);
  let codec = "";
  if (/x265|HEVC|H\.?265/i.test(t))
    codec = "x265";
  else if (/x264|AVC|H\.?264/i.test(t))
    codec = "x264";
  let source = "";
  if (/BluRay|BDRip|BD\b/i.test(t))
    source = "BluRay";
  else if (/WEB[\s\-]?DL/i.test(t))
    source = "WEB-DL";
  else if (/WEBRip/i.test(t))
    source = "WEBRip";
  else if (/HDTV/i.test(t))
    source = "HDTV";
  const sizeMatch = t.match(/\[?([\d.]+)\s*(GB|MB)\]?/i);
  const size = sizeMatch ? `${sizeMatch[1]} ${sizeMatch[2].toUpperCase()}` : "";
  let resolution = "720p";
  if (is4K)
    resolution = "2160p";
  else if (is1080p)
    resolution = "1080p";
  else if (is720p)
    resolution = "720p";
  return {
    resolution,
    is4K,
    is1080p,
    is720p,
    isHDR,
    isDV,
    isRemux,
    isIMAX,
    isAtmos,
    codec,
    source,
    size
  };
}
function getNuvioQuality(quality) {
  if (quality.is4K)
    return "4K";
  if (quality.is1080p)
    return "1080p";
  return "720p";
}
function buildStreamTitle(quality, extraInfo = "") {
  const parts = [quality.resolution];
  if (quality.isHDR)
    parts.push("HDR");
  if (quality.isDV)
    parts.push("DV");
  if (quality.isRemux)
    parts.push("REMUX");
  if (quality.isIMAX)
    parts.push("IMAX");
  if (quality.isAtmos)
    parts.push("Atmos");
  if (quality.source)
    parts.push(quality.source);
  if (quality.codec)
    parts.push(quality.codec);
  if (quality.size)
    parts.push(`[${quality.size}]`);
  if (extraInfo)
    parts.push(extraInfo);
  return parts.join(" ");
}
function filterByQuality(streams) {
  const streams4K = streams.filter((s) => s._quality && s._quality.is4K);
  const streams1080 = streams.filter((s) => s._quality && s._quality.is1080p);
  let result = [];
  if (streams4K.length > 0) {
    result = streams4K;
  }
  if (streams1080.length > 0) {
    result = result.concat(streams1080);
  }
  return result.map((s) => {
    const _a = s, { _quality } = _a, clean = __objRest(_a, ["_quality"]);
    return clean;
  });
}

// src/_shared/search.js
function encodeSearchQuery(query) {
  return encodeURIComponent(query).replace(/%20/g, "+");
}

// src/piratebay/extractor.js
var PROVIDER_NAME = "ThePirateBay";
function buildMagnetLink(infoHash, name) {
  const trackers = [
    "udp://tracker.coppersurfer.tk:6969/announce",
    "udp://tracker.openbittorrent.com:6969/announce",
    "udp://tracker.opentrackr.org:1337",
    "udp://tracker.leechers-paradise.org:6969/announce",
    "udp://opentracker.i2p.rocks:6969/announce",
    "udp://open.demonii.com:1337/announce"
  ];
  const encodedName = encodeURIComponent(name);
  const trString = trackers.map((tr) => `&tr=${encodeURIComponent(tr)}`).join("");
  return `magnet:?xt=urn:btih:${infoHash}&dn=${encodedName}${trString}`;
}
function formatSize(bytes) {
  const num = parseInt(bytes, 10);
  if (isNaN(num) || num === 0)
    return "";
  const gb = num / (1024 * 1024 * 1024);
  if (gb >= 1)
    return `${gb.toFixed(2)} GB`;
  const mb = num / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}
function extractStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    console.log(`[${PROVIDER_NAME}] Extracting: ${mediaType} ${tmdbId}`);
    try {
      const tmdbInfo = yield getTmdbInfo(tmdbId, mediaType);
      if (!tmdbInfo.title) {
        console.log(`[${PROVIDER_NAME}] Could not get TMDB info`);
        return [];
      }
      let query = tmdbInfo.title;
      if (mediaType === "movie" && tmdbInfo.year) {
        query += ` ${tmdbInfo.year}`;
      } else if (mediaType === "tv" && season && episode) {
        const s = String(season).padStart(2, "0");
        const e = String(episode).padStart(2, "0");
        query += ` S${s}E${e}`;
      }
      const searchUrl = `${API_URL}/q.php?q=${encodeSearchQuery(query)}&cat=200`;
      console.log(`[${PROVIDER_NAME}] Fetching API: ${searchUrl}`);
      const results = yield fetchJson2(searchUrl);
      if (!Array.isArray(results) || results.length === 0 || results[0].name === "No results found") {
        console.log(`[${PROVIDER_NAME}] No results found`);
        return [];
      }
      const streams = [];
      for (const item of results) {
        if (!item.info_hash || item.info_hash === "0000000000000000000000000000000000000000")
          continue;
        const name = item.name || "";
        const quality = parseQuality(name);
        if (!quality.is4K && !quality.is1080p)
          continue;
        const sizeStr = formatSize(item.size);
        const seeders = item.seeders || "0";
        const extraInfo = `${sizeStr ? `[${sizeStr}]` : ""} \u2699\uFE0F${seeders} seeds`;
        const magnet = buildMagnetLink(item.info_hash, name);
        streams.push({
          name: PROVIDER_NAME,
          title: buildStreamTitle(quality, extraInfo),
          url: magnet,
          quality: getNuvioQuality(quality),
          _quality: quality
        });
      }
      console.log(`[${PROVIDER_NAME}] Found ${streams.length} raw streams`);
      return filterByQuality(streams);
    } catch (err) {
      console.error(`[${PROVIDER_NAME}] Error: ${err.message}`);
      return [];
    }
  });
}

// src/piratebay/index.js
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[ThePirateBay] Request: ${mediaType} ${tmdbId}`);
      const streams = yield extractStreams(tmdbId, mediaType, season, episode);
      return streams;
    } catch (error) {
      console.error(`[ThePirateBay] Error: ${error.message}`);
      return [];
    }
  });
}
module.exports = { getStreams };
