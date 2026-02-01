from flask import Blueprint
from config import get_supabase_client
from views.response import success, error
from models.expense_model import ExpenseModel
from models.dashboard_model import DashboardModel

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


def get_dashboard_model() -> DashboardModel:
    return DashboardModel(ExpenseModel(get_supabase_client()))


@dashboard_bp.route("", methods=["GET"])
def get_dashboard():
    try:
        model = get_dashboard_model()
        data = model.get_all()
        return success(data)
    except Exception as e:
        return error(str(e), 500)
