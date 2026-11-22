import sys
p = '/home/user/School/src/content/lessons/math.js'
s = open(p).read()
add = open(sys.argv[1]).read().rstrip('\n') + '\n'
i = s.rstrip().rfind('};')
s = s[:i] + add.lstrip('\n') + s[i:]
open(p, 'w').write(s)
print('ok')
