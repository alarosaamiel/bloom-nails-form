"""Lee la calificación y el número de reseñas del Perfil de Negocio en Google
(Places API) y actualiza la web: content/ajustes.json, index.html y llms.txt."""
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CLAVE = os.environ.get("GOOGLE_PLACES_API_KEY", "").strip()
PLACE_ID = os.environ.get("GOOGLE_PLACE_ID", "").strip()
BUSQUEDA = "Bloom Nails Spa, C. Grimaldo del Solar 236, Miraflores, Lima"

if not CLAVE:
    print("Falta el secreto GOOGLE_PLACES_API_KEY. No se actualiza nada.")
    sys.exit(0)


def pedir(url, cuerpo=None, campos=""):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(url, data=datos, method="POST" if datos else "GET")
    req.add_header("X-Goog-Api-Key", CLAVE)
    req.add_header("X-Goog-FieldMask", campos)
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


if PLACE_ID:
    lugar = pedir(f"https://places.googleapis.com/v1/places/{PLACE_ID}", campos="id,displayName,rating,userRatingCount")
else:
    res = pedir("https://places.googleapis.com/v1/places:searchText", {"textQuery": BUSQUEDA, "languageCode": "es"},
                campos="places.id,places.displayName,places.rating,places.userRatingCount")
    lugares = [p for p in res.get("places", []) if "bloom" in p.get("displayName", {}).get("text", "").lower()]
    if not lugares:
        print("No se encontró Bloom Nails Spa en Google. Agrega el secreto GOOGLE_PLACE_ID.")
        sys.exit(1)
    lugar = lugares[0]
    print("Place ID encontrado (guárdalo como secreto GOOGLE_PLACE_ID):", lugar.get("id"))

nota = lugar.get("rating")
total = lugar.get("userRatingCount")
if not nota or not total:
    print("Google no devolvió calificación o reseñas:", lugar)
    sys.exit(1)
nota = round(float(nota), 1)
total = int(total)
print(f"Google: {nota} estrellas, {total} reseñas")

# 1) content/ajustes.json (lo lee la web y el panel)
aj_ruta = RAIZ / "content/ajustes.json"
aj = json.loads(aj_ruta.read_text(encoding="utf-8"))
aj["calificacion_google"] = nota
aj["resenas_google"] = total
aj_ruta.write_text(json.dumps(aj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# 2) index.html: texto visible y datos estructurados para Google
html_ruta = RAIZ / "index.html"
html = html_ruta.read_text(encoding="utf-8")
coma = f"{nota:.1f}".replace(".", ",")
html = re.sub(r'(<strong id="g-nota">)[^<]*(</strong>)', rf"\g<1>{coma}\g<2>", html)
html = re.sub(r'(<span id="g-total">)[^<]*(</span>)', rf"\g<1>{total}\g<2>", html)
html = re.sub(r'("ratingValue":\s*")[^"]*(")', rf"\g<1>{nota}\g<2>", html)
html = re.sub(r'("reviewCount":\s*")[^"]*(")', rf"\g<1>{total}\g<2>", html)
html_ruta.write_text(html, encoding="utf-8")

# 3) llms.txt (lo que leen los buscadores con IA)
llms_ruta = RAIZ / "llms.txt"
if llms_ruta.exists():
    t = llms_ruta.read_text(encoding="utf-8")
    t = re.sub(r"Calificación de [0-9],[0-9] en Google \([0-9]+ reseñas\)", f"Calificación de {coma} en Google ({total} reseñas)", t)
    llms_ruta.write_text(t, encoding="utf-8")
