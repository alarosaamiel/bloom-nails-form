"""Optimiza las fotos y videos que sube la administradora y actualiza el contenido.

- Fotos (jpg, png, heic...) en assets/subidas/fotos -> WebP de máximo 1400 px, calidad 80.
- Videos en assets/subidas/videos -> MP4 H.264 de 720 px en el lado corto, sin pasar de ~5 MB.
- Reels sin portada -> se crea una portada desde el segundo 1 del video.
- Galería: completa ancho y alto de cada foto (ayuda a que la página no "salte" al cargar).
"""
import json
import os
import subprocess
from pathlib import Path

from PIL import Image, ImageOps

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except Exception:
    pass

RAIZ = Path(__file__).resolve().parents[2]
FOTOS = RAIZ / "assets/subidas/fotos"
VIDEOS = RAIZ / "assets/subidas/videos"
CONTENIDO = RAIZ / "content"
EXT_FOTO = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".avif", ".gif"}
EXT_VIDEO = {".mp4", ".mov", ".m4v", ".webm", ".3gp"}
cambios = {}  # ruta pública vieja -> ruta pública nueva


def publica(p: Path) -> str:
    return "/" + p.relative_to(RAIZ).as_posix()


def optimizar_foto(p: Path):
    if p.suffix.lower() == ".webp" and p.stat().st_size < 300_000:
        return
    try:
        im = Image.open(p)
        im = ImageOps.exif_transpose(im).convert("RGB")
    except Exception as e:
        print("No se pudo abrir", p, e)
        return
    im.thumbnail((1400, 1400))
    destino = p.with_suffix(".webp")
    if destino != p and destino.exists():
        destino = p.with_name(p.stem + "-web.webp")
    im.save(destino, "WEBP", quality=80, method=6)
    if destino != p:
        cambios[publica(p)] = publica(destino)
        p.unlink()
    print("Foto optimizada:", destino.name)


def optimizar_video(p: Path):
    if p.stem.endswith("-web") and p.suffix.lower() == ".mp4":
        return
    destino = p.with_name(p.stem + "-web.mp4")
    escala = "scale='if(gt(iw,ih),-2,min(720,iw))':'if(gt(iw,ih),min(720,ih),-2)'"
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(p), "-vf", escala + ",fps=30",
           "-c:v", "libx264", "-profile:v", "high", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p",
           "-maxrate", "1500k", "-bufsize", "3000k", "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(destino)]
    if subprocess.run(cmd).returncode != 0:
        print("No se pudo convertir", p)
        return
    cambios[publica(p)] = publica(destino)
    p.unlink()
    print("Video optimizado:", destino.name, round(destino.stat().st_size / 1e6, 1), "MB")


def crear_portada(video_publico: str) -> str:
    v = RAIZ / video_publico.lstrip("/")
    if not v.exists():
        return ""
    FOTOS.mkdir(parents=True, exist_ok=True)
    jpg = FOTOS / (v.stem.replace("-web", "") + "-portada.jpg")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", "1", "-i", str(v), "-frames:v", "1", str(jpg)])
    if not jpg.exists():
        return ""
    im = Image.open(jpg).convert("RGB")
    im.thumbnail((720, 1280))
    webp = jpg.with_suffix(".webp")
    im.save(webp, "WEBP", quality=75)
    jpg.unlink()
    return publica(webp)


for carpeta, ext, funcion in ((FOTOS, EXT_FOTO, optimizar_foto), (VIDEOS, EXT_VIDEO, optimizar_video)):
    if carpeta.exists():
        for archivo in sorted(carpeta.iterdir()):
            if archivo.is_file() and archivo.suffix.lower() in ext:
                funcion(archivo)


def reemplazar(valor):
    if isinstance(valor, str):
        return cambios.get(valor, valor)
    if isinstance(valor, list):
        return [reemplazar(v) for v in valor]
    if isinstance(valor, dict):
        return {k: reemplazar(v) for k, v in valor.items()}
    return valor


for archivo in CONTENIDO.glob("*.json"):
    datos = json.loads(archivo.read_text(encoding="utf-8"))
    nuevo = reemplazar(datos)
    if archivo.name == "reels.json":
        for r in nuevo.get("reels", []):
            if r.get("video") and not r.get("portada"):
                r["portada"] = crear_portada(r["video"])
            r.setdefault("visible", True)
    if archivo.name == "galeria.json":
        for f in nuevo.get("fotos", []):
            f.setdefault("visible", True)
            ruta = RAIZ / str(f.get("imagen", "")).lstrip("/")
            if ruta.is_file() and not f.get("ancho"):
                try:
                    with Image.open(ruta) as im:
                        f["ancho"], f["alto"] = im.size
                except Exception:
                    pass
    if nuevo != datos:
        archivo.write_text(json.dumps(nuevo, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Contenido actualizado:", archivo.name)
