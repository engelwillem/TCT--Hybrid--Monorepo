[thechoosentalks@s8255 current]$ curl -I https://thechoosentalks.org/build/assets/app-Dk-8BrS7.js
curl -I https://thechoosentalks.org/build/assets/app-HcfMzX7G.cssHTTP/2 200
content-type: text/javascriptlast-modified: Sun, 08 Mar 2026 13:46:29 GMT
accept-ranges: bytescontent-length: 347552
date: Sun, 08 Mar 2026 13:50:47 GMTserver: LiteSpeed
vary: User-Agentalt-svc: h3=":443"; ma=2592000, h3-29=":443"; ma=2592000, h3-Q050=":443"; ma=2592000, h3-Q046=":443"; ma=2592000, h3-Q043=":443"; ma=2592000, quic=":443"; ma=2592000; v="43,46"
HTTP/2 200cache-control: public, max-age=604800
expires: Sun, 15 Mar 2026 13:50:47 GMT
content-type: text/csslast-modified: Sun, 08 Mar 2026 13:46:29 GMTaccept-ranges: bytes
content-length: 159367
date: Sun, 08 Mar 2026 13:50:47 GMT
server: LiteSpeed
vary: User-Agent
alt-svc: h3=":443"; ma=2592000, h3-29=":443"; ma=2592000, h3-Q050=":443"; ma=2592000, h3-Q046=":443"; ma=2592000, h3-Q043=":443"; ma=2592000, quic=":443"; ma=2592000; v="43,46"

[thechoosentalks@s8255 current]$ curl -s https://thechoosentalks.org/build/manifest.json | head -c 500
{
  "_ActionBar-CxgDD0Hf.js": {
    "file": "assets/ActionBar-CxgDD0Hf.js",
    "name": "ActionBar",
    "imports": [
      "resources/js/app.tsx",
      "_utils-CJIAa0ZL.js",
      "_AppIcon-DADLU0s8.js",
      "_proxy-DtLW36QK.js",
      "_createLucideIcon-CKVVfMjL.js",
      "_message-circle-CedrMEeR.js",
      "_share-2-B3PLZZhy.js",
      "_bookmark-COehI1jr.js"
    ]
  },
  "_AppIcon-DADLU0s8.js": {
    "file": "assets/AppIcon-DADLU0s8.js",
    "name": "AppIcon",
    "imports": [