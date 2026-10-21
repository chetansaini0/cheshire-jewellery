from PIL import Image
import os

src = r"C:\Users\cheta\.cursor\projects\c-Users-cheta-OneDrive-Desktop-chetan-personal-work\assets\c__Users_cheta_AppData_Roaming_Cursor_User_workspaceStorage_3aa821a701f5341c48159c7f49641e06_images_ChatGPT_Image_Sep_7__2026__05_20_20_PM-a9195a36-5932-46fa-834c-bcf622f9f835.png"
web = r"c:\Users\cheta\OneDrive\Desktop\chetan personal work\cheshire\apps\web"

img = Image.open(src).convert("RGBA")
pixels = img.load()
w, h = img.size

for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        lum = (r + g + b) / 3
        if lum < 22:
            pixels[x, y] = (r, g, b, 0)
        elif lum < 48 and r < 55 and g < 50 and b < 45:
            fade = int(max(0, min(255, (lum - 22) * 10)))
            pixels[x, y] = (r, g, b, fade)

bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

brand_dir = os.path.join(web, "public", "brand")
os.makedirs(brand_dir, exist_ok=True)
logo_path = os.path.join(brand_dir, "cheshire-logo.png")
img.save(logo_path, "PNG")
print("logo", img.size, logo_path)

fw, fh = img.size
emblem_h = max(1, int(fh * 0.38))
emblem = img.crop((0, 0, fw, emblem_h))
ew, eh = emblem.size
side = min(ew, eh)
left = (ew - side) // 2
top = (eh - side) // 2
emblem = emblem.crop((left, top, left + side, top + side))
pad = int(side * 0.08)
padded = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
padded.paste(emblem, (pad, pad), emblem)

icon512 = padded.resize((512, 512), Image.Resampling.LANCZOS)
icon512.save(os.path.join(brand_dir, "cheshire-mark.png"), "PNG")
icon512.save(os.path.join(web, "src", "app", "icon.png"), "PNG")
icon180 = padded.resize((180, 180), Image.Resampling.LANCZOS)
icon180.save(os.path.join(web, "src", "app", "apple-icon.png"), "PNG")

og = Image.new("RGBA", (1200, 630), (247, 245, 240, 255))
max_w, max_h = 780, 420
scale = min(max_w / img.width, max_h / img.height)
nw, nh = int(img.width * scale), int(img.height * scale)
logo_og = img.resize((nw, nh), Image.Resampling.LANCZOS)
og.paste(logo_og, ((1200 - nw) // 2, (630 - nh) // 2), logo_og)
og.convert("RGB").save(os.path.join(web, "public", "og-image.jpg"), "JPEG", quality=92)
print("icons ok")
