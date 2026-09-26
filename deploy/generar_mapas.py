#!/usr/bin/env python3
"""
Convierte los GeoJSON de Natural Earth (dominio público) en módulos JS con paths
SVG ya proyectados y simplificados. Se ejecuta una sola vez, en el servidor:
la app no procesa geometría en ejecución.

Solo hace falta volver a ejecutarlo si se quiere cambiar el encuadre, el detalle
o añadir mapas. Descargar antes los datos en el mismo directorio:

  curl -o mundo.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
  curl -o rios.geojson  https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_rivers_lake_centerlines.geojson
  # provincias: descargar ne_10m_admin_1_states_provinces.geojson (40 MB) y filtrar
  # las features con properties.admin == "Spain" en espana.geojson

Escribe directamente en games/geografia/datos/.
"""
import json, math, pathlib, unicodedata

SALIDA = pathlib.Path(__file__).resolve().parent.parent / "games/geografia/datos"
SALIDA.mkdir(parents=True, exist_ok=True)

# --------------------------------------------------------------- proyecciones

def equirect(lon, lat, vista):
    x0, x1, y0, y1, w, h = vista
    x = (lon - x0) / (x1 - x0) * w
    y = (y0 - lat) / (y0 - y1) * h
    return x, y


def mercator(lon, lat, vista):
    x0, x1, y0, y1, w, h = vista
    def my(l):
        l = max(-85, min(85, l))
        return math.log(math.tan(math.pi / 4 + math.radians(l) / 2))
    x = (lon - x0) / (x1 - x0) * w
    y = (my(y0) - my(lat)) / (my(y0) - my(y1)) * h
    return x, y


# ------------------------------------------------------------ simplificación

def perpendicular(p, a, b):
    (px, py), (ax, ay), (bx, by) = p, a, b
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return math.hypot(px - ax, py - ay)
    t = max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - (ax + t * dx), py - (ay + t * dy))


