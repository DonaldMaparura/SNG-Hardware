from pathlib import Path
from urllib.request import Request, urlopen

out = Path(__file__).resolve().parents[1] / "public" / "img"
out.mkdir(parents=True, exist_ok=True)

# Royalty-free photos (Pexels). Downloaded locally so the demo never hotlinks.
PHOTOS = {
    "hero.jpg": "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1800",
    "hero-timber.jpg": "https://images.pexels.com/photos/5691622/pexels-photo-5691622.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "hero-delivery.jpg": "https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=1600",
    "cement.jpg": "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=900",
    "timber.jpg": "https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=900",
    "roof.jpg": "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=900",
    "brick.jpg": "https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg?auto=compress&cs=tinysrgb&w=900",
    "pipe.jpg": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=900",
    "cable.jpg": "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=900",
    "paint.jpg": "https://images.pexels.com/photos/5691630/pexels-photo-5691630.jpeg?auto=compress&cs=tinysrgb&w=900",
    "door.jpg": "https://images.pexels.com/photos/277559/pexels-photo-277559.jpeg?auto=compress&cs=tinysrgb&w=900",
    "tools.jpg": "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=900",
    "sand.jpg": "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=900",
    "geyser.jpg": "https://images.pexels.com/photos/6585755/pexels-photo-6585755.jpeg?auto=compress&cs=tinysrgb&w=900",
    "cutting.jpg": "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "house.jpg": "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "delivery.jpg": "https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "trade.jpg": "https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "cement2.jpg": "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=900",
    "wheelbarrow.jpg": "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=900",
    "foundation.jpg": "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=800",
    "brickwork.jpg": "https://images.pexels.com/photos/207142/pexels-photo-207142.jpeg?auto=compress&cs=tinysrgb&w=800",
    "finishing.jpg": "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800",
}

# Better-matched Wikimedia Commons (bundled, no hotlink)
WIKI = {
    "cement.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Portland_cement.jpg/800px-Portland_cement.jpg",
    "timber.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Lumber.jpg/1280px-Lumber.jpg",
    "roof.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Metal_roof.jpg/1280px-Metal_roof.jpg",
    "brick.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Brickwork.jpg/1280px-Brickwork.jpg",
    "pipe.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/PVC_pipes.jpg/800px-PVC_pipes.jpg",
    "sand.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Sand.jpg/1280px-Sand.jpg",
    "paint.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Paint_cans.jpg/800px-Paint_cans.jpg",
    "door.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Wooden_door.jpg/800px-Wooden_door.jpg",
    "tools.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Power_tools.jpg/1280px-Power_tools.jpg",
    "cable.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Electrical_wires.jpg/1280px-Electrical_wires.jpg",
}

UA = "SNG-ONE-Demo/1.0 (local merchandising assets)"


from typing import Optional

def fetch(url: str) -> Optional[bytes]:
    try:
        req = Request(url, headers={"User-Agent": UA, "Accept": "image/*,*/*"})
        with urlopen(req, timeout=25) as r:
            data = r.read()
            if len(data) < 4000:
                return None
            return data
    except Exception as e:
        print("fail", url, e)
        return None


ok = 0
for name, url in PHOTOS.items():
    data = fetch(url)
    if data is None and name in WIKI:
        data = fetch(WIKI[name])
    if data is None:
        print("SKIP", name)
        continue
    (out / name).write_bytes(data)
    print("ok", name, len(data))
    ok += 1
print("downloaded", ok)
