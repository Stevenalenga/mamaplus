"""Recreate the MamaPlus Training Centre certificate as an editable PowerPoint file.

The layout follows the printed certificate: cream page, double teal border,
gold corner ornaments, script recipient name, programme title, date, two
signatories, and a gold seal.

Regenerate the certificate in the attached photo:

    python certificates/generate_certificate.py

Regenerate for someone else:

    python certificates/generate_certificate.py --name "Jane Achieng" --date "20th NOVEMBER 2024" --serial 8

A native Microsoft Publisher .pub file can only be written by Publisher.
This machine has PowerPoint, not Publisher, so the script writes .pptx
and, when PowerPoint is available, a print-ready PDF.
"""

from __future__ import annotations

import argparse
import io
import math
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Inches, Pt

PAGE_W = 11.6929133858  # A4 landscape, inches
PAGE_H = 8.2677165354

TEAL = RGBColor(0x0E, 0x6E, 0x6C)
TEAL_SOFT = RGBColor(0x1A, 0x7C, 0x78)
INK = RGBColor(0x2C, 0x28, 0x24)
MUTED = RGBColor(0x5E, 0x56, 0x4C)
CREAM = RGBColor(0xFB, 0xF7, 0xF0)
GOLD = (196, 154, 72, 255)
GOLD_DEEP = (138, 98, 36, 255)
GOLD_LIGHT = (232, 205, 140, 255)
CREAM_RGBA = (251, 247, 240, 255)

FONT_SERIF = "Palatino Linotype"
FONT_SMALL_SCRIPT = "Gabriola"

ROOT = Path(__file__).resolve().parent


def _font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        Path(r"C:\Windows\Fonts") / f"{name}.ttf",
        Path(r"C:\Windows\Fonts") / f"{name}.TTF",
    ]
    lookup = {
        "Palatino Linotype": ["pala.ttf", "palab.ttf"],
        "Palatino Linotype Bold": ["palab.ttf"],
        "Georgia": ["georgia.ttf", "georgiab.ttf"],
        "Georgia Bold": ["georgiab.ttf"],
        "Gabriola": ["Gabriola.ttf", "gabriola.ttf"],
    }
    for filename in lookup.get(name, []):
        candidates.insert(0, Path(r"C:\Windows\Fonts") / filename)
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


LOGO_PATH = ROOT / "assets" / "mamaplus-logo.png"


def _load_logo() -> Image.Image:
    """Crop the supplied lockup and drop its white background."""
    image = Image.open(LOGO_PATH).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    min_x, min_y, max_x, max_y = width, height, 0, 0
    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            if alpha < 16:
                continue
            whiteness = min(red, green, blue)
            if whiteness > 246:
                pixels[x, y] = (red, green, blue, 0)
                continue
            if whiteness > 228:
                fade = (246 - whiteness) / 18
                pixels[x, y] = (red, green, blue, int(alpha * fade))
            if pixels[x, y][3] > 12:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    pad = 2
    return image.crop((max(0, min_x - pad), max(0, min_y - pad), min(width, max_x + pad + 1), min(height, max_y + pad + 1)))


