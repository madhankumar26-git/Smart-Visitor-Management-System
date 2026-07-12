from flask import Blueprint, jsonify
from utils.auth import role_required

security_bp = Blueprint("security", __name__, url_prefix="/security")


@security_bp.route("/status", methods=["GET"])
@role_required(["security"])
def security_status():
    return jsonify({"success": True, "message": "Security route is available."}), 200
