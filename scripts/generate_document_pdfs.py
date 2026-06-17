from __future__ import annotations

from pathlib import Path
import struct


ROOT = Path(__file__).resolve().parents[1]
DOCUMENT_ROOT = ROOT / "frontend" / "public" / "documents"
PAGE_MARGIN = 36


def read_jpeg_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if not data.startswith(b"\xff\xd8"):
        raise ValueError(f"{path} is not a JPEG file")

    index = 2
    while index < len(data):
        while index < len(data) and data[index] == 0xFF:
            index += 1

        marker = data[index]
        index += 1

        if marker in {0xD8, 0xD9}:
            continue

        segment_length = struct.unpack(">H", data[index : index + 2])[0]
        segment_start = index + 2

        if 0xC0 <= marker <= 0xC3:
            height = struct.unpack(">H", data[segment_start + 1 : segment_start + 3])[0]
            width = struct.unpack(">H", data[segment_start + 3 : segment_start + 5])[0]
            return width, height

        index += segment_length

    raise ValueError(f"Could not determine JPEG dimensions for {path}")


def pdf_object(number: int, content: bytes) -> bytes:
    return b"%d 0 obj\n" % number + content + b"\nendobj\n"


def make_pdf(image_path: Path, output_path: Path) -> None:
    image_bytes = image_path.read_bytes()
    image_width, image_height = read_jpeg_size(image_path)
    page_width = 595.28
    page_height = 841.89
    max_width = page_width - 2 * PAGE_MARGIN
    max_height = page_height - 2 * PAGE_MARGIN
    scale = min(max_width / image_width, max_height / image_height)
    draw_width = image_width * scale
    draw_height = image_height * scale
    draw_x = (page_width - draw_width) / 2
    draw_y = (page_height - draw_height) / 2
    content_stream = f"q\n{draw_width:.4f} 0 0 {draw_height:.4f} {draw_x:.4f} {draw_y:.4f} cm\n/Im0 Do\nQ\n".encode()

    objects = [
        pdf_object(1, b"<< /Type /Catalog /Pages 2 0 R >>"),
        pdf_object(2, b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>"),
        pdf_object(
            3,
            (
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {page_width:.2f} {page_height:.2f}] "
                "/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>"
            ).encode(),
        ),
        pdf_object(
            4,
            (
                f"<< /Type /XObject /Subtype /Image /Width {image_width} /Height {image_height} "
                f"/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length {len(image_bytes)} >>\nstream\n"
            ).encode()
            + image_bytes
            + b"\nendstream",
        ),
        pdf_object(5, f"<< /Length {len(content_stream)} >>\nstream\n".encode() + content_stream + b"endstream"),
    ]

    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]
    for item in objects:
        offsets.append(len(pdf))
        pdf.extend(item)

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())

    pdf.extend(
        (
            f"trailer\n<< /Size {len(offsets)} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode()
    )
    output_path.write_bytes(bytes(pdf))


def main() -> None:
    for image_path in sorted(DOCUMENT_ROOT.rglob("*")):
        if image_path.suffix.lower() not in {".jpg", ".jpeg"}:
            continue

        make_pdf(image_path, image_path.with_suffix(".pdf"))


if __name__ == "__main__":
    main()
