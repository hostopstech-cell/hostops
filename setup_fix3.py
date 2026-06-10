f = open('src/middleware.ts', 'r')
c = f.read()
f.close()
c = c.replace('"auth-token"', '"hostops_token"')
f = open('src/middleware.ts', 'w')
f.write(c)
f.close()
print('Fixed!')

