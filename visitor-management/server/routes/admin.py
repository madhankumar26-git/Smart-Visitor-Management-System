import io
import os
import sqlite3
from datetime import datetime
from flask import Blueprint, jsonify, request, current_app, send_file
from flask_jwt_extended import get_jwt_identity
from database import db
from models import ActivityLog, CompanySettings, Notification, NotificationRead, User
from utils.auth import role_required
from utils.responses import error_response, success_response
from utils.enterprise import log_activity, company_settings

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


def actor():
    return User.query.get(get_jwt_identity())


@admin_bp.route("/status", methods=["GET"])
@role_required(["admin"])
def admin_status():
    return jsonify({"success": True, "message": "Admin route is available."}), 200


@admin_bp.route("/activity-logs", methods=["GET"])
@role_required(["admin"])
def activity_logs():
    limit = min(max(int(request.args.get("limit", 100)), 1), 500)
    logs = ActivityLog.query.order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return success_response({"logs": [log.to_dict() for log in logs]}, "Activity logs retrieved.", 200)


@admin_bp.route("/company-settings", methods=["GET", "PUT"])
@role_required(["admin"])
def settings():
    settings = company_settings()
    if request.method == "GET":
        return success_response({"settings": settings.to_dict()}, "Company settings retrieved.", 200)
    if not request.is_json:
        return error_response("Request must be JSON.", 400)
    payload = request.get_json(silent=True) or {}
    fields = ("company_name", "company_logo", "company_address", "phone_number", "email", "website")
    name = str(payload.get("company_name", settings.company_name)).strip()
    if not name:
        return error_response("Company name is required.", 400)
    for field in fields:
        if field in payload:
            setattr(settings, field, str(payload[field]).strip() or None)
    settings.company_name = name
    try:
        log_activity("Company Settings Updated", actor())
        db.session.commit()
    except Exception:
        db.session.rollback(); current_app.logger.exception("Settings update failed")
        return error_response("Unable to save company settings.", 500)
    return success_response({"settings": settings.to_dict()}, "Company settings saved.", 200)


@admin_bp.route("/notifications", methods=["GET"])
@role_required(["admin", "security"])
def notifications():
    user = actor()
    role = user.role
    records = Notification.query.filter(Notification.audience.in_(["all", role])).order_by(Notification.created_at.desc()).limit(30).all()
    read_ids = {item.notification_id for item in NotificationRead.query.filter_by(user_id=user.id).all()}
    return success_response({"notifications": [item.to_dict(item.id in read_ids) for item in records], "unread_count": sum(item.id not in read_ids for item in records)}, "Notifications retrieved.", 200)


@admin_bp.route("/notifications/<int:notification_id>/read", methods=["POST"])
@role_required(["admin", "security"])
def mark_notification_read(notification_id):
    user = actor()
    notification = Notification.query.filter(Notification.id == notification_id, Notification.audience.in_(["all", user.role])).first()
    if not notification:
        return error_response("Notification not found.", 404)
    if not NotificationRead.query.filter_by(notification_id=notification.id, user_id=user.id).first():
        db.session.add(NotificationRead(notification_id=notification.id, user_id=user.id))
        db.session.commit()
    return success_response({"notification": notification.to_dict(True)}, "Notification marked as read.", 200)


@admin_bp.route("/notifications/read-all", methods=["POST"])
@role_required(["admin", "security"])
def mark_all_notifications_read():
    user = actor()
    records = Notification.query.filter(Notification.audience.in_(["all", user.role])).all()
    read_ids = {item.notification_id for item in NotificationRead.query.filter_by(user_id=user.id).all()}
    db.session.add_all([NotificationRead(notification_id=item.id, user_id=user.id) for item in records if item.id not in read_ids])
    db.session.commit()
    return success_response({"unread_count": 0}, "All notifications marked as read.", 200)


@admin_bp.route("/backup", methods=["GET"])
@role_required(["admin"])
def backup_database():
    uri = current_app.config["SQLALCHEMY_DATABASE_URI"]
    if not uri.startswith("sqlite:///"):
        return error_response("Database backup is available for SQLite only.", 400)
    path = uri.replace("sqlite:///", "", 1)
    try:
        with open(path, "rb") as backup:
            data = backup.read()
        log_activity("Database Backup Downloaded", actor())
        db.session.commit()
        return send_file(io.BytesIO(data), as_attachment=True, download_name=f"visitor-management-{datetime.utcnow():%Y%m%d%H%M%S}.db", mimetype="application/octet-stream")
    except Exception:
        current_app.logger.exception("Database backup failed")
        return error_response("Unable to create database backup.", 500)


@admin_bp.route("/restore", methods=["POST"])
@role_required(["admin"])
def restore_database():
    uploaded = request.files.get("backup")
    if not uploaded or not uploaded.filename.lower().endswith((".db", ".sqlite", ".sqlite3")):
        return error_response("A SQLite backup file is required.", 400)
    uri = current_app.config["SQLALCHEMY_DATABASE_URI"]
    if not uri.startswith("sqlite:///"):
        return error_response("Database restore is available for SQLite only.", 400)
    try:
        source = sqlite3.connect(":memory:")
        uploaded.save(os.path.join(current_app.instance_path, "restore-upload.db"))
        upload_path = os.path.join(current_app.instance_path, "restore-upload.db")
        source.close()
        source = sqlite3.connect(upload_path)
        source.execute("PRAGMA schema_version").fetchone()
        target = sqlite3.connect(uri.replace("sqlite:///", "", 1))
        source.backup(target)
        target.close(); source.close(); os.remove(upload_path)
        return success_response({}, "Database restored successfully. Please sign in again.", 200)
    except Exception:
        current_app.logger.exception("Database restore failed")
        return error_response("Unable to restore database. Ensure the backup is valid.", 400)
