from typing import Any, Optional
from supabase import Client

EXPENSE_CATEGORIES = frozenset({
    "RENT", "FOOD", "TRANSPORT", "UTILITIES", "ENTERTAINMENT",
    "HEALTH", "SHOPPING", "EDUCATION", "INSURANCE", "OTHER",
})


class ExpenseModel:
    def __init__(self, client: Client) -> None:
        self._client = client
        self._table = "expenses"

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
