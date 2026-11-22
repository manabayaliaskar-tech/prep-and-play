const { COURSES, trackHref } = await import('/home/user/School/src/catalog/index.js');
for (const c of COURSES) for (const tr of c.tracks) if (tr.spec.some(([t]) => t === process.argv[2])) { console.log(trackHref(c, tr), tr.spec.map((x) => x[0]).join(',')); process.exit(0); }
