f = open('src/app/dashboard/bookings/page.tsx', 'r')
c = f.read()
f.close()

# Fix the closing - replace wrong ending
old = '''    )}
  );
}'''

new = '''    )}
    </>
  );
}'''

# Find the infoBooking modal and fix JSX structure
# The issue is the modal is outside the main return's JSX wrapper
# Let's check what's at line ~560
lines = c.split('\n')
print(f"Total lines: {len(lines)}")
print("Lines 558-570:")
for i, l in enumerate(lines[557:570], 558):
    print(f"{i}: {l}")