def _corner_ornament(px: int = 900) -> Image.Image:
    """Top-left gold corner. Other corners are rotations of this image."""
    image = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    margin = int(px * 0.10)
    outer = [margin, margin, px - int(px * 0.08), px - int(px * 0.08)]
    inner = [margin + int(px * 0.07), margin + int(px * 0.07), px - int(px * 0.22), px - int(px * 0.22)]
    draw.arc(outer, start=180, end=270, fill=GOLD, width=max(10, px // 55))
    draw.arc(inner, start=180, end=270, fill=GOLD_DEEP, width=max(4, px // 140))

    def bead(cx: int, cy: int, radius: int) -> None:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=GOLD_LIGHT, outline=GOLD_DEEP, width=3)

    # Ends of the outer quarter-circle sit on the left and top edges of the box.
    left_end = (outer[0], (outer[1] + outer[3]) // 2)
    top_end = ((outer[0] + outer[2]) // 2, outer[1])
    bead(*left_end, px // 28)
    bead(*top_end, px // 28)

    # Small curl just inside the corner.
    curl = int(px * 0.16)
    curl_box = [margin + int(px * 0.16), margin + int(px * 0.16), margin + int(px * 0.16) + curl, margin + int(px * 0.16) + curl]
    draw.arc(curl_box, start=0, end=180, fill=GOLD, width=max(6, px // 90))
    diamond = int(px * 0.045)
    cx, cy = margin + int(px * 0.20), margin + int(px * 0.20)
    draw.polygon(
        [(cx, cy - diamond), (cx + diamond, cy), (cx, cy + diamond), (cx - diamond, cy)],
        fill=GOLD_LIGHT,
        outline=GOLD_DEEP,
    )
    return image


def _circle_text(
    base: Image.Image,
    text: str,
    center: tuple[int, int],
    radius: int,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int, int],
    start_deg: float,
    end_deg: float,
) -> None:
    if not text:
        return
    count = len(text)
    for index, char in enumerate(text):
        if count == 1:
            angle = (start_deg + end_deg) / 2
        else:
            angle = start_deg + (end_deg - start_deg) * index / (count - 1)
        radians = math.radians(angle)
        glyph = Image.new("RGBA", (radius, radius), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glyph)
        bbox = gdraw.textbbox((0, 0), char, font=font)
        gw, gh = bbox[2] - bbox[0], bbox[3] - bbox[1]
        gdraw.text((-bbox[0], -bbox[1]), char, font=font, fill=fill)
        glyph = glyph.crop((0, 0, max(gw, 1), max(gh, 1)))
        # Point the top of each letter outward. PIL rotates counter-clockwise.
        rotated = glyph.rotate(angle - 90, expand=True, resample=Image.Resampling.BICUBIC)
        x = center[0] + radius * math.cos(radians) - rotated.width / 2
        y = center[1] - radius * math.sin(radians) - rotated.height / 2
        base.alpha_composite(rotated, (int(x), int(y)))


def _draw_seal(px: int = 1400) -> Image.Image:
    image = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    cx = cy = px // 2
    outer = int(px * 0.40)

    shadow = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.ellipse((cx - outer + 8, cy - outer + 18, cx + outer + 8, cy + outer + 22), fill=(80, 60, 20, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    image.alpha_composite(shadow)

    # Ribbon tails are painted first so the disc covers their tops.
    ribbon_top = cy + int(outer * 0.55)
    ribbon_bottom = cy + int(outer * 1.18)
    tail = int(px * 0.06)
    draw.polygon(
        [
            (cx - int(px * 0.10), ribbon_top),
            (cx - int(px * 0.02), ribbon_top),
            (cx - int(px * 0.02), ribbon_bottom - tail),
            (cx - int(px * 0.06), ribbon_bottom),
            (cx - int(px * 0.10), ribbon_bottom - tail),
        ],
        fill=GOLD_DEEP,
    )
    draw.polygon(
        [
            (cx + int(px * 0.02), ribbon_top),
            (cx + int(px * 0.10), ribbon_top),
            (cx + int(px * 0.10), ribbon_bottom - tail),
            (cx + int(px * 0.06), ribbon_bottom),
            (cx + int(px * 0.02), ribbon_bottom - tail),
        ],
        fill=(168, 122, 48, 255),
    )

    rings = [
        (outer, GOLD_DEEP),
        (int(outer * 0.94), GOLD),
        (int(outer * 0.86), GOLD_LIGHT),
        (int(outer * 0.80), GOLD),
        (int(outer * 0.74), CREAM_RGBA),
    ]
    for radius, color in rings:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)

    # Serrated edge, drawn under the inner gold so the teeth sit on the rim.
    teeth = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    tdraw = ImageDraw.Draw(teeth)
    spikes = 48
    inner_r = int(outer * 0.86)
    outer_r = int(outer * 1.04)
    points: list[tuple[float, float]] = []
    for i in range(spikes * 2):
        radius = outer_r if i % 2 == 0 else inner_r
        angle = math.radians(90 - (360 * i / (spikes * 2)))
        points.append((cx + radius * math.cos(angle), cy - radius * math.sin(angle)))
    tdraw.polygon(points, fill=GOLD)
    image.alpha_composite(teeth)
    # Repaint the disc over the inner part of the teeth.
    for radius, color in rings[1:]:
        draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=color)

    ring_font = _font("Palatino Linotype Bold", int(px * 0.062))
    _circle_text(
        image,
        "MAMAPLUS",
        (cx, cy),
        int(outer * 0.56),
        ring_font,
        GOLD_DEEP,
        start_deg=150,
        end_deg=30,
    )

    star_r = int(px * 0.055)
    star_y = cy - int(px * 0.06)
    star: list[tuple[float, float]] = []
    for i in range(10):
        radius = star_r if i % 2 == 0 else star_r * 0.42
        angle = math.radians(90 - i * 36)
        star.append((cx + radius * math.cos(angle), star_y - radius * math.sin(angle)))
    draw.polygon(star, fill=GOLD_DEEP)

    label = "CERTIFIED"
    label_font = _font("Palatino Linotype Bold", int(px * 0.07))
    bbox = draw.textbbox((0, 0), label, font=label_font)
    draw.text(
        (cx - (bbox[2] - bbox[0]) / 2, cy + int(px * 0.02)),
        label,
        font=label_font,
        fill=GOLD_DEEP,
    )
    return image


def _png_stream(image: Image.Image) -> io.BytesIO:
    stream = io.BytesIO()
    image.save(stream, format="PNG")
    stream.seek(0)
    return stream


def _set_run_font(run, name: str, size: float, color: RGBColor, bold: bool = False, italic: bool = False, spacing: float = 0) -> None:
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    r_pr = run._r.get_or_add_rPr()
    if spacing:
        r_pr.set("spc", str(int(spacing * 100)))
    # Force the latin typeface so PowerPoint does not swap in the theme font.
    for tag in ("a:latin", "a:cs", "a:ea"):
        node = r_pr.find(qn(tag))
        if node is None:
            node = r_pr.makeelement(qn(tag))
            r_pr.append(node)
        node.set("typeface", name)


def _add_text(
    slide,
    text: str,
    left: float,
    top: float,
    width: float,
    height: float,
    font: str,
    size: float,
    color: RGBColor,
    bold: bool = False,
    italic: bool = False,
    spacing: float = 0,
    align=PP_ALIGN.CENTER,
) -> None:
    shape = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    frame = shape.text_frame
    frame.word_wrap = True
    frame.auto_size = None
    frame.margin_left = Emu(0)
    frame.margin_right = Emu(0)
    frame.margin_top = Emu(0)
    frame.margin_bottom = Emu(0)
    frame._txBody.bodyPr.set("anchor", "ctr")
    paragraph = frame.paragraphs[0]
    paragraph.alignment = align
    run = paragraph.add_run()
    run.text = text
    _set_run_font(run, font, size, color, bold, italic, spacing)


def _add_border(slide, inset: float, weight: float, color: RGBColor) -> None:
    shape = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE,
        Inches(inset),
        Inches(inset),
        Inches(PAGE_W - inset * 2),
        Inches(PAGE_H - inset * 2),
    )
    shape.fill.background()
    shape.line.color.rgb = color
    shape.line.width = Pt(weight)
    shape.shadow.inherit = False


def format_serial(serial: int) -> str:
    return f"{serial:06d}"


def format_certificate_number(serial: int, year: int | None = None) -> str:
    return f"MP-{year or date.today().year}-{serial:06d}"


def build_certificate(
    output: Path,
    recipient: str,
    award_date: str,
    program_lines: tuple[str, str],
    body: str,
    left_role: str,
    left_name: str,
    right_role: str,
    right_name: str,
    serial: int,
    certificate_number: str,
    organisation: str = "MamaPlus Training Centre",
) -> Path:
    presentation = Presentation()
    presentation.slide_width = Inches(PAGE_W)
    presentation.slide_height = Inches(PAGE_H)
    presentation.core_properties.title = f"Certificate of Completion — {recipient}"
    presentation.core_properties.subject = "MamaPlus Training Centre certificate"
    presentation.core_properties.author = organisation

    slide = presentation.slides.add_slide(presentation.slide_layouts[6])
    background = slide.background.fill
    background.solid()
    background.fore_color.rgb = CREAM

    _add_border(slide, 0.38, 2.5, TEAL)
    _add_border(slide, 0.52, 0.9, TEAL_SOFT)

    corner = _corner_ornament()
    corner_size = 1.05
    placements = (
        (corner, 0.28, 0.28),
        (corner.transpose(Image.Transpose.FLIP_LEFT_RIGHT), PAGE_W - 0.28 - corner_size, 0.28),
        (corner.transpose(Image.Transpose.ROTATE_180), PAGE_W - 0.28 - corner_size, PAGE_H - 0.28 - corner_size),
        (corner.transpose(Image.Transpose.FLIP_TOP_BOTTOM), 0.28, PAGE_H - 0.28 - corner_size),
    )
    for image, left, top in placements:
        slide.shapes.add_picture(_png_stream(image), Inches(left), Inches(top), Inches(corner_size), Inches(corner_size))

    logo = _load_logo()
    logo_height = 1.28
    logo_width = logo_height * logo.width / logo.height
    slide.shapes.add_picture(
        _png_stream(logo),
        Inches((PAGE_W - logo_width) / 2),
        Inches(0.58),
        Inches(logo_width),
        Inches(logo_height),
    )

    _add_text(slide, "CERTIFICATE OF COMPLETION", 0.8, 1.92, PAGE_W - 1.6, 0.38, FONT_SERIF, 26, TEAL, bold=True, spacing=2.2)
    _add_text(slide, "This is to certify that", 1.4, 2.28, PAGE_W - 2.8, 0.30, FONT_SMALL_SCRIPT, 20, MUTED, italic=True)
    _add_text(slide, recipient.upper(), 0.7, 2.56, PAGE_W - 1.4, 0.48, FONT_SERIF, 26, INK, bold=True, italic=True, spacing=1.4)
    _add_text(slide, "has successfully completed the", 1.4, 3.08, PAGE_W - 2.8, 0.28, FONT_SMALL_SCRIPT, 18, MUTED, italic=True)
    _add_text(slide, program_lines[0], 0.7, 3.36, PAGE_W - 1.4, 0.32, FONT_SERIF, 18, TEAL, bold=True, spacing=1.3)
    _add_text(slide, program_lines[1], 0.7, 3.66, PAGE_W - 1.4, 0.30, FONT_SERIF, 18, TEAL, bold=True, spacing=1.5)
    _add_text(slide, body, 1.35, 4.00, PAGE_W - 2.7, 0.58, FONT_SERIF, 13, INK)
    _add_text(slide, f"DATE:  {award_date}", 1.2, 4.58, PAGE_W - 2.4, 0.30, FONT_SERIF, 13, INK, bold=True, spacing=1.1)
    _add_text(
        slide,
        f"SERIAL NO.  {format_serial(serial)}",
        0.75,
        6.16,
        3.8,
        0.22,
        FONT_SERIF,
        10,
        MUTED,
        bold=True,
        spacing=0.8,
        align=PP_ALIGN.LEFT,
    )
    _add_text(
        slide,
        f"CERTIFICATE NO.  {certificate_number}",
        PAGE_W - 4.55,
        6.16,
        3.8,
        0.22,
        FONT_SERIF,
        10,
        MUTED,
        bold=True,
        spacing=0.8,
        align=PP_ALIGN.RIGHT,
    )

    def signature(center_x: float, role: str, name: str) -> None:
        line_w = 2.05
        line = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE,
            Inches(center_x - line_w / 2),
            Inches(5.22),
            Inches(line_w),
            Pt(1.25),
        )
        line.fill.solid()
        line.fill.fore_color.rgb = RGBColor(0x6E, 0x67, 0x5F)
        line.line.fill.background()
        _add_text(slide, role, center_x - 1.45, 5.28, 2.9, 0.26, FONT_SERIF, 11, MUTED, bold=True, spacing=1.1)
        _add_text(slide, name.upper(), center_x - 1.45, 5.52, 2.9, 0.28, FONT_SERIF, 12, INK, bold=True, italic=True, spacing=0.6)

    signature(2.70, left_role, left_name)
    signature(PAGE_W - 2.70, right_role, right_name)

    seal = _draw_seal()
    seal_size = 1.28
    slide.shapes.add_picture(
        _png_stream(seal),
        Inches((PAGE_W - seal_size) / 2),
        Inches(6.55),
        Inches(seal_size),
        Inches(seal_size),
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    presentation.save(output)
    return output


def export_pdf(pptx_path: Path, pdf_path: Path) -> None:
    """Ask the installed PowerPoint to write a PDF and embed fonts in the pptx."""
    script = f"""
$existing = Get-Process POWERPNT -ErrorAction SilentlyContinue
$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open('{pptx_path}', $false, $false, $false)
try {{
  $pres.SaveAs('{pdf_path}', 32)
}} finally {{
  $pres.Close()
  if (-not $existing) {{ $ppt.Quit() }}
}}
"""
    completed = subprocess.run(
        ["powershell", "-NoProfile", "-Command", script],
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0 or not pdf_path.exists():
        detail = (completed.stderr or completed.stdout or "PowerPoint did not write the PDF.").strip()
        raise RuntimeError(detail)


def _slug(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9]+", "-", value).strip("-")
    return cleaned or "certificate"


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate a MamaPlus Training Centre certificate (.pptx and .pdf).")
    parser.add_argument("--name", default="Philip Odongo", help="Recipient name as it should appear on the certificate.")
    parser.add_argument("--date", default="15th - 24th JUNE", help='Award date, for example "15th - 24th JUNE".')
    parser.add_argument("--program-line-1", default="ACCELERATED CHILDCARE WORKER")
    parser.add_argument("--program-line-2", default="TRAINING PROGRAM")
    parser.add_argument(
        "--body",
        default=(
            "and has been awarded the Accelerated Childcare Worker Training "
            "Certificate in recognition of the successful completion of a 10-day "
            "intensive training program."
        ),
    )
    parser.add_argument("--left-role", default="FOUNDER & CEO")
    parser.add_argument("--left-name", default="ASAYYA IMAYA")
    parser.add_argument("--right-role", default="TRAINER")
    parser.add_argument("--right-name", default="WINNIE ALANDO")
    parser.add_argument("--serial", type=int, required=True, help="Sequential serial, printed as 000001.")
    parser.add_argument(
        "--certificate-number",
        default=None,
        help='Public certificate number. Defaults to MP-<year>-<serial>, for example "MP-2026-000001".',
    )
    parser.add_argument("--output", type=Path, default=None, help="pptx path. Defaults to certificates/<name>-certificate.pptx")
    parser.add_argument("--no-pdf", action="store_true", help="Skip the PowerPoint PDF export.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    output = args.output or (ROOT / f"{_slug(args.name)}-certificate.pptx")
    if not output.is_absolute():
        output = (Path.cwd() / output).resolve()
    if args.serial < 1:
        print("Serial must be 1 or greater.", file=sys.stderr)
        return 1
    certificate_number = args.certificate_number or format_certificate_number(args.serial)
    build_certificate(
        output=output,
        recipient=args.name,
        award_date=args.date,
        program_lines=(args.program_line_1, args.program_line_2),
        body=args.body,
        left_role=args.left_role,
        left_name=args.left_name,
        right_role=args.right_role,
        right_name=args.right_name,
        serial=args.serial,
        certificate_number=certificate_number,
    )
    print(output)
    if not args.no_pdf:
        pdf_path = output.with_suffix(".pdf")
        export_pdf(output, pdf_path)
        print(pdf_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
