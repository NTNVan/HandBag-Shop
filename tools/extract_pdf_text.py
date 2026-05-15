from __future__ import annotations

import argparse
from pathlib import Path

from pypdf import PdfReader


def extract_pdf_to_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    parts: list[str] = []

    for index, page in enumerate(reader.pages, start=1):
        try:
            page_text = page.extract_text() or ""
        except Exception:
            page_text = ""
        parts.append(f"\n\n===== PAGE {index} =====\n\n{page_text}")

    return "".join(parts)


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract text from a PDF into a .txt file")
    parser.add_argument("pdf", type=str, help="Path to input PDF")
    parser.add_argument(
        "--out",
        type=str,
        default="",
        help="Output .txt path (default: alongside PDF with .txt extension)",
    )
    args = parser.parse_args()

    pdf_path = Path(args.pdf).expanduser().resolve()
    if not pdf_path.exists():
        raise SystemExit(f"PDF not found: {pdf_path}")

    out_path = Path(args.out).expanduser().resolve() if args.out else pdf_path.with_suffix(".txt")
    out_path.parent.mkdir(parents=True, exist_ok=True)

    text = extract_pdf_to_text(pdf_path)
    out_path.write_text(text, encoding="utf-8", errors="ignore")

    print(f"Extracted {pdf_path.name} -> {out_path} ({len(text)} chars)")


if __name__ == "__main__":
    main()
