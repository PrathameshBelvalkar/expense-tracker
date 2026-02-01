from flask import Blueprint, request
from config import get_supabase_client
from views.response import success, error
from models.expense_model import ExpenseModel

expenses_bp = Blueprint("expenses", __name__, url_prefix="/expenses")


def get_model() -> ExpenseModel:
    return ExpenseModel(get_supabase_client())


@expenses_bp.route("", methods=["GET"])
def list_expenses():
    try:
        search = request.args.get("search", "").strip() or None
        sort_by = request.args.get("sort_by", "expense_date")
        sort_order = request.args.get("sort_order", "desc")
        try:
            page = max(1, int(request.args.get("page", 1)))
        except (TypeError, ValueError):
            page = 1
        try:
            page_size = max(1, min(100, int(request.args.get("page_size", 10))))
        except (TypeError, ValueError):
            page_size = 10
        model = get_model()
        result = model.get_list(search=search, sort_by=sort_by, sort_order=sort_order, page=page, page_size=page_size)
        return success(result)
    except Exception as e:
        return error(str(e), 500)


@expenses_bp.route("/<expense_id>", methods=["GET"])
def get_expense(expense_id: str):
    try:
        model = get_model()
        item = model.get_by_id(expense_id)
        if item is None:
            return error("Expense not found", 404)
        return success(item)
    except Exception as e:
        return error(str(e), 500)


@expenses_bp.route("", methods=["POST"])
def create_expense():
    try:
        body = request.get_json()
        if not body:
            return error("JSON body required", 400)
        required = ("title", "amount", "expense_date")
        for key in required:
            if key not in body:
                return error(f"Missing field: {key}", 400)
        amount = float(body["amount"])
        if amount < 0:
            return error("amount must be >= 0", 400)
        model = get_model()
        item = model.create(body)
        return success(item, 201)
    except ValueError as e:
        return error(str(e), 400)
    except Exception as e:
        return error(str(e), 500)


@expenses_bp.route("/<expense_id>", methods=["PUT", "PATCH"])
def update_expense(expense_id: str):
    try:
        body = request.get_json()
        if not body:
            return error("JSON body required", 400)
        if "amount" in body and float(body["amount"]) < 0:
            return error("amount must be >= 0", 400)
        model = get_model()
        item = model.update(expense_id, body)
        if item is None:
            return error("Expense not found", 404)
        return success(item)
    except ValueError as e:
        return error(str(e), 400)
    except Exception as e:
        return error(str(e), 500)


@expenses_bp.route("/<expense_id>", methods=["DELETE"])
def delete_expense(expense_id: str):
    try:
        model = get_model()
        deleted = model.delete(expense_id)
        if not deleted:
            return error("Expense not found", 404)
        return success(None, 204)
    except Exception as e:
        return error(str(e), 500)
