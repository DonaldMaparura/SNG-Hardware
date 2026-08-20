from pathlib import Path
root = Path(r"C:\Users\admin\IdeaProjects\SNG Hardware\frontend\public\img")
(root / "products").mkdir(parents=True, exist_ok=True)
(root / "categories").mkdir(parents=True, exist_ok=True)

def write(path, svg):
    p = root / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(svg, encoding="utf-8")
    print("wrote", path)

# Cement bags — yard style
write("products/cem-ppc-50.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6a6a62"/><stop offset="100%" stop-color="#3a3a34"/></linearGradient></defs>
  <rect width="800" height="600" fill="#4a4a42"/>
  <ellipse cx="400" cy="520" rx="340" ry="40" fill="#3a3a34" opacity=".5"/>
  <g transform="translate(120,90)">
    <rect x="40" y="80" width="220" height="300" rx="8" fill="#d4c4a0"/>
    <rect x="55" y="100" width="190" height="90" fill="#1a3d1f"/>
    <text x="150" y="145" text-anchor="middle" fill="#8BC53F" font-family="Arial" font-size="28" font-weight="700">PPC</text>
    <text x="150" y="175" text-anchor="middle" fill="#fff" font-family="Arial" font-size="16">CEMENT 50KG</text>
    <rect x="200" y="40" width="240" height="320" rx="8" fill="#cbb896"/>
    <rect x="218" y="60" width="204" height="100" fill="#163528"/>
    <text x="320" y="110" text-anchor="middle" fill="#8BC53F" font-family="Arial" font-size="32" font-weight="700">50KG</text>
    <text x="320" y="140" text-anchor="middle" fill="#fff" font-family="Arial" font-size="18">CEMENT</text>
    <rect x="360" y="100" width="220" height="300" rx="8" fill="#b8a47a"/>
    <rect x="375" y="120" width="190" height="90" fill="#1a3d1f"/>
    <text x="470" y="175" text-anchor="middle" fill="#fff" font-family="Arial" font-size="16">SNG STOCK</text>
  </g>
  <text x="40" y="560" fill="#8BC53F" font-family="Arial" font-size="14" letter-spacing="3">SNG HARDWARE · BUILDERS ONE STOP</text>
</svg>''')

write("products/cem-laf-50.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#3f4a40"/>
  <g transform="translate(180,70)">
    <rect x="60" y="60" width="200" height="340" rx="8" fill="#e0d2b0"/>
    <rect x="78" y="90" width="164" height="110" fill="#0d2a18"/>
    <text x="160" y="145" text-anchor="middle" fill="#8BC53F" font-family="Arial" font-size="26" font-weight="700">LAFARGE</text>
    <text x="160" y="175" text-anchor="middle" fill="#fff" font-family="Arial" font-size="16">50KG</text>
    <rect x="200" y="100" width="220" height="340" rx="8" fill="#d2c09a"/>
    <rect x="218" y="130" width="184" height="110" fill="#1a3d1f"/>
    <text x="310" y="185" text-anchor="middle" fill="#fff" font-family="Arial" font-size="28" font-weight="700">CEMENT</text>
    <text x="310" y="215" text-anchor="middle" fill="#8BC53F" font-family="Arial" font-size="16">50KG BAG</text>
  </g>
</svg>''')

write("products/timber-stack.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#2a1c10"/>
  <g transform="translate(40,120)">
    ''' + "".join(f'<rect x="{20+(i%2)*10}" y="{i*42}" width="700" height="34" rx="3" fill="{["#c48a4a","#a66d32","#d4a05c","#8a5528","#b87a3c"][i%5]}"/>' for i in range(9)) + '''
  </g>
  <text x="40" y="80" fill="#e0b36a" font-family="Arial" font-size="22" font-weight="700">STRUCTURAL PINE</text>
  <text x="40" y="560" fill="#8BC53F" font-family="Arial" font-size="14">TIMBER · CUT TO SIZE AVAILABLE</text>
</svg>''')

write("products/timber-long.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#1c1208"/>
  <g transform="translate(30,180)">
    <rect x="0" y="0" width="740" height="40" rx="4" fill="#c48a4a"/>
    <rect x="20" y="55" width="740" height="40" rx="4" fill="#a66d32"/>
    <rect x="0" y="110" width="740" height="40" rx="4" fill="#d4a05c"/>
    <rect x="40" y="165" width="740" height="40" rx="4" fill="#8a5528"/>
    <rect x="10" y="220" width="740" height="40" rx="4" fill="#b87a3c"/>
  </g>
  <text x="40" y="80" fill="#e0b36a" font-family="Arial" font-size="22" font-weight="700">PINE 38 × 114 · LONG LENGTHS</text>
</svg>''')

