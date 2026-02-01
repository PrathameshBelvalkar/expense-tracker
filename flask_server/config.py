import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

_url: str = os.environ.get("SUPABASE_URL", "")
_key: str = os.environ.get("SUPABASE_KEY", "")
_supabase: Client | None = None


def get_supabase_client() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(_url, _key)
    return _supabase
