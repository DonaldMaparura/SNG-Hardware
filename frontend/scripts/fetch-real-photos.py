"""Download real photographic merchandising assets. No SVG product art."""
from pathlib import Path
from urllib.request import Request, urlopen
import shutil
import time

root = Path(__file__).resolve().parents[1] / "public" / "img"
for sub in ("products", "categories", "hero", "services", "brand"):
    (root / sub).mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

def fetch(url: str):
    req = Request(url, headers={"User-Agent": UA, "Accept": "image/avif,image/webp,image/apng,image/*,*/*"})
    with urlopen(req, timeout=40) as r:
        data = r.read()
    return data if len(data) > 12000 else None

def save(rel: str, url: str):
    path = root / rel
    try:
        data = fetch(url)
        if not data:
            print("SKIP small", rel)
            return False
        path.write_bytes(data)
        print("OK", rel, len(data))
        time.sleep(0.25)
        return True
    except Exception as e:
        print("FAIL", rel, e)
        return False

# Brand copies
shutil.copy2(root / "logo.png", root / "brand" / "logo.png")
shutil.copy2(root / "brand-hero.png", root / "brand" / "yard.png")
shutil.copy2(root / "brand-yard.png", root / "brand" / "truck-flyer.png")
shutil.copy2(root / "categories" / "mesh.png", root / "categories" / "wire-mesh.png")
print("brand copied")

# Pexels: construction / building-material focused IDs
# Format: auto=compress&cs=tinysrgb&w=1200
P = "https://images.pexels.com/photos/{}/pexels-photo-{}.jpeg?auto=compress&cs=tinysrgb&w={}"

def pex(id_, w=1200):
    return P.format(id_, id_, w)

# Carefully chosen photo IDs (building materials / yard / tools)
downloads = {
    # PRODUCTS
    "products/ppc-cement-50kg.jpg": pex(2219024, 1000),          # construction materials / concrete work
    "products/lafarge-cement-50kg.jpg": pex(585419, 1000),       # construction site materials
    "products/pine-38x114.jpg": pex(5691659, 1000),              # wood lumber
    "products/pine-6m.jpg": pex(1094767, 1000),                  # timber/wood
    "products/ibr-roofing.jpg": pex(259588, 1000),               # metal roof
    "products/paint-20l.jpg": pex(5691630, 1000),                # paint
    "products/geyser-150.jpg": pex(6585755, 1000),               # bathroom/geyser-ish
    "products/copper-cable.jpg": pex(257736, 1000),              # electrical
    "products/toilet.jpg": pex(1457842, 1000),
    "products/mixer-tap.jpg": pex(6585759, 1000),
    "products/pvc-pipe.jpg": pex(1216589, 1000),                 # industrial / pipes area
    "products/double-sink.jpg": pex(1457842, 1000),
    "products/wheelbarrow.jpg": pex(159306, 1000),               # construction site
    "products/angle-grinder.jpg": pex(1249611, 1000),            # power tools
    "products/cordless-drill.jpg": pex(162553, 1000),            # drill
    "products/claw-hammer.jpg": pex(209235, 1000),
    "products/builders-sand.jpg": pex(1687845, 1000),            # sand
    "products/river-sand.jpg": pex(1001682, 1000),
    "products/stone-19mm.jpg": pex(2219024, 1000),
    "products/concrete-block.jpg": pex(207142, 1000),            # brick/block
    "products/clay-brick.jpg": pex(207142, 1000),
    "products/security-door.jpg": pex(277559, 1000),
    "products/hardwood-door.jpg": pex(277559, 1000),
    "products/fasteners.jpg": pex(162553, 1000),

    # CATEGORIES (wider yard scenes)
    "categories/cement.jpg": pex(2219024, 1400),
    "categories/timber.jpg": pex(5691659, 1400),
    "categories/roofing.jpg": pex(259588, 1400),
    "categories/bricks.jpg": pex(207142, 1400),
    "categories/plumbing.jpg": pex(1216589, 1400),
    "categories/electrical.jpg": pex(257736, 1400),
    "categories/paint.jpg": pex(5691630, 1400),
    "categories/tools.jpg": pex(1249611, 1400),
    "categories/doors.jpg": pex(277559, 1400),
    "categories/sand.jpg": pex(1687845, 1400),
    "categories/fasteners.jpg": pex(209235, 1400),

    # HERO / SERVICES
    "hero/materials.jpg": pex(2219024, 1800),
    "hero/timber.jpg": pex(5691659, 1800),
    "hero/delivery.jpg": pex(6169668, 1800),
    "services/house-build.jpg": pex(1115804, 1400),
    "services/timber-cut.jpg": pex(1094767, 1400),
    "services/delivery.jpg": pex(6169668, 1400),
    "services/trade.jpg": pex(1216589, 1400),
}

ok = 0
for rel, url in downloads.items():
    if save(rel, url):
        ok += 1

# Prefer authentic SNG yard for main hero
shutil.copy2(root / "brand" / "yard.png", root / "hero" / "yard.png")
shutil.copy2(root / "brand" / "yard.png", root / "hero" / "materials-sng.png")
# Prefer SNG truck flyer for delivery visual (real SNG brand photography on flyer)
shutil.copy2(root / "brand" / "truck-flyer.png", root / "services" / "sng-delivery.png")
shutil.copy2(root / "categories" / "wire-mesh.png", root / "categories" / "wire-mesh.jpg")

print("downloaded", ok)
