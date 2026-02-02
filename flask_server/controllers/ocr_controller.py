from flask import Blueprint, request
import requests
from config import get_ocr_space_api_key
from views.response import success, error

ocr_bp = Blueprint("ocr", __name__, url_prefix="/ocr")

OCR_SPACE_URL = "https://api.ocr.space/parse/image"


@ocr_bp.route("/extract", methods=["POST"])
def extract_text():
    try:
        api_key = get_ocr_space_api_key()
        if not api_key:
            return error("OCR API key not configured", 500)

        file = request.files.get("file")
        if not file or file.filename == "":
            return error("No file provided", 400)

        file_bytes = file.read()
        content_type = file.content_type or "application/octet-stream"
        headers = {"apikey": api_key}
        files = {"file": (file.filename, file_bytes, content_type)}
        data = {"language": "eng", "isOverlayRequired": "false"}

        resp = requests.post(OCR_SPACE_URL, headers=headers, files=files, data=data, timeout=60)
        resp.raise_for_status()
        result = resp.json()

        parsed_results = result.get("ParsedResults") or []
        texts = []
        for item in parsed_results:
            pt = item.get("ParsedText")
            if pt and isinstance(pt, str) and pt.strip():
                texts.append(pt.strip())
        full_text = "\n\n".join(texts) if texts else ""

        return success({"text": full_text})
    except requests.RequestException as e:
        return error(str(e), 502)
    except ValueError as e:
        return error(str(e), 502)
    except Exception as e:
        return error(str(e), 500)
