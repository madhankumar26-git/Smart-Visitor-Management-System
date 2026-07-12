from datetime import datetime
from flask import Blueprint, request, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from models import User, CompanySettings
from database import db
from utils.responses import error_response, success_response
from utils.validators import EMAIL_PATTERN, validate_login_data, validate_registration_data
from utils.enterprise import log_activity, create_notification


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/company", methods=["GET"])
def public_company_settings():
    settings = CompanySettings.query.first()
    return success_response({"settings": settings.to_dict() if settings else {"company_name": "Smart Visitor"}}, "Company settings retrieved.", 200)


@auth_bp.route("/register", methods=["POST"])
def register():
    if not request.is_json:
        return error_response("Request must be JSON.", 400)

    payload = request.get_json(silent=True) or {}
    errors, full_name, email, password, role = validate_registration_data(payload)

    if errors:
        return error_response("Registration validation failed.", 400, errors)

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        current_app.logger.warning("Registration failed: duplicate email %s", email)
        return error_response("Email is already registered.", 409)

    user = User(full_name=full_name, email=email, password=password, role=role)
    db.session.add(user)

    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        current_app.logger.exception("Registration database error")
        return error_response("Unable to complete registration.", 500)

    current_app.logger.info("New user registered: %s", email)
    return success_response({"user": user.to_dict()}, "Registration completed successfully.", 201)


@auth_bp.route("/login", methods=["POST"])
def login():
    if not request.is_json:
        return error_response("Request must be JSON.", 400)

    payload = request.get_json(silent=True) or {}
    errors, email, password = validate_login_data(payload)

    if errors:
        return error_response("Login validation failed.", 400, errors)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        current_app.logger.warning("Login failed for email: %s", email)
        return error_response("Invalid email or password.", 401)

    # JWT subjects must be strings with the installed PyJWT version.  The
    # database lookups continue to use this same user ID, so authorization
    # remains scoped to the authenticated account.
    identity = str(user.id)
    access_token = create_access_token(identity=identity, additional_claims={"role": user.role})
    refresh_token = create_refresh_token(identity=identity, additional_claims={"role": user.role})
    user.last_login = datetime.utcnow()
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()

    current_app.logger.info("User login succeeded: %s", email)
    log_activity("Login", user)
    db.session.commit()
    create_notification(f"New {user.role.title()} Login", f"{user.full_name} signed in.", "admin")
    return success_response(
        {
            "token": access_token,
            "refresh_token": refresh_token,
            "role": user.role,
            "user": user.to_dict(),
        },
        "Login successful.",
        200,
    )


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user, additional_claims={"role": get_jwt().get("role")})
    return success_response({"token": access_token}, "Access token refreshed.", 200)


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user:
        return error_response("User not found.", 404)
    return success_response({"user": user.to_dict()}, "Profile retrieved successfully.", 200)


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    if not request.is_json:
        return error_response("Request must be JSON.", 400)

    payload = request.get_json(silent=True) or {}
    full_name = str(payload.get("full_name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    errors = []

    if not full_name:
        errors.append("Full name is required.")
    if not email:
        errors.append("Email is required.")
    elif not EMAIL_PATTERN.match(email):
        errors.append("A valid email address is required.")

    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user:
        errors.append("User not found.")

    if user and User.query.filter(User.email == email, User.id != user.id).first():
        errors.append("Email is already in use.")

    profile_image = str(payload.get("profile_image", "")).strip() or None

    if errors:
        return error_response("Profile validation failed.", 400, errors)

    user.full_name = full_name
    user.email = email
    user.profile_image = profile_image

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Profile update failed")
        return error_response("Unable to update profile.", 500)

    return success_response({"user": user.to_dict()}, "Profile updated successfully.", 200)


@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    if not request.is_json:
        return error_response("Request must be JSON.", 400)

    payload = request.get_json(silent=True) or {}
    current_password = str(payload.get("current_password", ""))
    new_password = str(payload.get("new_password", ""))

    if not current_password or not new_password:
        return error_response("Both current and new passwords are required.", 400)
    if len(new_password) < 8:
        return error_response("New password must be at least 8 characters.", 400)

    user = User.query.get(get_jwt_identity())
    if not user:
        return error_response("User not found.", 404)
    if not user.check_password(current_password):
        return error_response("Current password is incorrect.", 401)

    user.password = new_password
    try:
        log_activity("Password Change", user)
        db.session.commit()
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Password change failed")
        return error_response("Unable to change password.", 500)

    return success_response({}, "Password changed successfully.", 200)


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    user = User.query.get(get_jwt_identity())
    log_activity("Logout", user)
    db.session.commit()
    return success_response({}, "Logout recorded successfully.", 200)
