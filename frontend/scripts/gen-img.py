from pathlib import Path

out = Path(__file__).resolve().parents[1] / "public" / "img"
out.mkdir(parents=True, exist_ok=True)

def card(fname, c1, c2, label, sub, extra=""):
    s = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <rect width="800" height="90" fill="#0d241c" opacity="0.35"/>
  {extra}
  <text x="40" y="48" fill="#c4a35a" font-family="Georgia, serif" font-size="16" letter-spacing="4">SNG ONE</text>
  <text x="40" y="508" fill="#ffffff" font-family="Georgia, serif" font-size="36" font-weight="700">{label}</text>
  <text x="40" y="548" fill="#e8efe9" font-family="Arial, sans-serif" font-size="18">{sub}</text>
</svg>
"""
    (out / fname).write_text(s, encoding="utf-8")

cement_bags = """<g transform="translate(420,90)">
  <rect x="0" y="40" width="140" height="200" rx="8" fill="#c4b08a"/>
  <rect x="12" y="52" width="116" height="70" fill="#1b4d3e"/>
  <text x="70" y="94" text-anchor="middle" fill="#c4a35a" font-size="16" font-family="Arial" font-weight="700">50KG</text>
  <rect x="70" y="80" width="150" height="210" rx="8" fill="#b89a6a"/>
  <rect x="82" y="94" width="126" height="70" fill="#163d32"/>
  <text x="145" y="136" text-anchor="middle" fill="#fff" font-size="15" font-family="Arial">CEMENT</text>
</g>"""
timber = """<g transform="translate(80,160)">
  <rect x="0" y="0" width="640" height="36" rx="4" fill="#c48a4a"/>
  <rect x="20" y="44" width="640" height="36" rx="4" fill="#a66d32"/>
  <rect x="8" y="88" width="640" height="36" rx="4" fill="#d4a05c"/>
  <rect x="40" y="132" width="640" height="36" rx="4" fill="#8a5528"/>
  <rect x="0" y="176" width="640" height="36" rx="4" fill="#b87a3c"/>
</g>"""
roof = """<g transform="translate(120,140)" fill="none" stroke="#d9dde0" stroke-width="10">
  <path d="M0 220 L80 80 L160 220 L240 80 L320 220 L400 80 L480 220"/>
  <path d="M0 250 L80 110 L160 250 L240 110 L320 250 L400 110 L480 250" opacity=".6"/>
</g>"""
bricks = "<g transform='translate(90,180)' fill='#b85c3a'>" + "".join(
    f"<rect x='{(i % 6) * 110}' y='{(i // 6) * 58}' width='100' height='48' rx='3'/>" for i in range(18)
) + "</g>"
pipe = """<g transform="translate(80,200)" fill="#d7d3c8">
  <rect x="0" y="40" width="620" height="50" rx="25"/>
  <rect x="40" y="120" width="540" height="50" rx="25" fill="#b7b3a8"/>
  <circle cx="40" cy="65" r="32" fill="#eee"/><circle cx="40" cy="65" r="18" fill="#1b4d3e"/>
</g>"""
cable = """<g transform="translate(430,140)">
  <circle cx="120" cy="160" r="130" fill="none" stroke="#c9a227" stroke-width="28"/>
  <circle cx="120" cy="160" r="90" fill="none" stroke="#2a2a2a" stroke-width="22"/>
  <circle cx="120" cy="160" r="55" fill="#1b4d3e"/>
</g>"""
paint = """<g transform="translate(480,130)">
  <rect x="40" y="80" width="160" height="220" rx="12" fill="#f4f4f0"/>
  <rect x="40" y="80" width="160" height="70" fill="#1b4d3e"/>
  <circle cx="120" cy="200" r="36" fill="#3d8b73"/>
  <rect x="70" y="40" width="100" height="50" rx="8" fill="#c4a35a"/>
</g>"""
door = """<g transform="translate(470,70)">
  <rect x="40" y="40" width="180" height="420" rx="6" fill="#6b3f22"/>
  <rect x="58" y="58" width="144" height="160" fill="#5a341c"/>
  <rect x="58" y="232" width="144" height="160" fill="#5a341c"/>
  <circle cx="196" cy="250" r="10" fill="#c4a35a"/>
</g>"""
tools = """<g transform="translate(420,120)">
  <rect x="80" y="40" width="36" height="280" rx="8" fill="#2c2c2c"/>
  <rect x="40" y="40" width="116" height="70" rx="10" fill="#1b4d3e"/>
  <circle cx="98" cy="200" r="70" fill="#4a4a4a"/>
  <circle cx="98" cy="200" r="28" fill="#c4a35a"/>
