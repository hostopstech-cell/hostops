f = open('src/app/dashboard/bookings/page.tsx', 'r')
lines = f.readlines()
f.close()

# Find the line with the 3-dot menu button (⋮) in actions column
for i, line in enumerate(lines):
    if 'onClick={() => {' in line and i > 300:
        print(f"Line {i+1}: {line.strip()}")
        break

# Find actions buttons area - look for check-in button or similar
for i, line in enumerate(lines):
    if 'handleDelete' in line and 'onClick' in line:
        print(f"Delete button at line {i+1}: {line.strip()}")
        break
