from pathlib import Path
from urllib.request import Request, urlopen
import shutil

root = Path(__file__).resolve().parents[1] / "public" / "img"
for sub in ("products", "categories", "hero", "services"):
    (root / sub).mkdir(parents=True, exist_ok=True)

UA = "SNG-Hardware-Demo/1.0 (local merchandising)"

def fetch(url: str):
    try:
        req = Request(url, headers={"User-Agent": UA, "Accept": "image/*,*/*"})
        with urlopen(req, timeout=30) as r:
            data = r.read()
            return data if len(data) > 8000 else None
    except Exception as e:
        print("fail", url, e)
        return None

def save(name: Path, url: str):
    data = fetch(url)
    if not data:
        print("SKIP", name)
        return False
    name.write_bytes(data)
    print("ok", name.name, len(data))
    return True

# Reuse best existing local photos into organised folders
copies = {
    "categories/cement.jpg": "cement.jpg",
    "categories/timber.jpg": "timber.jpg",
    "categories/roofing.jpg": "roof.jpg",
    "categories/bricks.jpg": "brick.jpg",
    "categories/plumbing.jpg": "pipe.jpg",
    "categories/electrical.jpg": "cable.jpg",
    "categories/paint.jpg": "paint.jpg",
    "categories/doors.jpg": "door.jpg",
    "categories/tools.jpg": "tools.jpg",
    "categories/sand.jpg": "sand.jpg",
    "hero/timber.jpg": "hero-timber.jpg",
    "hero/delivery.jpg": "hero-delivery.jpg",
    "services/cutting.jpg": "cutting.jpg",
    "services/delivery.jpg": "delivery.jpg",
    "services/house.jpg": "house.jpg",
    "services/trade.jpg": "trade.jpg",
    "products/cem-ppc-50.jpg": "cement.jpg",
    "products/cem-laf-50.jpg": "cement2.jpg",
    "products/timber-stack.jpg": "timber.jpg",
    "products/timber-long.jpg": "hero-timber.jpg",
    "products/ibr-sheet.jpg": "roof.jpg",
    "products/paint-20l.jpg": "paint.jpg",
    "products/geyser-150.jpg": "geyser.jpg",
    "products/cable.jpg": "cable.jpg",
    "products/toilet.jpg": "toilet.jpg",
    "products/tap.jpg": "tap.jpg",
    "products/pvc-pipe.jpg": "pipe.jpg",
    "products/wheelbarrow.jpg": "wheelbarrow.jpg",
    "products/tools.jpg": "tools.jpg",
    "products/builders-sand.jpg": "sand.jpg",
    "products/river-sand.jpg": "sand.jpg",
    "products/stone.jpg": "sand.jpg",
    "products/blocks.jpg": "brick.jpg",
    "products/bricks.jpg": "brickwork.jpg",
    "products/door.jpg": "door.jpg",
    "products/security-door.jpg": "door.jpg",
}

for dest, src in copies.items():
    s = root / src
    d = root / dest
    if s.exists():
        shutil.copy2(s, d)
        print("copy", dest)
    else:
        print("missing source", src)

# Real SNG yard photo as hero
brand = root / "brand-hero.png"
if brand.exists():
    shutil.copy2(brand, root / "hero" / "yard.jpg")
    # also keep png extension friendly — copy as jpg name may be wrong mime; use png path in merch if needed
    shutil.copy2(brand, root / "hero" / "yard.png")
    print("copy hero yard from brand")

# Wire mesh from uploaded stock photo
wire = Path(r"C:\Users\admin\IdeaProjects\SNG Hardware\backend\src\main\resources\images\image copy 3.png")
if wire.exists():
    shutil.copy2(wire, root / "categories" / "mesh.png")
    print("copy mesh")

# Better distinct product photos (Pexels) — overwrite key SKUs where possible
downloads = {
    "products/cem-ppc-50.jpg": "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/cem-laf-50.jpg": "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/timber-stack.jpg": "https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/timber-long.jpg": "https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/ibr-sheet.jpg": "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/paint-20l.jpg": "https://images.pexels.com/photos/5691630/pexels-photo-5691630.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/geyser-150.jpg": "https://images.pexels.com/photos/6585755/pexels-photo-6585755.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/cable.jpg": "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/toilet.jpg": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/tap.jpg": "https://images.pexels.com/photos/6585759/pexels-photo-6585759.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/pvc-pipe.jpg": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/wheelbarrow.jpg": "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/grinder.jpg": "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/drill.jpg": "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/builders-sand.jpg": "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/river-sand.jpg": "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/stone.jpg": "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/blocks.jpg": "https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/bricks.jpg": "https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/door.jpg": "https://images.pexels.com/photos/277559/pexels-photo-277559.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/security-door.jpg": "https://images.pexels.com/photos/277559/pexels-photo-277559.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "products/sink.jpg": "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "categories/cement.jpg": "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "categories/timber.jpg": "https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "hero/timber.jpg": "https://images.pexels.com/photos/1094767/pexels-photo-1094767.jpeg?auto=compress&cs=tinysrgb&w=1800",
    "hero/delivery.jpg": "https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=1800",
}

for rel, url in downloads.items():
    save(root / rel, url)

print("done")
