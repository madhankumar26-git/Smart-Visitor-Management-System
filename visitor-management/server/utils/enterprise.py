import io
import logging
import smtplib
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from email.message import EmailMessage
from flask import current_app, request
from database import db
from models import ActivityLog, Notification, CompanySettings, User
from socket_service import socketio


def log_activity(action, user=None, details=None):
    """Persist audit activity without allowing audit failures to affect business actions."""
    try:
        log = ActivityLog(
            user_id=getattr(user, "id", None), user_name=getattr(user, "full_name", "System"),
            role=getattr(user, "role", "system"), action=action, details=details,
            ip_address=request.headers.get("X-Forwarded-For", request.remote_addr) if request else None,
        )
        db.session.add(log)
    except Exception:
        current_app.logger.exception("Unable to create activity log")


def create_notification(title, message, audience="all"):
    try:
        notification = Notification(audience=audience, title=title, message=message)
        db.session.add(notification)
        db.session.commit()
        socketio.emit("notification", notification.to_dict())
        return notification
    except Exception:
        db.session.rollback()
        current_app.logger.exception("Unable to create notification")
        return None


def company_settings():
    settings = CompanySettings.query.first()
    if not settings:
        settings = CompanySettings()
        db.session.add(settings)
        db.session.commit()
    return settings


def format_india_time(value):
    if not value:
        return "Pending"
    utc_value = value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)
    return utc_value.astimezone(ZoneInfo("Asia/Kolkata")).strftime("%d-%m-%Y %H:%M:%S")


def india_today():
    return datetime.now(ZoneInfo("Asia/Kolkata")).date()


def india_hour(value):
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(ZoneInfo("Asia/Kolkata")).hour


def get_logo_image(logo_source):
    if not logo_source:
        return None
    try:
        import base64
        from urllib.request import urlopen
        from reportlab.lib.utils import ImageReader
        if logo_source.startswith("data:image"):
            return ImageReader(io.BytesIO(base64.b64decode(logo_source.split(",", 1)[1])))
        if logo_source.startswith(("http://", "https://")):
            return ImageReader(io.BytesIO(urlopen(logo_source, timeout=5).read()))
        return ImageReader(logo_source)
    except Exception:
        current_app.logger.warning("Company logo could not be loaded for visitor pass")
        return None


def _send_email(recipient, subject, text, attachment=None):
    config = current_app.config
    if not recipient or not config.get("SMTP_HOST") or not config.get("SMTP_FROM_EMAIL"):
        current_app.logger.info("Email not sent: SMTP is not configured")
        return False
    try:
        message = EmailMessage()
        message["From"] = config["SMTP_FROM_EMAIL"]
        message["To"] = recipient
        message["Subject"] = subject
        message.set_content(text)
        if attachment:
            filename, content = attachment
            message.add_attachment(content, maintype="application", subtype="pdf", filename=filename)
        with smtplib.SMTP(config["SMTP_HOST"], config["SMTP_PORT"], timeout=15) as smtp:
            if config.get("SMTP_USE_TLS"):
                smtp.starttls()
            if config.get("SMTP_USERNAME"):
                smtp.login(config["SMTP_USERNAME"], config["SMTP_PASSWORD"])
            smtp.send_message(message)
        return True
    except Exception:
        current_app.logger.exception("Email delivery failed")
        return False


def send_registration_notification(visitor):
    employee = User.query.filter(User.full_name.ilike(visitor.person_to_meet)).first()
    if not employee:
        current_app.logger.warning("No employee email found for visitor meeting host: %s", visitor.person_to_meet)
        return False
    return _send_email(employee.email, f"Visitor registration: {visitor.visitor_name}", f"Visitor: {visitor.visitor_name}\nCompany: {visitor.company_name or '—'}\nPurpose: {visitor.purpose}\nPerson to Meet: {visitor.person_to_meet}\nVisit Date: {visitor.visit_date}\nCheck-In Time: {visitor.check_in_time.isoformat() if visitor.check_in_time else 'Pending approval'}")


def generate_visitor_pass_pdf(visitor):
    """Create a branded PDF pass with QR code when reportlab/qrcode are installed."""
    try:
        import qrcode
        from reportlab.lib.units import mm
        from reportlab.lib.utils import ImageReader
        from reportlab.pdfgen import canvas
        settings = company_settings()
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=(105 * mm, 148 * mm))
        pdf.setFillColorRGB(0.07, 0.25, 0.55)
        pdf.rect(0, 128 * mm, 105 * mm, 20 * mm, fill=1, stroke=0)
        pdf.setFillColorRGB(1, 1, 1)
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(12 * mm, 136 * mm, settings.company_name)
        logo = get_logo_image(settings.company_logo)
        if logo:
            pdf.drawImage(logo, 78 * mm, 129 * mm, 15 * mm, 15 * mm, preserveAspectRatio=True, mask="auto")
        else:
            pdf.circle(85.5 * mm, 136.5 * mm, 7 * mm, fill=1, stroke=0)
            pdf.setFillColorRGB(0.07, 0.25, 0.55)
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawCentredString(85.5 * mm, 133.5 * mm, "SV")
        pdf.setFillColorRGB(0, 0, 0)
        pdf.setFont("Helvetica", 9)
        y = 121
        for label, value in [("Visitor ID", visitor.visitor_id), ("Visitor Name", visitor.visitor_name), ("Company", visitor.company_name or "-"), ("Purpose", visitor.purpose), ("Person To Meet", visitor.person_to_meet), ("Visit Date", visitor.visit_date.strftime("%d-%m-%Y") if visitor.visit_date else "-"), ("Check-In Time", format_india_time(visitor.check_in_time))]:
            pdf.drawString(12 * mm, y * mm, f"{label}: {value}")
            y -= 8
        qr = qrcode.make(visitor.qr_code or visitor.visitor_id)
        qr_buffer = io.BytesIO(); qr.save(qr_buffer, format="PNG"); qr_buffer.seek(0)
        pdf.drawImage(ImageReader(qr_buffer), 58 * mm, 18 * mm, 35 * mm, 35 * mm, mask="auto")
        pdf.setFont("Helvetica", 7); pdf.drawString(12 * mm, 12 * mm, "Present this pass at the security desk.")
        pdf.save()
        buffer.seek(0)
        return buffer.getvalue()
    except Exception:
        current_app.logger.exception("Visitor pass PDF generation failed")
        return None


def send_visitor_pass(visitor):
    pdf = generate_visitor_pass_pdf(visitor)
    if not pdf:
        return False
    settings = company_settings()
    return _send_email(visitor.email, f"Your visitor pass - {settings.company_name}", f"Your visit has been approved. Please find your QR visitor pass attached.", (f"visitor-pass-{visitor.visitor_id}.pdf", pdf))
