f = open('src/app/dashboard/bookings/page.tsx', 'r')
lines = f.readlines()
f.close()

# Add infoBooking state after line 165 (0-indexed 164)
# Find last useState line in the state declarations block
last_state_line = 0
for i, line in enumerate(lines):
    if 'useState' in line and i < 250:
        last_state_line = i

print(f"Adding state after line {last_state_line+1}: {lines[last_state_line].strip()}")
lines.insert(last_state_line + 1, '  const [infoBooking, setInfoBooking] = useState<any>(null);\n')

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.writelines(lines)
f.close()
print("Done!")