</g>"""
sand = """<g transform="translate(60,280)">
  <ellipse cx="180" cy="160" rx="220" ry="70" fill="#c4a06a"/>
  <ellipse cx="400" cy="140" rx="180" ry="60" fill="#a8844a"/>
  <ellipse cx="280" cy="200" rx="260" ry="50" fill="#d4b07a"/>
</g>"""
truck = """<g transform="translate(80,220)">
  <rect x="180" y="40" width="420" height="160" rx="8" fill="#1b4d3e"/>
  <rect x="40" y="90" width="150" height="110" rx="8" fill="#163d32"/>
  <circle cx="160" cy="220" r="42" fill="#222"/><circle cx="160" cy="220" r="18" fill="#888"/>
  <circle cx="520" cy="220" r="42" fill="#222"/><circle cx="520" cy="220" r="18" fill="#888"/>
  <text x="240" y="130" fill="#c4a35a" font-size="28" font-family="Georgia">SNG FLEET</text>
</g>"""
house = """<g transform="translate(420,90)" fill="#e8efe9">
  <polygon points="160,40 40,160 280,160" fill="#c4a35a"/>
  <rect x="70" y="160" width="180" height="160" fill="#f4f1ea"/>
  <rect x="130" y="230" width="60" height="90" fill="#1b4d3e"/>
</g>"""
cut = """<g transform="translate(90,180)">
  <rect x="0" y="80" width="500" height="48" rx="4" fill="#c48a4a"/>
  <rect x="520" y="80" width="90" height="48" rx="4" fill="#a66d32"/>
  <rect x="0" y="160" width="220" height="40" fill="#d4a05c"/>
  <rect x="240" y="160" width="220" height="40" fill="#d4a05c"/>
  <rect x="480" y="160" width="120" height="40" fill="#8a5528"/>
</g>"""

card("cement.svg", "#3d4a3c", "#1b4d3e", "CEMENT &amp; CONCRETE", "Bags, mix and masonry", cement_bags)
card("cement2.svg", "#4a5340", "#24382e", "STRUCTURAL CEMENT", "50kg bags in stock", cement_bags)
card("timber.svg", "#5c3a1e", "#2a1810", "TIMBER", "Pine, structural, cut-to-size", timber)
card("roof.svg", "#3a4650", "#1b2830", "ROOFING", "IBR sheets, ridges, screws", roof)
card("brick.svg", "#6a3224", "#3a1c14", "BRICKS &amp; BLOCKS", "Clay, concrete, maxi", bricks)
card("pipe.svg", "#4a5550", "#1e2c28", "PLUMBING", "Pipe, tanks, sanitary", pipe)
card("cable.svg", "#2a2f28", "#121814", "ELECTRICAL", "Cable, geysers, boards", cable)
card("paint.svg", "#355c50", "#1b3d34", "PAINT", "Interior, exterior, primer", paint)
card("door.svg", "#4a301c", "#24160e", "DOORS &amp; WINDOWS", "Security, hardwood, frames", door)
card("tools.svg", "#2c3330", "#101412", "TOOLS", "Grinders, drills, site gear", tools)
card("sand.svg", "#8a6a3a", "#4a3818", "SAND &amp; AGGREGATES", "River sand, stone, dust", sand)
card("geyser.svg", "#3a4a52", "#1a2428", "Geysers &amp; fittings", "150L electric and more", cable)
card("toilet.svg", "#4a5558", "#22282a", "SANITARYWARE", "Suites, taps, mixers", pipe)
card("tap.svg", "#5a6064", "#2a3034", "TAPS &amp; MIXERS", "Chrome fittings", tools)
card("hero.svg", "#16352c", "#0c1c18", "EVERYTHING YOU NEED TO BUILD.", "Quality materials across all SNG branches", house)
card("hero-2.svg", "#2a1c10", "#120c08", "TIMBER CUT TO SIZE", "Choose lengths. We prepare the cut list.", cut)
card("hero-3.svg", "#1a2a24", "#0c1612", "WE DELIVER TO YOUR SITE", "Cement, timber, roofing, aggregates", truck)
card("delivery.svg", "#1b4d3e", "#0d281f", "SITE DELIVERY", "SNG fleet to your project", truck)
card("cutting.svg", "#4a3018", "#1c1208", "TIMBER CUTTING", "Kerf, offcuts and reusable lengths", cut)
card("house.svg", "#1e3a32", "#10201c", "BUILDING A HOUSE?", "Foundation to finishing quotation", house)
card("trade.svg", "#163028", "#0a1814", "SNG TRADE ACCOUNT", "Builders, contractors, businesses", house)
print("wrote", len(list(out.glob("*.svg"))), "svgs to", out)
