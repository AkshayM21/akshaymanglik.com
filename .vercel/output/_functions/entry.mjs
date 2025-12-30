import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_uHBdFyo_.mjs';
import { manifest } from './manifest_DtjC2l0Z.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/subscribe.astro.mjs');
const _page2 = () => import('./pages/api/webhooks/kit.astro.mjs');
const _page3 = () => import('./pages/dereferenced.astro.mjs');
const _page4 = () => import('./pages/dereferenced/_---slug_.astro.mjs');
const _page5 = () => import('./pages/og/dereferenced.png.astro.mjs');
const _page6 = () => import('./pages/og/index.png.astro.mjs');
const _page7 = () => import('./pages/og/_---slug_.png.astro.mjs');
const _page8 = () => import('./pages/rss.xml.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/subscribe.ts", _page1],
    ["src/pages/api/webhooks/kit.ts", _page2],
    ["src/pages/dereferenced/index.astro", _page3],
    ["src/pages/dereferenced/[...slug].astro", _page4],
    ["src/pages/og/dereferenced.png.ts", _page5],
    ["src/pages/og/index.png.ts", _page6],
    ["src/pages/og/[...slug].png.ts", _page7],
    ["src/pages/rss.xml.ts", _page8],
    ["src/pages/index.astro", _page9]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "184a0a97-1b22-4a7d-b3d6-f2c34528b905",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
