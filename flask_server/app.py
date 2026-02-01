from flask import Flask, jsonify
from flask_cors import CORS
from config import get_supabase_client
from controllers.expense_controller import expenses_bp
from controllers.dashboard_controller import dashboard_bp

app = Flask(__name__)
CORS(app)
app.register_blueprint(expenses_bp)
app.register_blueprint(dashboard_bp)


@app.route("/")
def index():
    try:
        supabase = get_supabase_client()
        response = supabase.table("expenses").select("id").limit(1).execute()
        return jsonify({"status": "ok", "supabase": "connected", "data": response.data})
    except Exception as e:
        return jsonify({"status": "error", "supabase": "disconnected", "message": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
