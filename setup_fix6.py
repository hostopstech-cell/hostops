f = open('src/app/dashboard/bookings/page.tsx', 'r')
c = f.read()
f.close()

# Remove the wrongly inserted <> from inside JS code
c = c.replace(
    '      return () => clearTimeout(t);\n    <>\n    }',
    '      return () => clearTimeout(t);\n    }'
)

# Now fix the actual JSX issue - modal is outside return wrapper
# Find the last </div> before ); and wrap modal inside
old = '    </div>\n  {infoBooking && ('
new = '    </div>\n    {infoBooking && ('
c = c.replace(old, new)

# Fix closing of modal - should be inside return()
old = '''    )}
    </>
  );
}'''
c = c.replace(old, '''    )}
  );
}''')

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.write(c)
f.close()
print("Fixed!")

