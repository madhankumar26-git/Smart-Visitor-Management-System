from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from utils.responses import error_response


def role_required(allowed_roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            role = claims.get("role")
            if role not in allowed_roles:
                return error_response("Permission denied.", 403)
            return func(*args, **kwargs)

        return wrapper

    return decorator
