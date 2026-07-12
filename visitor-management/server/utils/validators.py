import re
from datetime import datetime, timedelta
from typing import Any

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
VISITOR_TYPES = {"Employee", "Vendor", "Interview", "Guest", "Delivery"}
VISITOR_STATUS = {"Pending", "Approved", "Rejected", "Checked-In", "Checked-Out", "Cancelled"}


def validate_registration_data(data: dict[str, Any]) -> tuple[list[str], str, str, str, str]:
    errors: list[str] = []
    full_name = str(data.get("full_name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))
    role = str(data.get("role", "security")).strip().lower()

    if not full_name:
        errors.append("Full name is required.")
    if not email:
        errors.append("Email is required.")
    elif not EMAIL_PATTERN.match(email):
        errors.append("A valid email address is required.")
    if not password:
        errors.append("Password is required.")
    elif len(password) < 8:
        errors.append("Password must be at least 8 characters.")
    if role not in ("admin", "security"):
        errors.append("Role must be 'admin' or 'security'.")

    return errors, full_name, email, password, role


def validate_login_data(data: dict[str, Any]) -> tuple[list[str], str, str]:
    errors: list[str] = []
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email:
        errors.append("Email is required.")
    elif not EMAIL_PATTERN.match(email):
        errors.append("A valid email address is required.")
    if not password:
        errors.append("Password is required.")

    return errors, email, password


def parse_date(value: Any):
    if not value:
        return None
    try:
        if isinstance(value, datetime):
            return value.date()
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except ValueError:
        return None


def validate_visitor_payload(data: dict[str, Any], partial: bool = False):
    errors: list[str] = []
    visitor_name = str(data.get("visitor_name", "")).strip() if "visitor_name" in data else None
    company_name = str(data.get("company_name", "")).strip() or None if "company_name" in data else None
    mobile_number = str(data.get("mobile_number", "")).strip() if "mobile_number" in data else None
    email = str(data.get("email", "")).strip().lower() if "email" in data else None
    person_to_meet = str(data.get("person_to_meet", "")).strip() if "person_to_meet" in data else None
    department = str(data.get("department", "")).strip() if "department" in data else None
    purpose = str(data.get("purpose", "")).strip() if "purpose" in data else None
    visitor_type = str(data.get("visitor_type", "")).strip() if "visitor_type" in data else None
    id_proof_type = str(data.get("id_proof_type", "")).strip() if "id_proof_type" in data else None
    id_proof_number = str(data.get("id_proof_number", "")).strip() if "id_proof_number" in data else None
    vehicle_number = str(data.get("vehicle_number", "")).strip() or None if "vehicle_number" in data else None
    photo = str(data.get("photo", "")).strip() or None if "photo" in data else None
    visit_date = parse_date(data.get("visit_date")) if "visit_date" in data else None
    status = str(data.get("status", "")).strip() if "status" in data else None
    remarks = str(data.get("remarks", "")).strip() or None if "remarks" in data else None

    required_fields = {
        "visitor_name": visitor_name,
        "mobile_number": mobile_number,
        "person_to_meet": person_to_meet,
        "department": department,
        "purpose": purpose,
        "visitor_type": visitor_type,
        "id_proof_type": id_proof_type,
        "id_proof_number": id_proof_number,
    }

    if not partial:
        for field_name, field_value in required_fields.items():
            if not field_value:
                errors.append(f"{field_name.replace('_', ' ').title()} is required.")
        if visit_date is None:
            errors.append("Visit date is required and must be in YYYY-MM-DD format.")
    else:
        if "visit_date" in data and data.get("visit_date") and visit_date is None:
            errors.append("Visit date must be in YYYY-MM-DD format.")

    if mobile_number is not None and mobile_number != "" and not mobile_number.isdigit():
        errors.append("Mobile number must contain only digits.")

    if email is not None and email != "" and not EMAIL_PATTERN.match(email):
        errors.append("A valid email address is required.")

    if visitor_type is not None and visitor_type != "" and visitor_type not in VISITOR_TYPES:
        errors.append(f"Visitor type must be one of: {', '.join(sorted(VISITOR_TYPES))}.")

    if status is not None and status != "" and status not in VISITOR_STATUS:
        errors.append(f"Status must be one of: {', '.join(sorted(VISITOR_STATUS))}.")

    visitor_data = {}
    if visitor_name is not None:
        visitor_data["visitor_name"] = visitor_name
    if "company_name" in data:
        visitor_data["company_name"] = company_name
    if mobile_number is not None:
        visitor_data["mobile_number"] = mobile_number
    if email is not None:
        visitor_data["email"] = email
    if person_to_meet is not None:
        visitor_data["person_to_meet"] = person_to_meet
    if department is not None:
        visitor_data["department"] = department
    if purpose is not None:
        visitor_data["purpose"] = purpose
    if visitor_type is not None:
        visitor_data["visitor_type"] = visitor_type
    if id_proof_type is not None:
        visitor_data["id_proof_type"] = id_proof_type
    if id_proof_number is not None:
        visitor_data["id_proof_number"] = id_proof_number
    if "vehicle_number" in data:
        visitor_data["vehicle_number"] = vehicle_number
    if "photo" in data:
        visitor_data["photo"] = photo
    if "visit_date" in data:
        visitor_data["visit_date"] = visit_date
    if status is not None:
        visitor_data["status"] = status
    if "remarks" in data:
        visitor_data["remarks"] = remarks

    return errors, visitor_data


def validate_search_params(data: dict[str, Any]):
    errors: list[str] = []
    filters = {
        "visitor_name": str(data.get("visitor_name", "")).strip(),
        "mobile_number": str(data.get("mobile_number", "")).strip(),
        "company_name": str(data.get("company_name", "")).strip(),
        "email": str(data.get("email", "")).strip(),
        "department": str(data.get("department", "")).strip(),
        "person_to_meet": str(data.get("person_to_meet", "")).strip(),
        "status": str(data.get("status", "")).strip(),
        "visitor_type": str(data.get("visitor_type", "")).strip(),
    }
    date_value = data.get("date")
    parsed_date = parse_date(date_value)
    if date_value and not parsed_date:
        errors.append("Date must be in YYYY-MM-DD format.")
    filters["start_date"] = parsed_date
    filters["end_date"] = parsed_date

    if filters["status"] and filters["status"] not in VISITOR_STATUS:
        errors.append(f"Status must be one of: {', '.join(sorted(VISITOR_STATUS))}.")
    if filters["visitor_type"] and filters["visitor_type"] not in VISITOR_TYPES:
        errors.append(f"Visitor type must be one of: {', '.join(sorted(VISITOR_TYPES))}.")

    return errors, filters


def validate_filter_params(data: dict[str, Any]):
    errors: list[str] = []
    filters = {
        "visitor_name": str(data.get("visitor_name", "")).strip(),
        "mobile_number": str(data.get("mobile_number", "")).strip(),
        "company_name": str(data.get("company_name", "")).strip(),
        "email": str(data.get("email", "")).strip(),
        "department": str(data.get("department", "")).strip(),
        "person_to_meet": str(data.get("person_to_meet", "")).strip(),
        "status": str(data.get("status", "")).strip(),
        "visitor_type": str(data.get("visitor_type", "")).strip(),
    }
    range_type = str(data.get("range", "")).strip().lower()
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    from utils.enterprise import india_today
    today = india_today()

    if range_type == "today":
        filters["start_date"] = filters["end_date"] = today
    elif range_type == "yesterday":
        filters["start_date"] = filters["end_date"] = today - timedelta(days=1)
    elif range_type in {"last_7_days", "this_week"}:
        filters["start_date"] = today - timedelta(days=today.weekday())
        filters["end_date"] = today
    elif range_type == "this_month":
        filters["start_date"] = today.replace(day=1)
        filters["end_date"] = today
    else:
        filters["start_date"] = parse_date(start_date)
        filters["end_date"] = parse_date(end_date)

    if start_date and not filters["start_date"]:
        errors.append("Start date must be in YYYY-MM-DD format.")
    if end_date and not filters["end_date"]:
        errors.append("End date must be in YYYY-MM-DD format.")
    if filters["status"] and filters["status"] not in VISITOR_STATUS:
        errors.append(f"Status must be one of: {', '.join(sorted(VISITOR_STATUS))}.")
    if filters["visitor_type"] and filters["visitor_type"] not in VISITOR_TYPES:
        errors.append(f"Visitor type must be one of: {', '.join(sorted(VISITOR_TYPES))}.")

    return filters, errors