write("products/ibr-sheet.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#2a3238"/>
  <g fill="none" stroke="#c5ccd0" stroke-width="14" transform="translate(80,120)">
    <path d="M0 280 L90 40 L180 280 L270 40 L360 280 L450 40 L540 280"/>
    <path d="M0 320 L90 80 L180 320 L270 80 L360 320 L450 80 L540 320" opacity=".55"/>
  </g>
  <text x="40" y="80" fill="#8BC53F" font-family="Arial" font-size="22" font-weight="700">IBR ROOFING SHEETS</text>
  <text x="40" y="560" fill="#d0d5d8" font-family="Arial" font-size="14">GALVANISED · 3m / 4.8m / 6m</text>
</svg>''')

write("products/paint-20l.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#2a3a32"/>
  <g transform="translate(280,80)">
    <rect x="40" y="100" width="200" height="320" rx="16" fill="#f4f4f0"/>
    <rect x="40" y="100" width="200" height="90" fill="#1a3d1f"/>
    <text x="140" y="155" text-anchor="middle" fill="#8BC53F" font-family="Arial" font-size="22" font-weight="700">20L</text>
    <circle cx="140" cy="280" r="48" fill="#8BC53F"/>
    <rect x="70" y="50" width="140" height="60" rx="8" fill="#c4a35a"/>
    <text x="140" y="400" text-anchor="middle" fill="#1a3d1f" font-family="Arial" font-size="16">INTERIOR PAINT</text>
  </g>
</svg>''')

write("products/geyser-150.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#2a3438"/>
  <g transform="translate(260,60)">
    <rect x="60" y="40" width="200" height="420" rx="100" fill="#d8dde0"/>
    <rect x="80" y="80" width="160" height="60" fill="#1a3d1f"/>
    <text x="160" y="118" text-anchor="middle" fill="#8BC53F" font-family="Arial" font-size="20" font-weight="700">150L</text>
    <circle cx="160" cy="280" r="28" fill="#4a5558"/>
    <rect x="140" y="430" width="40" height="50" fill="#888"/>
  </g>
  <text x="40" y="560" fill="#d0d5d8" font-family="Arial" font-size="14">ELECTRIC GEYSER</text>
</svg>''')

write("products/wheelbarrow.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#2a2f28"/>
  <g transform="translate(120,140)">
    <path d="M80 80 L420 80 L480 220 L60 220 Z" fill="#8BC53F"/>
    <rect x="40" y="210" width="520" height="24" fill="#1a3d1f"/>
    <circle cx="200" cy="320" r="70" fill="#222"/><circle cx="200" cy="320" r="28" fill="#888"/>
    <rect x="420" y="200" width="18" height="180" fill="#555" transform="rotate(-25 420 200)"/>
    <rect x="480" y="200" width="18" height="180" fill="#555" transform="rotate(-25 480 200)"/>
  </g>
  <text x="40" y="560" fill="#8BC53F" font-family="Arial" font-size="14">WHEELBARROW 65L</text>
</svg>''')

write("products/builders-sand.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#5a4828"/>
  <ellipse cx="280" cy="380" rx="240" ry="90" fill="#c4a06a"/>
  <ellipse cx="480" cy="340" rx="200" ry="70" fill="#a8844a"/>
  <ellipse cx="380" cy="430" rx="280" ry="60" fill="#d4b07a"/>
  <text x="40" y="80" fill="#f0e0c0" font-family="Arial" font-size="22" font-weight="700">BUILDERS SAND</text>
  <text x="40" y="560" fill="#e8d2a8" font-family="Arial" font-size="14">BULK · CUBIC METRE</text>
</svg>''')

write("products/river-sand.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#3a4a48"/>
  <ellipse cx="300" cy="360" rx="250" ry="95" fill="#b8c0a8"/>
  <ellipse cx="500" cy="320" rx="180" ry="70" fill="#9aa890"/>
  <ellipse cx="400" cy="420" rx="260" ry="55" fill="#c8d0b8"/>
  <text x="40" y="80" fill="#e8efe9" font-family="Arial" font-size="22" font-weight="700">RIVER SAND</text>
</svg>''')

