from datetime import date, timedelta
from collections import defaultdict
from typing import Any
from models.expense_model import ExpenseModel

ESSENTIAL_CATEGORIES = frozenset({"RENT", "FOOD", "UTILITIES"})
MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]


class DashboardModel:
    def __init__(self, expense_model: ExpenseModel) -> None:
        self._expense_model = expense_model

    def get_all(self) -> dict[str, Any]:
        expenses = self._expense_model.get_all()
        today_val = date.today()
        this_month_start = today_val.replace(day=1)
        last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
        six_months_ago = today_val - timedelta(days=180)
        twelve_months_ago = today_val - timedelta(days=365)

        current_period = [e for e in expenses if self._parse_date(e["expense_date"]) >= six_months_ago]
        prev_period = [e for e in expenses if twelve_months_ago <= self._parse_date(e["expense_date"]) < six_months_ago]
        this_month = [e for e in expenses if self._parse_date(e["expense_date"]) >= this_month_start]
        last_month = [e for e in expenses if last_month_start <= self._parse_date(e["expense_date"]) < this_month_start]

        total_current = sum(e["amount"] for e in current_period)
        total_prev = sum(e["amount"] for e in prev_period)
        count_current = len(current_period)
        count_prev = len(prev_period)
        this_month_sum = sum(e["amount"] for e in this_month)
        last_month_sum = sum(e["amount"] for e in last_month)
        avg_current = total_current / count_current if count_current else 0
        avg_prev = total_prev / count_prev if count_prev else 0

        def trend_pct(curr: float, prev: float) -> float:
            if prev == 0:
                return 100.0 if curr > 0 else 0.0
            return round(((curr - prev) / prev) * 100, 1)

        def trend_label(pct: float, up: str, down: str) -> str:
            return up if pct >= 0 else down

        total_trend = trend_pct(total_current, total_prev)
        month_trend = trend_pct(this_month_sum, last_month_sum)
        count_trend = trend_pct(float(count_current), float(count_prev))
        avg_trend = trend_pct(avg_current, avg_prev)

        kpis = {
            "total_expenses": {
                "value": round(total_current, 2),
                "prev_value": round(total_prev, 2),
                "trend_percent": total_trend,
                "trend_label": trend_label(total_trend, "Up from last period", "Down from last period"),
                "subtitle": "Total spent in the last 6 months",
            },
            "this_month": {
                "value": round(this_month_sum, 2),
                "prev_value": round(last_month_sum, 2),
                "trend_percent": month_trend,
                "trend_label": trend_label(month_trend, "Up from last month", "Down from last month"),
                "subtitle": "Current month spending",
            },
            "expense_count": {
                "value": count_current,
                "prev_value": count_prev,
                "trend_percent": count_trend,
                "trend_label": trend_label(count_trend, "More transactions", "Fewer transactions"),
                "subtitle": "Number of expense entries",
            },
            "avg_per_expense": {
                "value": round(avg_current, 2),
                "prev_value": round(avg_prev, 2),
                "trend_percent": avg_trend,
                "trend_label": trend_label(avg_trend, "Slightly higher average", "Slightly lower average"),
                "subtitle": "Average transaction size",
            },
        }

        last_six_months = self._last_n_months(today_val, 6)

        monthly_map: dict[tuple[int, int], float] = defaultdict(float)
        for e in current_period:
            d = self._parse_date(e["expense_date"])
            key = (d.year, d.month)
            monthly_map[key] += e["amount"]
        monthly_spending = [
            {"month": MONTH_NAMES[m - 1], "amount": int(monthly_map.get((y, m), 0))}
            for y, m in last_six_months
        ]

        monthly_essential: dict[tuple[int, int], float] = defaultdict(float)
        monthly_other: dict[tuple[int, int], float] = defaultdict(float)
        for e in current_period:
            d = self._parse_date(e["expense_date"])
            key = (d.year, d.month)
            if e.get("category") in ESSENTIAL_CATEGORIES:
                monthly_essential[key] += e["amount"]
            else:
                monthly_other[key] += e["amount"]
        monthly_by_type = [
            {
                "month": MONTH_NAMES[m - 1],
                "essential": int(monthly_essential.get((y, m), 0)),
                "other": int(monthly_other.get((y, m), 0)),
            }
            for y, m in last_six_months
        ]

        category_totals: dict[str, float] = defaultdict(float)
        for e in current_period:
            cat = e.get("category") or "OTHER"
            category_totals[cat] += e["amount"]
        chart_colors = [
            "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
            "var(--chart-4)", "var(--chart-5)", "var(--chart-6)",
        ]
        by_category = [
            {
                "category": cat,
                "amount": int(total),
                "fill": chart_colors[i % len(chart_colors)],
            }
            for i, (cat, total) in enumerate(sorted(category_totals.items(), key=lambda x: -x[1]))
        ]

        daily_trend = [
            {"date": date(y, m, 1).isoformat(), "spent": int(monthly_map.get((y, m), 0))}
            for y, m in last_six_months
        ]

        return {
            "kpis": kpis,
            "monthly_spending": monthly_spending,
            "monthly_by_type": monthly_by_type,
            "by_category": by_category,
            "daily_trend": daily_trend,
        }

    def _last_n_months(self, end: date, n: int) -> list[tuple[int, int]]:
        result = []
        y, m = end.year, end.month
        for _ in range(n):
            result.append((y, m))
            m -= 1
            if m < 1:
                m = 12
                y -= 1
        result.reverse()
        return result

    def _parse_date(self, value: Any) -> date:
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            return date.fromisoformat(value[:10])
        return date.today()
