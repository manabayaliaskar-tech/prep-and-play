import sys, runpy
K = runpy.run_path(sys.argv[1])['K']
p='/home/user/School/src/i18n/strings.js'
s=open(p).read()
for k in K:
    if ("  '%s':" % k) in s: print('DUP', k); sys.exit(1)
parts=s.split("  'wear.rainbow':")
assert len(parts)==4
out=parts[0]
for li,part in enumerate(parts[1:]):
    nl=part.index('\n')+1
    add=''.join("  '%s': '%s',\n" % (k, v[li].replace("\\","\\\\").replace("'","\\'")) for k,v in K.items())
    out+="  'wear.rainbow':"+part[:nl]+add+part[nl:]
open(p,'w').write(out)
print('added', len(K))
