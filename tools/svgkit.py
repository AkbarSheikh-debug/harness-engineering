"""Tiny SVG drawing kit used by build_diagrams.py.

Standard library only. Every diagram is a self-contained "card" with its own
background, so it reads the same on GitHub (light or dark) and on the site.
"""
from html import escape

FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"

INK = "#1c2333"
MUTED = "#5b6577"
LINE = "#b9b2a3"
PAPER = "#fbfaf6"
EDGE = "#e6e0d3"

# name: (fill, stroke, text)
TONES = {
    "teal": ("#e1f3f0", "#0f766e", "#0b4f4a"),
    "amber": ("#fdf0d5", "#b45309", "#7c3a06"),
    "rose": ("#fde4e8", "#be123c", "#881337"),
    "indigo": ("#e6e8fd", "#4338ca", "#312e81"),
    "slate": ("#eef0f4", "#64748b", "#334155"),
    "green": ("#e2f5e6", "#15803d", "#14532d"),
    "ink": ("#1c2333", "#1c2333", "#ffffff"),
    "white": ("#ffffff", "#c9c2b4", "#1c2333"),
}


class Diagram:
    def __init__(self, width, height, title=None, subtitle=None):
        self.w, self.h = width, height
        self.items = []
        self.markers = {}
        self.title, self.subtitle = title, subtitle

    # ---- primitives -----------------------------------------------------
    def raw(self, s):
        self.items.append(s)

    def rect(self, x, y, w, h, fill="#fff", stroke=LINE, r=10, sw=1.5, dash=None, opacity=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        o = f' opacity="{opacity}"' if opacity is not None else ""
        self.raw(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}"{d}{o}/>'
        )

    def line(self, x1, y1, x2, y2, color=LINE, sw=1.5, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.raw(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round"{d}/>'
        )

    def text(self, x, y, s, size=14, weight=400, fill=INK, anchor="middle", mono=False, lh=None, italic=False):
        """Draw one string or a list of lines. y is the first baseline."""
        lines = s if isinstance(s, (list, tuple)) else [s]
        lh = lh or round(size * 1.38)
        fam = MONO if mono else FONT
        it = ' font-style="italic"' if italic else ""
        for i, ln in enumerate(lines):
            self.raw(
                f'<text x="{x}" y="{y + i * lh}" font-family="{fam}" font-size="{size}" '
                f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{it} '
                f'xml:space="preserve">{escape(str(ln))}</text>'
            )

    def _marker(self, color):
        if color not in self.markers:
            self.markers[color] = f"arr{len(self.markers)}"
        return self.markers[color]

    def arrow(self, x1, y1, x2, y2, color=INK, sw=2, dash=None, label=None, lpos=0.5, ldx=0, ldy=-8,
              lsize=12.5, lfill=None, lanchor="middle"):
        m = self._marker(color)
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.raw(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" marker-end="url(#{m})"{d}/>'
        )
        if label:
            lx = x1 + (x2 - x1) * lpos + ldx
            ly = y1 + (y2 - y1) * lpos + ldy
            self.text(lx, ly, label, size=lsize, fill=lfill or color, weight=600, anchor=lanchor)

    def path(self, d, color=INK, sw=2, dash=None, arrow=True, fill="none"):
        m = f' marker-end="url(#{self._marker(color)})"' if arrow else ""
        ds = f' stroke-dasharray="{dash}"' if dash else ""
        self.raw(
            f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{sw}" '
            f'stroke-linecap="round" stroke-linejoin="round"{m}{ds}/>'
        )

    # ---- composites -----------------------------------------------------
    def box(self, x, y, w, h, label, sub=None, tone="teal", size=15, r=12, subsize=12.5, mono=False):
        fill, stroke, tx = TONES[tone]
        self.rect(x, y, w, h, fill=fill, stroke=stroke, r=r)
        subs = [] if sub is None else (sub if isinstance(sub, (list, tuple)) else [sub])
        labels = label if isinstance(label, (list, tuple)) else [label]
        lh, slh = round(size * 1.3), round(subsize * 1.4)
        total = len(labels) * lh + len(subs) * slh
        top = y + (h - total) / 2 + size * 0.95
        self.text(x + w / 2, top, labels, size=size, weight=700, fill=tx, lh=lh, mono=mono)
        if subs:
            sub_fill = tx if tone == "ink" else MUTED
            self.text(x + w / 2, top + len(labels) * lh + 1, subs, size=subsize, fill=sub_fill, lh=slh)

    def pill(self, x, y, label, tone="slate", size=11.5, pad=9, mono=False, w=None):
        fill, stroke, tx = TONES[tone]
        cw = size * (0.62 if mono else 0.56)
        w = w or round(len(label) * cw + pad * 2)
        h = round(size + 9)
        self.rect(x, y, w, h, fill=fill, stroke=stroke, r=h / 2, sw=1.2)
        self.text(x + w / 2, y + h / 2 + size * 0.36, label, size=size, weight=700, fill=tx, mono=mono)
        return w

    def note(self, x, y, s, size=12.5, fill=MUTED, anchor="start", italic=False, weight=400):
        self.text(x, y, s, size=size, fill=fill, anchor=anchor, italic=italic, weight=weight)

    # ---- output ---------------------------------------------------------
    def render(self):
        defs = "".join(
            f'<marker id="{mid}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" '
            f'orient="auto-start-reverse"><path d="M0,0.8 L9,5 L0,9.2 z" fill="{c}"/></marker>'
            for c, mid in self.markers.items()
        )
        head = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" '
            f'width="{self.w}" height="{self.h}" role="img">'
        )
        if self.title:
            head += f"<title>{escape(self.title)}</title>"
        bg = (
            f'<rect x="1" y="1" width="{self.w - 2}" height="{self.h - 2}" rx="18" fill="{PAPER}" '
            f'stroke="{EDGE}" stroke-width="2"/>'
        )
        hdr = ""
        if self.title:
            hdr += (
                f'<text x="32" y="44" font-family="{FONT}" font-size="21" font-weight="800" '
                f'fill="{INK}">{escape(self.title)}</text>'
            )
        if self.subtitle:
            hdr += (
                f'<text x="32" y="67" font-family="{FONT}" font-size="13.5" fill="{MUTED}">'
                f"{escape(self.subtitle)}</text>"
            )
        return head + f"<defs>{defs}</defs>" + bg + hdr + "".join(self.items) + "</svg>\n"

    def save(self, path):
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(self.render())
