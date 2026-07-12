import logging
import os
from os import getenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text
from config import config
from database import db
from models import User
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.security import security_bp
from routes.visitor import visitor_bp
from routes.dashboard import dashboard_bp
from socket_service import socketio
from routes.socket_routes import *
from utils.errors import register_error_handlers


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config)
    app.logger.setLevel(logging.INFO)

    CORS(app, resources={r"/*": {"origins": "*"}})
    db.init_app(app)
    jwt = JWTManager(app)
    socketio.init_app(app, cors_allowed_origins="*")
    register_error_handlers(app)

    def ensure_columns_exist():
        with app.app_context():
            engine = db.engine
            with engine.connect() as connection:
                def has_column(table_name, column_name):
                    result = connection.execute(text(f"PRAGMA table_info({table_name})")).mappings().all()
                    return any(row["name"] == column_name for row in result)

                if has_column("users", "last_login") is False:
                    connection.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
                if has_column("users", "profile_image") is False:
                    connection.execute(text("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255)"))
                if has_column("visitors", "visitor_id") is False:
                    connection.execute(text("ALTER TABLE visitors ADD COLUMN visitor_id VARCHAR(32)"))
                if has_column("visitors", "qr_code") is False:
                    connection.execute(text("ALTER TABLE visitors ADD COLUMN qr_code VARCHAR(64)"))

    ensure_columns_exist()

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token has expired."}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return jsonify({"success": False, "message": reason}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"success": False, "message": reason}), 422

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token has been revoked."}), 401

    @jwt.needs_fresh_token_loader
    def needs_fresh_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Fresh token required."}), 401

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(security_bp)
    app.register_blueprint(visitor_bp)
    app.register_blueprint(dashboard_bp)

    with app.app_context():
        if not os.path.exists(app.instance_path):
            os.makedirs(app.instance_path, exist_ok=True)

        db.create_all()

        default_users = [
            {
                "full_name": "Admin",
                "email": "admin@gmail.com",
                "password": "Admin@123",
                "role": "admin",
            },
            {
                "full_name": "Security",
                "email": "security@gmail.com",
                "password": "Security@123",
                "role": "security",
            },
        ]

        for user_data in default_users:
            existing_user = User.query.filter_by(email=user_data["email"]).first()
            if existing_user:
                app.logger.info("Default user already exists: %s", user_data["email"])
                continue

            user = User(
                full_name=user_data["full_name"],
                email=user_data["email"],
                password=user_data["password"],
                role=user_data["role"],
            )
            db.session.add(user)

        try:
            db.session.commit()
            app.logger.info("Default users initialized successfully")
        except Exception:
            db.session.rollback()
            app.logger.exception("Failed to initialize default users")
            raise

        app.logger.info("Database initialized at %s", app.config["SQLALCHEMY_DATABASE_URI"])

    @app.route("/", methods=["GET"])
    def health_check():
        return jsonify({"success": True, "message": "Smart Visitor Management Backend Running"}), 200

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(getenv("PORT", 5000))
    app.logger.info(f"Starting Smart Visitor Management backend on port {port}")
    socketio.run(
        app,
        host="0.0.0.0",
        port=port,
        debug=app.config.get("DEBUG", False),
        allow_unsafe_werkzeug=True
    )
