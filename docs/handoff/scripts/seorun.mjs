import { buildSeo } from '/home/user/School/tools/seo.mjs';
const t = Date.now();
console.log('pages', buildSeo(process.argv[2]), 'ms', Date.now() - t);
