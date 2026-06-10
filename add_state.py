f = open('src/app/dashboard/bookings/page.tsx', 'r')
c = f.read()
f.close()

# Check if state already exists
if 'infoBooking' in c and 'useState' in c.split('infoBooking')[0].split('\n')[-1]:
    print("State already exists")
else:
    # Find deleteId useState line and add after it
    old = 'const [deleteId, setDeleteId] = useState<number | null>(null);'
    new = 'const [deleteId, setDeleteId] = useState<number | null>(null);\n  const [infoBooking, setInfoBooking] = useState<any>(null);'
    if old in c:
        c = c.replace(old, new, 1)
        print("State added!")
    else:
        # Try to find it differently
        lines = c.split('\n')
        for i, line in enumerate(lines):
            if 'deleteId' in line and 'useState' in line:
                print(f"Found deleteId at line {i+1}: {line}")
                break

f = open('src/app/dashboard/bookings/page.tsx', 'w')
f.write(c)
f.close()
