from datetime import date, datetime, timedelta
from flask import Blueprint
from sqlalchemy import func
from models import Visitor
from utils.auth import role_required
from utils.responses import success_response
from utils.enterprise import india_today, india_hour


dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


def serialize_visitor(visitor: Visitor) -> dict:
    return {
        "id": visitor.id,
        "visitor_name": visitor.visitor_name,
        "company_name": visitor.company_name,
        "mobile_number": visitor.mobile_number,
        "person_to_meet": visitor.person_to_meet,
        "department": visitor.department,
        "status": visitor.status,
        "visit_date": visitor.visit_date.isoformat() if visitor.visit_date else None,
    }


@dashboard_bp.route("/admin", methods=["GET"])
@role_required(["admin"])
def admin_dashboard():
    today = india_today()
    total_visitors = Visitor.query.count()
    todays_visitors = Visitor.query.filter(Visitor.visit_date == today).count()
    pending_visitors = Visitor.query.filter(Visitor.visit_date == today, Visitor.status == "Pending").count()
    checked_in_visitors = Visitor.query.filter(Visitor.visit_date == today, Visitor.status == "Checked-In").count()
    checked_out_visitors = Visitor.query.filter(Visitor.visit_date == today, Visitor.status == "Checked-Out").count()

    return success_response(
        {
            "today_visitors": todays_visitors,
            "pending_visitors": pending_visitors,
            "checked_in_visitors": checked_in_visitors,
            "checked_out_visitors": checked_out_visitors,
            "visitors_inside": checked_in_visitors,
            "total_visitors": total_visitors,
        },
        "Admin dashboard retrieved.",
        200,
    )


@dashboard_bp.route("/analytics", methods=["GET"])
@role_required(["admin"])
def analytics_dashboard():
    today = india_today()
    start_of_week = today - timedelta(days=today.weekday())
    start_of_month = today.replace(day=1)
    last_seven_days = today - timedelta(days=6)

    total_visitors = Visitor.query.count()
    today_visitors = Visitor.query.filter(Visitor.visit_date == today).count()
    week_visitors = Visitor.query.filter(Visitor.visit_date >= last_seven_days).count()
    month_visitors = Visitor.query.filter(Visitor.visit_date >= start_of_month).count()

    status_counts = {status: Visitor.query.filter(Visitor.status == status).count() for status in Visitor.STATUS_CHOICES}
    type_counts = {visitor_type: Visitor.query.filter(Visitor.visitor_type == visitor_type).count() for visitor_type in Visitor.VISITOR_TYPES}

    department_results = (
        Visitor.query.with_entities(Visitor.department, func.count(Visitor.id))
        .group_by(Visitor.department)
        .order_by(func.count(Visitor.id).desc())
        .all()
    )
    department_counts = [{"department": dept, "count": count} for dept, count in department_results]

    peak_hour_counts = {}
    checked_out_visitors = Visitor.query.filter(Visitor.check_in_time.isnot(None), Visitor.visit_date >= last_seven_days).all()
    for visitor in checked_out_visitors:
        hour = india_hour(visitor.check_in_time)
        peak_hour_counts[str(hour).zfill(2)] = peak_hour_counts.get(str(hour).zfill(2), 0) + 1

    duration_values = [
        (visitor.check_out_time - visitor.check_in_time).total_seconds() / 60
        for visitor in Visitor.query.filter(Visitor.check_in_time.isnot(None), Visitor.check_out_time.isnot(None)).all()
        if visitor.check_in_time and visitor.check_out_time
    ]
    average_visit_duration = round(sum(duration_values) / len(duration_values), 1) if duration_values else 0
    daily_counts = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        daily_counts.append({"date": day.isoformat(), "count": Visitor.query.filter(Visitor.visit_date == day).count()})
    monthly_counts = []
    for offset in range(11, -1, -1):
        month = (today.replace(day=1) - timedelta(days=offset * 28)).replace(day=1)
        next_month = (month.replace(day=28) + timedelta(days=4)).replace(day=1)
        monthly_counts.append({"month": month.strftime("%b %Y"), "count": Visitor.query.filter(Visitor.visit_date >= month, Visitor.visit_date < next_month).count()})

    return success_response(
        {
            "analytics": {
                "total_visitors": total_visitors,
                "today_visitors": today_visitors,
                "week_visitors": week_visitors,
                "month_visitors": month_visitors,
                "status_counts": status_counts,
                "type_counts": type_counts,
                "department_counts": department_counts,
                "peak_hours": [{"hour": hour, "count": count} for hour, count in sorted(peak_hour_counts.items())],
                "daily_counts": daily_counts,
                "monthly_counts": monthly_counts,
                "weekly_trend": daily_counts,
                "average_visit_duration": average_visit_duration,
            }
        },
        "Analytics dashboard retrieved.",
        200,
    )


@dashboard_bp.route("/security", methods=["GET"])
@role_required(["security"])
def security_dashboard():
    today = india_today()
    todays_list = Visitor.query.filter(Visitor.visit_date == today).all()
    waiting_visitors = Visitor.query.filter(Visitor.visit_date == today, Visitor.status == "Pending").count()
    inside_visitors = Visitor.query.filter(Visitor.visit_date == today, Visitor.status == "Checked-In").count()

    return success_response(
        {
            "today_visitors": [serialize_visitor(v) for v in todays_list],
            "waiting_visitors": waiting_visitors,
            "inside_visitors": inside_visitors,
        },
        "Security dashboard retrieved.",
        200,
    )
