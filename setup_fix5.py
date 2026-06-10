f = open('src/app/dashboard/bookings/page.tsx', 'r')
c = f.read()
f.close()

# The modal is outside the return's JSX - wrap in fragment
# Find the pattern where modal starts outside
c = c.replace(
    '  {infoBooking && (',
    '  {infoBooking && (<>'
)

# Also fix the closing
c = c.replace(
    '''  );
}''',
    '''  );
}''',
    1
)

# The real fix: the </div> before {infoBooking needs to become part of fragment
# Let's find exact pattern
old = '''    </div>
  {infoBooking && ('''

new = '''    </div>
  {infoBooking && ('''

# Actually just wrap whole return in fragment
# Find return( and add <> after it, and </> before );
lines = c.split('\n')
new_lines = []
return_found = False
for i, line in enumerate(lines):
    if '  return (' in line and not return_found:
        new_lines.append(line)
        new_lines.append('    <>')
        return_found = True
    elif line == '  );' and i == len(lines)-2:
        new_lines.append('    </>')
        new_lines.append(line)
    else:
        new_lines.append(line)

c = '\n'.join(new_lines)

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.write(c)
f.close()
print("Fixed!")
