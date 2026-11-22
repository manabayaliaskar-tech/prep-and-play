import re,sys
def insert(path, table_start, lines, closing='`'):
    s=open(path,encoding='utf8').read()
    i=s.index(table_start)
    j=s.index('\n'+closing, i)  # closing backtick at line start
    s=s[:j+1]+lines.strip('\n')+'\n'+s[j+1:]
    open(path,'w',encoding='utf8').write(s)