write("products/stone.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#3a3a3a"/>
  <g fill="#8a8a8a">
    <ellipse cx="280" cy="360" rx="60" ry="40"/><ellipse cx="360" cy="320" rx="50" ry="35"/>
    <ellipse cx="440" cy="370" rx="70" ry="45"/><ellipse cx="520" cy="310" rx="55" ry="38"/>
    <ellipse cx="340" cy="420" rx="80" ry="40"/><ellipse cx="480" cy="430" rx="65" ry="35"/>
  </g>
  <text x="40" y="80" fill="#ddd" font-family="Arial" font-size="22" font-weight="700">19mm STONE</text>
</svg>''')

write("products/bricks.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#3a1c14"/>
  <g fill="#b85c3a" transform="translate(80,140)">''' + "".join(
    f'<rect x="{(i%6)*110}" y="{(i//6)*58}" width="100" height="48" rx="3"/>' for i in range(18)
) + '''</g>
  <text x="40" y="80" fill="#e0a090" font-family="Arial" font-size="22" font-weight="700">CLAY BRICKS / BLOCKS</text>
</svg>''')

write("products/blocks.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#3a3a3a"/>
  <g fill="#9a9a9a" transform="translate(100,160)">
    <rect x="0" y="0" width="180" height="90" rx="4"/><rect x="200" y="0" width="180" height="90" rx="4"/>
    <rect x="400" y="0" width="180" height="90" rx="4"/><rect x="100" y="110" width="180" height="90" rx="4"/>
    <rect x="300" y="110" width="180" height="90" rx="4"/><rect x="200" y="220" width="180" height="90" rx="4"/>
  </g>
  <text x="40" y="80" fill="#ddd" font-family="Arial" font-size="22" font-weight="700">6 INCH CONCRETE BLOCK</text>
</svg>''')

write("products/pvc-pipe.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#2a3230"/>
  <g fill="#d7d3c8" transform="translate(60,200)">
    <rect x="0" y="40" width="680" height="50" rx="25"/>
    <rect x="40" y="120" width="600" height="50" rx="25" fill="#b7b3a8"/>
    <circle cx="40" cy="65" r="32" fill="#eee"/><circle cx="40" cy="65" r="18" fill="#1a3d1f"/>
  </g>
  <text x="40" y="80" fill="#8BC53F" font-family="Arial" font-size="22" font-weight="700">PVC PIPE</text>
</svg>''')

write("products/toilet.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#3a4244"/>
  <g fill="#f2f2f0" transform="translate(280,80)">
    <rect x="40" y="40" width="160" height="120" rx="12"/>
    <rect x="20" y="160" width="200" height="40" rx="8"/>
    <path d="M40 200 Q40 360 120 380 Q200 360 200 200" fill="#e8e8e6"/>
  </g>
  <text x="40" y="560" fill="#ddd" font-family="Arial" font-size="14">TOILET SUITE</text>
</svg>''')

write("products/tap.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#3a4044"/>
  <g fill="#c8c8c8" transform="translate(250,140)">
    <rect x="120" y="40" width="40" height="200" rx="8"/>
    <rect x="40" y="200" width="200" height="36" rx="8"/>
    <circle cx="60" cy="218" r="22"/><circle cx="220" cy="218" r="22"/>
    <path d="M140 40 Q220 40 220 100" fill="none" stroke="#c8c8c8" stroke-width="28"/>
  </g>
  <text x="40" y="560" fill="#ddd" font-family="Arial" font-size="14">MIXER TAP</text>
</svg>''')

