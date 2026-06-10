f = open('src/app/book/[propertyId]/page.tsx', 'r')
c = f.read()
f.close()
c = c.replace(
    'fontSize: "14px", outline: "none"',
    'fontSize: "14px", outline: "none", color: "#111"'
)
f = open('src/app/book/[propertyId]/page.tsx', 'w')
f.write(c)
f.close()
print('Fixed!')