def douglas_peucker(puntos, tol):
    if len(puntos) < 3:
        return puntos
    dmax, idx = 0, 0
    for i in range(1, len(puntos) - 1):
        d = perpendicular(puntos[i], puntos[0], puntos[-1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > tol:
        izq = douglas_peucker(puntos[: idx + 1], tol)
        der = douglas_peucker(puntos[idx:], tol)
        return izq[:-1] + der
    return [puntos[0], puntos[-1]]


# ------------------------------------------------------------------- paths

def anillos(geom):
    """Devuelve la lista de anillos (listas de coordenadas lon/lat)."""
    t, c = geom["type"], geom["coordinates"]
    if t == "Polygon":
        return c
    if t == "MultiPolygon":
        return [anillo for poligono in c for anillo in poligono]
    if t == "LineString":
        return [c]
    if t == "MultiLineString":
        return c
    return []


def area_aprox(puntos):
    """Área en unidades del viewBox (para descartar islas irrelevantes)."""
    a = 0
    for i in range(len(puntos)):
        x1, y1 = puntos[i]
        x2, y2 = puntos[(i + 1) % len(puntos)]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2


def a_path(geom, proyeccion, vista, tol, area_min=0.0, cerrado=True):
    trozos = []
    for anillo in anillos(geom):
        pts = [proyeccion(lon, lat, vista) for lon, lat, *_ in anillo]
        pts = douglas_peucker(pts, tol)
        if len(pts) < (3 if cerrado else 2):
            continue
        if cerrado and area_aprox(pts) < area_min:
            continue
        d = "M" + " ".join(f"{x:.1f} {y:.1f}" for x, y in pts)
        trozos.append(d + ("Z" if cerrado else ""))
    return "".join(trozos)


def centro(geom, proyeccion, vista):
    """Centro del anillo más grande: sirve para colocar etiquetas y pistas."""
    mejor, mejor_area = None, -1
    for anillo in anillos(geom):
        pts = [proyeccion(lon, lat, vista) for lon, lat, *_ in anillo]
        if len(pts) < 3:
            continue
        a = area_aprox(pts)
        if a > mejor_area:
            mejor_area, mejor = a, pts
    if not mejor:
        return None
    return (
        round(sum(p[0] for p in mejor) / len(mejor), 1),
        round(sum(p[1] for p in mejor) / len(mejor), 1),
        round(mejor_area, 1),
    )


def js(valor):
    return json.dumps(valor, ensure_ascii=False)


def sin_tildes(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if unicodedata.category(c) != "Mn")


CONTINENTES_ES = {
    "Africa": "África",
    "Asia": "Asia",
    "Europe": "Europa",
    "North America": "América del Norte",
    "South America": "América del Sur",
    "Oceania": "Oceanía",
    "Antarctica": "Antártida",
}

# ============================================================ MAPA DEL MUNDO

mundo_geo = json.load(open("mundo.geojson"))
VISTA_MUNDO = (-180, 180, 84, -90, 1000, 484)

paises = []
for f in mundo_geo["features"]:
    p = f["properties"]
    cont = CONTINENTES_ES.get(p.get("CONTINENT"))
    if not cont:
        continue  # "Seven seas (open ocean)"
    nombre = p.get("NAME_ES") or p.get("NAME")
    d = a_path(f["geometry"], equirect, VISTA_MUNDO, 0.45, area_min=1.2)
    if not d:
        continue
    c = centro(f["geometry"], equirect, VISTA_MUNDO)
    paises.append({
        "id": p.get("ISO_A3") if p.get("ISO_A3") not in (None, "-99") else sin_tildes(nombre)[:3].upper(),
        "n": nombre,
        "c": cont,
        "pob": int(p.get("POP_EST") or 0),
        "x": c[0], "y": c[1], "a": c[2],
        "d": d,
    })

paises.sort(key=lambda q: -q["a"])

# --------------------------------------------------------------------- ríos

RIOS_CLAVE = {
    "Amazonas": "América del Sur", "Paraná": "América del Sur", "Orinoco": "América del Sur",
    "Mississippi": "América del Norte", "Missouri": "América del Norte", "Colorado": "América del Norte",
    "Rio Grande": "América del Norte", "Mackenzie": "América del Norte", "Yukon": "América del Norte",
    "St. Lawrence": "América del Norte",
    "Nile": "África", "Congo": "África", "Niger": "África", "Zambezi": "África", "Orange": "África",
    "Yangtze": "Asia", "Huang He": "Asia", "Mekong": "Asia", "Ganges": "Asia", "Indus": "Asia",
    "Ob": "Asia", "Yenisey": "Asia", "Lena": "Asia", "Amur": "Asia", "Brahmaputra": "Asia",
    "Danube": "Europa", "Volga": "Europa", "Rhine": "Europa", "Loire": "Europa", "Elbe": "Europa",
    "Douro": "Europa", "Tagus": "Europa", "Ebro": "Europa", "Guadalquivir": "Europa", "Seine": "Europa",
    "Murray": "Oceanía", "Darling": "Oceanía",
}
NOMBRE_RIO_ES = {
    "Nile": "Nilo", "Congo": "Congo", "Niger": "Níger", "Zambezi": "Zambeze", "Orange": "Orange",
    "Yangtze": "Yangtsé", "Huang He": "Huang He (río Amarillo)", "Mekong": "Mekong",
    "Ganges": "Ganges", "Indus": "Indo", "Ob": "Obi", "Yenisey": "Yeniséi", "Lena": "Lena",
    "Amur": "Amur", "Brahmaputra": "Brahmaputra", "Danube": "Danubio", "Volga": "Volga",
    "Rhine": "Rin", "Loire": "Loira", "Elbe": "Elba", "Douro": "Duero", "Tagus": "Tajo",
    "Ebro": "Ebro", "Guadalquivir": "Guadalquivir", "Seine": "Sena", "Murray": "Murray",
    "Darling": "Darling", "Mississippi": "Misisipi", "Missouri": "Misuri", "Colorado": "Colorado",
    "Rio Grande": "Río Bravo", "Mackenzie": "Mackenzie", "Yukon": "Yukón",
    "St. Lawrence": "San Lorenzo", "Amazonas": "Amazonas", "Paraná": "Paraná", "Orinoco": "Orinoco",
}

rios_geo = json.load(open("rios.geojson"))
rios = {}
for f in rios_geo["features"]:
    nombre = (f["properties"].get("name") or "").strip()
    if nombre not in RIOS_CLAVE:
        continue
    d = a_path(f["geometry"], equirect, VISTA_MUNDO, 0.5, cerrado=False)
    if not d:
        continue
    clave = NOMBRE_RIO_ES[nombre]
    if clave in rios:
        rios[clave]["d"] += d
    else:
        rios[clave] = {"n": clave, "c": RIOS_CLAVE[nombre], "d": d}

lineas = [
    "/* Generado desde Natural Earth (dominio público). No editar a mano. */",
    f"export const VISTA = {{ w: {VISTA_MUNDO[4]}, h: {VISTA_MUNDO[5]}, "
    f"lon0: {VISTA_MUNDO[0]}, lon1: {VISTA_MUNDO[1]}, lat0: {VISTA_MUNDO[2]}, lat1: {VISTA_MUNDO[3]} }};",
    "export const PAISES = [",
]
for q in paises:
    lineas.append(
        f"  {{ id: {js(q['id'])}, n: {js(q['n'])}, c: {js(q['c'])}, pob: {q['pob']}, "
        f"x: {q['x']}, y: {q['y']}, a: {q['a']}, d: {js(q['d'])} }},"
    )
lineas.append("];")
lineas.append("export const RIOS = [")
for r in sorted(rios.values(), key=lambda x: x["n"]):
    lineas.append(f"  {{ n: {js(r['n'])}, c: {js(r['c'])}, d: {js(r['d'])} }},")
lineas.append("];")
(SALIDA / "mundo.js").write_text("\n".join(lineas) + "\n")

# ================================================================== EUROPA

VISTA_EUROPA = (-25, 45, 72, 34, 700, 620)
NO_EUROPA_VISUAL = {"Greenland", "Groenlandia"}

europa = []
for f in mundo_geo["features"]:
    p = f["properties"]
    nombre = p.get("NAME_ES") or p.get("NAME")
    if p.get("CONTINENT") not in ("Europe", "Asia", "Africa"):
        continue
    d = a_path(f["geometry"], mercator, VISTA_EUROPA, 0.9, area_min=2.0)
    if not d:
        continue
    c = centro(f["geometry"], mercator, VISTA_EUROPA)
    if not c or not (0 <= c[0] <= 700 and 0 <= c[1] <= 620):
        # solo se etiquetan los países cuyo centro cae dentro del encuadre
        es_europeo = False
    else:
        es_europeo = p.get("CONTINENT") == "Europe"
    europa.append({
        "id": p.get("ISO_A3"), "n": nombre, "eu": es_europeo,
        "x": c[0] if c else 0, "y": c[1] if c else 0, "a": c[2] if c else 0, "d": d,
    })

lineas = [
    "/* Generado desde Natural Earth (dominio público). No editar a mano. */",
    f"export const VISTA = {{ w: {VISTA_EUROPA[4]}, h: {VISTA_EUROPA[5]} }};",
    "export const PAISES = [",
]
for q in sorted(europa, key=lambda z: -z["a"]):
    lineas.append(
        f"  {{ id: {js(q['id'])}, n: {js(q['n'])}, eu: {js(q['eu'])}, "
        f"x: {q['x']}, y: {q['y']}, a: {q['a']}, d: {js(q['d'])} }},"
    )
lineas.append("];")
(SALIDA / "europa.js").write_text("\n".join(lineas) + "\n")

# ================================================================== ESPAÑA

VISTA_ESP = (-9.6, 4.6, 44.0, 33.5, 760, 727)
esp_geo = json.load(open("espana.geojson"))

# Canarias va en un recuadro propio, como en los mapas escolares: se proyecta
# normal y luego se escala y traslada en coordenadas de pantalla.
CAJA_CANARIAS = (30, 575, 300, 142)  # x, y, ancho, alto dentro del viewBox

def bbox_canarias(features):
    xs, ys = [], []
    for f in features:
        if (f["properties"].get("region")) != "Canary Is.":
            continue
        for anillo in anillos(f["geometry"]):
            for lon, lat, *_ in anillo:
                x, y = mercator(lon, lat, VISTA_ESP)
                xs.append(x)
                ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)

CCAA_ES = {
    "Canary Is.": "Canarias",
    "Foral de Navarra": "Navarra",
    "Valenciana": "Comunidad Valenciana",
    "Madrid": "Comunidad de Madrid",
    "Murcia": "Región de Murcia",
    "Islas Baleares": "Illes Balears",
    "Asturias": "Principado de Asturias",
}

# Natural Earth trae los nombres castellanizados; aquí se pasan a la
# denominación oficial de cada provincia.
TOPONIMO_OFICIAL = {
    "La Coruña": "A Coruña",
    "Orense": "Ourense",
    "Gerona": "Girona",
    "Lérida": "Lleida",
    "Guipúzcoa": "Gipuzkoa",
    "Vizcaya": "Bizkaia",
    "Islas Baleares": "Illes Balears",
}

cx0, cy0, cx1, cy1 = bbox_canarias(esp_geo["features"])
escala_can = min(CAJA_CANARIAS[2] / (cx1 - cx0), CAJA_CANARIAS[3] / (cy1 - cy0))
off_x = CAJA_CANARIAS[0] + (CAJA_CANARIAS[2] - (cx1 - cx0) * escala_can) / 2
off_y = CAJA_CANARIAS[1] + (CAJA_CANARIAS[3] - (cy1 - cy0) * escala_can) / 2


def proy_canarias(lon, lat, vista):
    x, y = mercator(lon, lat, vista)
    return (x - cx0) * escala_can + off_x, (y - cy0) * escala_can + off_y


provincias = []
for f in esp_geo["features"]:
    p = f["properties"]
    nombre = p.get("name_es") or p.get("name")
    region = p.get("region") or nombre
    ccaa = CCAA_ES.get(region, region)
    nombre = TOPONIMO_OFICIAL.get(nombre, nombre)
    geom = f["geometry"]

    proy = proy_canarias if region == "Canary Is." else mercator

    # las islas necesitan menos tolerancia y un mínimo de área más bajo
    es_isla = region in ("Canary Is.", "Islas Baleares")
    d = a_path(geom, proy, VISTA_ESP, 0.4 if es_isla else 0.7, area_min=0.4 if es_isla else 1.5)
    if not d:
        continue
    c = centro(geom, proy, VISTA_ESP)
    provincias.append({
        "n": nombre, "ccaa": ccaa, "x": c[0], "y": c[1], "a": c[2], "d": d,
    })

lineas = [
    "/* Generado desde Natural Earth (dominio público). No editar a mano. */",
    f"export const VISTA = {{ w: {VISTA_ESP[4]}, h: {VISTA_ESP[5]} }};",
    f"export const CAJA_CANARIAS = {{ x: {CAJA_CANARIAS[0]}, y: {CAJA_CANARIAS[1]}, "
    f"w: {CAJA_CANARIAS[2]}, h: {CAJA_CANARIAS[3]} }};",
    "export const PROVINCIAS = [",
]
for q in sorted(provincias, key=lambda z: z["n"]):
    lineas.append(
        f"  {{ n: {js(q['n'])}, ccaa: {js(q['ccaa'])}, x: {q['x']}, y: {q['y']}, "
        f"a: {q['a']}, d: {js(q['d'])} }},"
    )
lineas.append("];")
(SALIDA / "espana.js").write_text("\n".join(lineas) + "\n")

# ------------------------------------------------------------------ informe
for f in sorted(SALIDA.iterdir()):
    print(f"{f.name}\t{f.stat().st_size // 1024} KB")
print("paises mundo:", len(paises), "| rios:", len(rios), "| europa:", len(europa), "| provincias:", len(provincias))
