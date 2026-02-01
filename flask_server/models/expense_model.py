from typing import Any, Optional
from supabase import Client

EXPENSE_CATEGORIES = frozenset({
    "RENT", "FOOD", "TRANSPORT", "UTILITIES", "ENTERTAINMENT",
    "HEALTH", "SHOPPING", "EDUCATION", "INSURANCE", "OTHER",
})

SORTABLE_COLUMNS = frozenset({"title", "amount", "category", "expense_date", "description"})


class ExpenseModel:
    def __init__(self, client: Client) -> None:
        self._client = client
        self._table = "expenses"

    def get_list(
        self,
        search: Optional[str] = None,
        sort_by: str = "expense_date",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ) -> dict[str, Any]:
        if sort_by not in SORTABLE_COLUMNS:
            sort_by = "expense_date"
        if sort_order not in ("asc", "desc"):
            sort_order = "desc"
        page = max(1, page)
        page_size = max(1, min(100, page_size))
        start = (page - 1) * page_size
        end = start + page_size - 1

        q = self._client.table(self._table).select("*", count="exact")
        if search and search.strip():
            term = search.strip().replace("%", "\\%").replace("_", "\\_")
            pattern = f"%{term}%"
            q = q.or_(f"title.ilike.{pattern},description.ilike.{pattern}")
        q = q.order(sort_by, desc=(sort_order == "desc"))
        response = q.range(start, end).execute()
        items = [self._normalize(row) for row in response.data]
        total = getattr(response, "count", None)
        try:
            total = int(total) if total is not None else None
        except (TypeError, ValueError):
            total = None
        if total is None:
            if not items and page == 1:
                total = 0
            else:
                total = start + len(items)
                if len(items) == page_size:
                    total = max(total, page * page_size)
        return {"items": items, "total": total}

    def get_all(self) -> list[dict[str, Any]]:
        response = self._client.table(self._table).select("*").order("expense_date", desc=True).execute()
        return [self._normalize(row) for row in response.data]

    def get_by_id(self, expense_id: str) -> Optional[dict[str, Any]]:
        response = self._client.table(self._table).select("*").eq("id", expense_id).execute()
        if not response.data:
            return None
        return self._normalize(response.data[0])

    def create(self, data: dict[str, Any]) -> dict[str, Any]:
        payload = self._to_payload(data)
        response = self._client.table(self._table).insert(payload).execute()
        return self._normalize(response.data[0])

    def update(self, expense_id: str, data: dict[str, Any]) -> Optional[dict[str, Any]]:
        payload = self._to_payload(data, for_update=True)
        response = self._client.table(self._table).update(payload).eq("id", expense_id).execute()
        if not response.data:
            return None
        return self._normalize(response.data[0])

    def delete(self, expense_id: str) -> bool:
        response = self._client.table(self._table).delete().eq("id", expense_id).execute()
        return len(response.data) > 0

    def _normalize(self, row: dict[str, Any]) -> dict[str, Any]:
        out = {
            "id": str(row["id"]),
            "title": row["title"],
            "amount": float(row["amount"]) if row.get("amount") is not None else 0,
            "category": row["category"],
            "expense_date": row["expense_date"] if isinstance(row["expense_date"], str) else str(row["expense_date"]),
            "description": row.get("description") or "",
        }
        return out

    def _to_payload(self, data: dict[str, Any], for_update: bool = False) -> dict[str, Any]:
        payload: dict[str, Any] = {}
        if "title" in data and data["title"] is not None:
            payload["title"] = str(data["title"]).strip()
        if "amount" in data and data["amount"] is not None:
            payload["amount"] = float(data["amount"])
        if "category" in data and data["category"] is not None:
            cat = str(data["category"]).upper()
            payload["category"] = cat if cat in EXPENSE_CATEGORIES else "OTHER"
        if "expense_date" in data and data["expense_date"] is not None:
            payload["expense_date"] = str(data["expense_date"])[:10]
        if "description" in data:
            payload["description"] = str(data["description"]).strip() if data["description"] else ""
        return payload
