import sys
import fitz  # PyMuPDF
import io

# This ensures all output is encoded in UTF-8 to prevent errors on Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

def extract_text(pdf_path):
    """Extracts clean text from a PDF, preserving paragraphs."""
    try:
        doc = fitz.open(pdf_path)
        full_text = []
        for page in doc:
            # The 'blocks' option is excellent for preserving paragraph structure
            blocks = page.get_text("blocks")
            # Sort blocks by their vertical position on the page
            blocks.sort(key=lambda b: b[1]) 
            for b in blocks:
                # b[4] is the text content of a block, we clean it up
                clean_block = " ".join(b[4].strip().split())
                if clean_block:
                    full_text.append(clean_block)
        # Join all blocks with double newlines to clearly separate paragraphs
        print("\n\n".join(full_text))
    except Exception as e:
        print(f"Python Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_text(sys.argv[1])
    else:
        print("Python Error: No PDF file path provided.", file=sys.stderr)
        sys.exit(1)