write("products/cable.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#1a1e18"/>
  <g transform="translate(280,120)">
    <circle cx="120" cy="160" r="130" fill="none" stroke="#c9a227" stroke-width="28"/>
    <circle cx="120" cy="160" r="90" fill="none" stroke="#2a2a2a" stroke-width="22"/>
    <circle cx="120" cy="160" r="55" fill="#1a3d1f"/>
  </g>
  <text x="40" y="80" fill="#c9a227" font-family="Arial" font-size="22" font-weight="700">COPPER CABLE</text>
</svg>''')

write("products/door.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#24160e"/>
  <g transform="translate(280,40)">
    <rect x="40" y="20" width="200" height="480" rx="6" fill="#6b3f22"/>
    <rect x="58" y="40" width="164" height="180" fill="#5a341c"/>
    <rect x="58" y="240" width="164" height="180" fill="#5a341c"/>
    <circle cx="210" cy="260" r="12" fill="#c4a35a"/>
  </g>
  <text x="40" y="560" fill="#e0b36a" font-family="Arial" font-size="14">DOORS</text>
</svg>''')

write("products/security-door.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#1a1a1a"/>
  <g transform="translate(280,40)">
    <rect x="40" y="20" width="200" height="480" rx="4" fill="#3a3a3a"/>
    <g stroke="#888" stroke-width="4" fill="none">
      <path d="M60 60 H220 V460 H60 Z"/>
      <path d="M80 80 H200 V200 H80 Z"/><path d="M80 240 H200 V420 H80 Z"/>
    </g>
    <circle cx="210" cy="260" r="10" fill="#8BC53F"/>
  </g>
  <text x="40" y="560" fill="#8BC53F" font-family="Arial" font-size="14">SECURITY DOOR</text>
</svg>''')

write("products/sink.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#2a2e30"/>
  <g fill="#c8c8c8" transform="translate(120,180)">
    <rect x="0" y="0" width="260" height="180" rx="20"/>
    <rect x="300" y="0" width="260" height="180" rx="20"/>
    <circle cx="130" cy="90" r="18" fill="#555"/><circle cx="430" cy="90" r="18" fill="#555"/>
  </g>
  <text x="40" y="80" fill="#ddd" font-family="Arial" font-size="22" font-weight="700">DOUBLE KITCHEN SINK</text>
</svg>''')

write("products/grinder.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#1a1a1a"/>
  <g transform="translate(220,140)">
    <rect x="80" y="40" width="40" height="260" rx="8" fill="#333"/>
    <rect x="40" y="40" width="120" height="70" rx="10" fill="#1a3d1f"/>
    <circle cx="100" cy="220" r="90" fill="#555"/><circle cx="100" cy="220" r="35" fill="#8BC53F"/>
  </g>
  <text x="40" y="560" fill="#8BC53F" font-family="Arial" font-size="14">ANGLE GRINDER</text>
</svg>''')

write("products/drill.svg", '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <rect width="800" height="600" fill="#1a1a1a"/>
  <g transform="translate(200,160)">
    <rect x="40" y="80" width="280" height="70" rx="12" fill="#1a3d1f"/>
    <rect x="280" y="95" width="120" height="40" rx="6" fill="#555"/>
    <rect x="100" y="150" width="50" height="120" rx="8" fill="#333"/>
    <rect x="40" y="60" width="80" height="40" fill="#8BC53F"/>
  </g>
  <text x="40" y="560" fill="#8BC53F" font-family="Arial" font-size="14">CORDLESS DRILL</text>
</svg>''')

# Categories — yard-feel using same family
for src, dest in [
    ("products/cem-ppc-50.svg", "categories/cement.svg"),
    ("products/timber-stack.svg", "categories/timber.svg"),
    ("products/ibr-sheet.svg", "categories/roofing.svg"),
    ("products/bricks.svg", "categories/bricks.svg"),
    ("products/pvc-pipe.svg", "categories/plumbing.svg"),
    ("products/cable.svg", "categories/electrical.svg"),
    ("products/paint-20l.svg", "categories/paint.svg"),
    ("products/door.svg", "categories/doors.svg"),
    ("products/grinder.svg", "categories/tools.svg"),
    ("products/builders-sand.svg", "categories/sand.svg"),
]:
    write(dest, (root / src).read_text(encoding="utf-8"))

print("svg merch ready")
