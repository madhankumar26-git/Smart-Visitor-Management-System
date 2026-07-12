import uuid
from datetime import datetime, date, timedelta
from flask import Blueprint, request, current_app, send_file
import io
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from database import db
from models import Visitor, User
from models import utc_iso
from socket_service import socketio
from utils.responses import error_response, success_response
from utils.validators import (
    validate_visitor_payload,
    validate_search_params,
    validate_filter_params,
)
from utils.auth import role_required
from utils.enterprise import (log_activity, create_notification, send_registration_notification,
                              send_visitor_pass, generate_visitor_pass_pdf, india_today)

visitor_bp = Blueprint("visitor", __name__, url_prefix="/visitor")


def get_current_user_id():
    verify_jwt_in_request()
    return get_jwt_identity()


def parse_date(date_string: str):
    try:
        return datetime.strptime(date_string, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def build_query(filters):
    query = Visitor.query

    if filters.get("visitor_name"):
        query = query.filter(Visitor.visitor_name.ilike(f"%{filters['visitor_name']}%"))
    if filters.get("mobile_number"):
        query = query.filter(Visitor.mobile_number.ilike(f"%{filters['mobile_number']}%"))
    if filters.get("company_name"):
        query = query.filter(Visitor.company_name.ilike(f"%{filters['company_name']}%"))
    if filters.get("email"):
        query = query.filter(Visitor.email.ilike(f"%{filters['email']}%"))
    if filters.get("department"):
        query = query.filter(Visitor.department.ilike(f"%{filters['department']}%"))
    if filters.get("person_to_meet"):
        query = query.filter(Visitor.person_to_meet.ilike(f"%{filters['person_to_meet']}%"))
    if filters.get("status"):
        query = query.filter(Visitor.status == filters["status"])
    if filters.get("visitor_type"):
        query = query.filter(Visitor.visitor_type == filters["visitor_type"])

    start_date = parse_date(filters.get("start_date"))
    end_date = parse_date(filters.get("end_date"))

    if start_date and end_date:
        query = query.filter(Visitor.visit_date.between(start_date, end_date))
    elif start_date:
        query = query.filter(Visitor.visit_date >= start_date)
    elif end_date:
        query = query.filter(Visitor.visit_date <= end_date)

    return query


def serialize_visitor(visitor: Visitor) -> dict:
    duration_minutes = None
    duration = None
    if visitor.check_in_time and visitor.check_out_time:
        duration_minutes = max(0, int((visitor.check_out_time - visitor.check_in_time).total_seconds() // 60))
        hours, minutes = divmod(duration_minutes, 60)
        duration = f"{hours}h {minutes}m" if hours else f"{minutes}m"

    return {
        "id": visitor.id,
        "visitor_id": visitor.visitor_id,
        "visitor_name": visitor.visitor_name,
        "company_name": visitor.company_name,
        "mobile_number": visitor.mobile_number,
        "email": visitor.email,
        "person_to_meet": visitor.person_to_meet,
        "department": visitor.department,
        "purpose": visitor.purpose,
        "visitor_type": visitor.visitor_type,
        "id_proof_type": visitor.id_proof_type,
        "id_proof_number": visitor.id_proof_number,
        "vehicle_number": visitor.vehicle_number,
        "photo": visitor.photo,
        "check_in_time": utc_iso(visitor.check_in_time),
        "check_out_time": utc_iso(visitor.check_out_time),
        "duration_minutes": duration_minutes,
        "duration": duration,
        "visit_date": visitor.visit_date.isoformat() if visitor.visit_date else None,
        "status": visitor.status,
        "qr_code": visitor.qr_code,
        "remarks": visitor.remarks,
        "created_by": visitor.created_by,
        "created_at": utc_iso(visitor.created_at),
        "updated_at": utc_iso(visitor.updated_at),
    }


@visitor_bp.route("/add", methods=["POST"])
@role_required(["admin"])
def add_visitor():
    if not request.is_json:
        return error_response("Request must be JSON.", 400)

    payload = request.get_json(silent=True) or {}
    errors, visitor_data = validate_visitor_payload(payload)
    if errors:
        return error_response("Validation failed.", 400, errors)

    if Visitor.query.filter(Visitor.id_proof_number == visitor_data.get("id_proof_number"), Visitor.visit_date == visitor_data.get("visit_date")).first():
        return error_response("Duplicate visitor entry detected.", 409)

    visitor = Visitor(**visitor_data, created_by=get_current_user_id())
    visitor.visitor_id = Visitor.generate_visitor_identifier(visitor.visit_date)
    visitor.qr_code = str(uuid.uuid4())
    db.session.add(visitor)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Visitor add failed")
        return error_response("Unable to save visitor.", 500)

    current_app.logger.info("Visitor added: %s", visitor.visitor_name)
    actor = User.query.get(get_current_user_id())
    log_activity("Visitor Created", actor, f"Created visitor {visitor.visitor_id}")
    db.session.commit()
    send_registration_notification(visitor)
    create_notification("New Visitor Registered", f"{visitor.visitor_name} is awaiting approval.", "admin")
    socketio.emit('visitor-event', {'action': 'added', 'visitor': serialize_visitor(visitor)})
    return success_response({"visitor": serialize_visitor(visitor)}, "Visitor added successfully.", 201)


@visitor_bp.route("/all", methods=["GET"])
@role_required(["admin", "security"])
def get_all_visitors():
    params = request.args.to_dict()
    filters, errors = validate_filter_params(params)
    if errors:
        return error_response("Invalid filters.", 400, errors)

    query = build_query(filters)
    visitors = query.order_by(Visitor.visit_date.desc()).all()
    return success_response({"visitors": [serialize_visitor(v) for v in visitors]}, "Visitor list retrieved.", 200)


@visitor_bp.route("/today", methods=["GET"])
@role_required(["admin", "security"])
def get_today_visitors():
    today = india_today()
    visitors = Visitor.query.filter(Visitor.visit_date == today).order_by(Visitor.check_in_time.asc()).all()
    return success_response({"visitors": [serialize_visitor(v) for v in visitors]}, "Today\'s visitors retrieved.", 200)


@visitor_bp.route("/", methods=["GET"])
@visitor_bp.route("/search", methods=["GET"])
@role_required(["admin", "security"])
def get_visitors():
    params = request.args.to_dict()
    filters, errors = validate_search_params(params)
    if errors:
        return error_response("Search validation failed.", 400, errors)

    visitors = build_query(filters).order_by(Visitor.visit_date.desc()).all()
    return success_response({"visitors": [serialize_visitor(v) for v in visitors]}, "Search results returned.", 200)


@visitor_bp.route("/update/<int:visitor_id>", methods=["PUT"])
@role_required(["admin"])
def update_visitor(visitor_id):
    if not request.is_json:
        return error_response("Request must be JSON.", 400)

    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response("Visitor not found.", 404)

    payload = request.get_json(silent=True) or {}
    errors, visitor_data = validate_visitor_payload(payload, partial=True)
    if errors:
        return error_response("Validation failed.", 400, errors)

    for key, value in visitor_data.items():
        setattr(visitor, key, value)
    visitor.updated_at = datetime.utcnow()

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Visitor update failed")
        return error_response("Unable to update visitor.", 500)

    current_app.logger.info("Visitor updated: %s", visitor_id)
    log_activity("Visitor Updated", User.query.get(get_current_user_id()), f"Updated visitor {visitor.visitor_id}")
    db.session.commit()
    socketio.emit('visitor-event', {'action': 'updated', 'visitor': serialize_visitor(visitor)})
    return success_response({"visitor": serialize_visitor(visitor)}, "Visitor updated successfully.", 200)


@visitor_bp.route("/delete/<int:visitor_id>", methods=["DELETE"])
@role_required(["admin"])
def delete_visitor(visitor_id):
    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response("Visitor not found.", 404)

    db.session.delete(visitor)
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Visitor delete failed")
        return error_response("Unable to delete visitor.", 500)

    current_app.logger.info("Visitor deleted: %s", visitor_id)
    socketio.emit('visitor-event', {'action': 'deleted', 'visitorId': visitor_id})
    return success_response({}, "Visitor deleted successfully.", 200)


@visitor_bp.route('/<int:visitor_id>/qrcode', methods=['GET'])
@role_required(['admin', 'security'])
def get_visitor_qrcode(visitor_id):
    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response('Visitor not found.', 404)
    if not visitor.qr_code:
        visitor.qr_code = str(uuid.uuid4())
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception('Unable to generate QR code for visitor')
            return error_response('Unable to generate QR code.', 500)

    return success_response({'visitor_id': visitor.visitor_id, 'qr_code': visitor.qr_code}, 'QR code retrieved.', 200)


@visitor_bp.route('/<int:visitor_id>/pass', methods=['GET'])
@role_required(['admin', 'security'])
def download_visitor_pass(visitor_id):
    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response('Visitor not found.', 404)
    if visitor.status not in ('Approved', 'Checked-In', 'Checked-Out'):
        return error_response('A pass is available after visitor approval.', 400)
    pdf = generate_visitor_pass_pdf(visitor)
    if not pdf:
        return error_response('Unable to generate visitor pass.', 500)
    log_activity('Pass Download', User.query.get(get_current_user_id()), f'Downloaded pass for {visitor.visitor_id}')
    db.session.commit()
    return send_file(io.BytesIO(pdf), mimetype='application/pdf', as_attachment=True,
                     download_name=f'visitor-pass-{visitor.visitor_id}.pdf')


@visitor_bp.route('/scan', methods=['POST'])
@role_required(['security'])
def scan_qr_code():
    if not request.is_json:
        return error_response('Request must be JSON.', 400)

    payload = request.get_json(silent=True) or {}
    qr_code = str(payload.get('qr_code', '')).strip()
    if not qr_code:
        return error_response('QR code is required.', 400)

    visitor = Visitor.query.filter_by(qr_code=qr_code).first()
    if not visitor:
        return error_response('Visitor not found for QR code.', 404)

    if visitor.status == 'Approved':
        visitor.status = 'Checked-In'
        visitor.check_in_time = datetime.utcnow()
        visitor.updated_at = datetime.utcnow()
        action = 'checked_in'
        message = 'Visitor checked in successfully.'
    elif visitor.status == 'Checked-In':
        visitor.status = 'Checked-Out'
        visitor.check_out_time = datetime.utcnow()
        visitor.updated_at = datetime.utcnow()
        action = 'checked_out'
        message = 'Visitor checked out successfully.'
    else:
        return success_response({'visitor': serialize_visitor(visitor)}, 'Visitor scan completed. No action taken for current status.', 200)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception('QR scan action failed')
        return error_response('Unable to complete scan action.', 500)

    actor = User.query.get(get_current_user_id())
    log_activity('Check-In' if action == 'checked_in' else 'Check-Out', actor, f'QR scan for {visitor.visitor_id}')
    db.session.commit()
    create_notification('Visitor Checked-In' if action == 'checked_in' else 'Visitor Checked-Out',
                        f'{visitor.visitor_name} has {"checked in" if action == "checked_in" else "checked out"}.', 'all')
    socketio.emit('visitor-event', {'action': action, 'visitor': serialize_visitor(visitor)})
    return success_response({'visitor': serialize_visitor(visitor)}, message, 200)


@visitor_bp.route("/checkin/<int:visitor_id>", methods=["POST"])
@role_required(["security"])
def checkin_visitor(visitor_id):
    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response("Visitor not found.", 404)
    if visitor.status != "Approved":
        return error_response("Only approved visitors can be checked in.", 400)

    visitor.check_in_time = datetime.utcnow()
    visitor.visit_date = india_today()
    visitor.status = "Checked-In"
    visitor.updated_at = datetime.utcnow()

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Visitor check-in failed")
        return error_response("Unable to check in visitor.", 500)

    current_app.logger.info("Visitor checked in: %s", visitor_id)
    log_activity("Check-In", User.query.get(get_current_user_id()), f"Checked in {visitor.visitor_id}")
    db.session.commit()
    create_notification("Visitor Checked-In", f"{visitor.visitor_name} has checked in.", "all")
    socketio.emit('visitor-event', {'action': 'checked_in', 'visitor': serialize_visitor(visitor)})
    return success_response({"visitor": serialize_visitor(visitor)}, "Visitor checked in successfully.", 200)


@visitor_bp.route("/checkout/<int:visitor_id>", methods=["POST"])
@role_required(["security"])
def checkout_visitor(visitor_id):
    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response("Visitor not found.", 404)
    if visitor.status != "Checked-In":
        return error_response("Visitor must be checked in before checkout.", 400)

    visitor.check_out_time = datetime.utcnow()
    visitor.status = "Checked-Out"
    visitor.updated_at = datetime.utcnow()

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Visitor check-out failed")
        return error_response("Unable to check out visitor.", 500)

    current_app.logger.info("Visitor checked out: %s", visitor_id)
    log_activity("Check-Out", User.query.get(get_current_user_id()), f"Checked out {visitor.visitor_id}")
    db.session.commit()
    create_notification("Visitor Checked-Out", f"{visitor.visitor_name} has checked out.", "all")
    socketio.emit('visitor-event', {'action': 'checked_out', 'visitor': serialize_visitor(visitor)})
    return success_response({"visitor": serialize_visitor(visitor)}, "Visitor checked out successfully.", 200)


@visitor_bp.route("/<int:visitor_id>", methods=["GET"])
@role_required(["admin", "security"])
def get_visitor(visitor_id):
    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response("Visitor not found.", 404)
    return success_response({"visitor": serialize_visitor(visitor)}, "Visitor retrieved successfully.", 200)


@visitor_bp.route("/approve/<int:visitor_id>", methods=["POST"])
@role_required(["admin"])
def approve_visitor(visitor_id):
    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response("Visitor not found.", 404)
    if visitor.status != "Pending":
        return error_response("Only pending visitors can be approved.", 400)
    visitor.status = "Approved"
    visitor.updated_at = datetime.utcnow()
    try:
        log_activity("Visitor Approved", User.query.get(get_current_user_id()), f"Approved {visitor.visitor_id}")
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Visitor approval failed")
        return error_response("Unable to approve visitor.", 500)
    send_visitor_pass(visitor)
    create_notification("Visitor Approved", f"{visitor.visitor_name} was approved and issued a pass.", "all")
    socketio.emit('visitor-event', {'action': 'approved', 'visitor': serialize_visitor(visitor)})
    return success_response({"visitor": serialize_visitor(visitor)}, "Visitor approved successfully.", 200)


@visitor_bp.route("/reject/<int:visitor_id>", methods=["POST"])
@role_required(["admin"])
def reject_visitor(visitor_id):
    visitor = Visitor.query.get(visitor_id)
    if not visitor:
        return error_response("Visitor not found.", 404)
    if visitor.status != "Pending":
        return error_response("Only pending visitors can be rejected.", 400)
    visitor.status = "Rejected"
    visitor.updated_at = datetime.utcnow()
    try:
        log_activity("Visitor Rejected", User.query.get(get_current_user_id()), f"Rejected {visitor.visitor_id}")
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Visitor rejection failed")
        return error_response("Unable to reject visitor.", 500)
    create_notification("Visitor Rejected", f"{visitor.visitor_name} was rejected.", "admin")
    socketio.emit('visitor-event', {'action': 'rejected', 'visitor': serialize_visitor(visitor)})
    return success_response({"visitor": serialize_visitor(visitor)}, "Visitor rejected successfully.", 200)
