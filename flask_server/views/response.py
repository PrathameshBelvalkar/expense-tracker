from flask import jsonify
from typing import Any, Optional


def success(data: Any = None, status: int = 200):
    if status == 204:
        return "", 204
    body = {"ok": True}
    if data is not None:
        body["data"] = data
    return jsonify(body), status


def error(message: str, status: int = 400):
    return jsonify({"ok": False, "error": message}), status
