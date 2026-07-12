import uuid
from datetime import datetime, date, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from database import db


def utc_iso(value):
    """Expose naive SQLite UTC values as explicit UTC ISO-8601 timestamps."""
    return value.replace(tzinfo=timezone.utc).isoformat() if value else None


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(32), nullable=False, default="security")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)

    def __init__(self, full_name: str, email: str, password: str, role: str = "security"):
        self.full_name = full_name
        self.email = email.lower().strip()
        self.password = password
        self.role = role

    @property
    def password(self) -> str:
        raise AttributeError("Password is write-only.")

    @password.setter
    def password(self, raw_password: str) -> None:
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.full_name,
            "email": self.email,
            "role": self.role,
            "created_at": utc_iso(self.created_at),
            "last_login": utc_iso(self.last_login),
        }


class Visitor(db.Model):
    __tablename__ = "visitors"

    VISITOR_TYPES = ("Employee", "Vendor", "Interview", "Guest", "Delivery")
    STATUS_CHOICES = ("Pending", "Approved", "Rejected", "Checked-In", "Checked-Out", "Cancelled")

    id = db.Column(db.Integer, primary_key=True)
    visitor_name = db.Column(db.String(128), nullable=False)
    company_name = db.Column(db.String(128), nullable=True)
    mobile_number = db.Column(db.String(32), nullable=False, index=True)
    email = db.Column(db.String(255), nullable=True, index=True)
    person_to_meet = db.Column(db.String(128), nullable=False, index=True)
    department = db.Column(db.String(128), nullable=False)
    purpose = db.Column(db.String(255), nullable=False)
    visitor_type = db.Column(db.String(32), nullable=False)
    id_proof_type = db.Column(db.String(64), nullable=False)
    id_proof_number = db.Column(db.String(128), nullable=False)
    vehicle_number = db.Column(db.String(64), nullable=True)
    photo = db.Column(db.String(255), nullable=True)
    check_in_time = db.Column(db.DateTime, nullable=True)
    check_out_time = db.Column(db.DateTime, nullable=True)
    visit_date = db.Column(db.Date, nullable=False, default=date.today)
    status = db.Column(db.String(32), nullable=False, default="Pending")
    qr_code = db.Column(db.String(64), unique=True, nullable=True, index=True)
    visitor_id = db.Column(db.String(32), unique=True, nullable=True, index=True)
    remarks = db.Column(db.Text, nullable=True)
    created_by = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    @staticmethod
    def generate_visitor_identifier(visit_date: date | None = None) -> str:
        normalized_date = visit_date or date.today()
        year = normalized_date.year
        prefix = f"VIS-{year}-"
        latest = Visitor.query.filter(Visitor.visitor_id.like(f"{prefix}%"))
        latest = latest.order_by(Visitor.id.desc()).first()

        sequence = 1
        if latest and latest.visitor_id:
            try:
                sequence = int(latest.visitor_id.rsplit("-", 1)[-1]) + 1
            except (ValueError, IndexError):
                sequence = latest.id + 1

        return f"{prefix}{sequence:04d}"

    def to_dict(self):
        return {
            "id": self.id,
            "visitor_id": self.visitor_id,
            "visitor_name": self.visitor_name,
            "company_name": self.company_name,
            "mobile_number": self.mobile_number,
            "email": self.email,
            "person_to_meet": self.person_to_meet,
            "department": self.department,
            "purpose": self.purpose,
            "visitor_type": self.visitor_type,
            "id_proof_type": self.id_proof_type,
            "id_proof_number": self.id_proof_number,
            "vehicle_number": self.vehicle_number,
            "photo": self.photo,
            "check_in_time": utc_iso(self.check_in_time),
            "check_out_time": utc_iso(self.check_out_time),
            "visit_date": self.visit_date.isoformat() if self.visit_date else None,
            "status": self.status,
            "qr_code": self.qr_code,
            "remarks": self.remarks,
            "created_by": self.created_by,
            "created_at": utc_iso(self.created_at),
            "updated_at": utc_iso(self.updated_at),
        }


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True, index=True)
    user_name = db.Column(db.String(128), nullable=False, default="System")
    role = db.Column(db.String(32), nullable=False, default="system")
    action = db.Column(db.String(128), nullable=False, index=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(64), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "user_name": self.user_name, "role": self.role, "action": self.action, "details": self.details, "ip_address": self.ip_address, "created_at": utc_iso(self.created_at)}


class CompanySettings(db.Model):
    __tablename__ = "company_settings"

    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(128), nullable=False, default="Smart Visitor")
    company_logo = db.Column(db.String(512), nullable=True)
    company_address = db.Column(db.String(255), nullable=True)
    phone_number = db.Column(db.String(64), nullable=True)
    email = db.Column(db.String(255), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {"company_name": self.company_name, "company_logo": self.company_logo, "company_address": self.company_address, "phone_number": self.phone_number, "email": self.email, "website": self.website}


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    audience = db.Column(db.String(32), nullable=False, default="all", index=True)
    title = db.Column(db.String(128), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self, is_read=False):
        return {"id": self.id, "audience": self.audience, "title": self.title, "message": self.message, "is_read": is_read, "created_at": utc_iso(self.created_at)}


class NotificationRead(db.Model):
    __tablename__ = "notification_reads"
    __table_args__ = (db.UniqueConstraint("notification_id", "user_id", name="uq_notification_read"),)

    id = db.Column(db.Integer, primary_key=True)
    notification_id = db.Column(db.Integer, db.ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    read_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
