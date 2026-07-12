import json
from flask import jsonify
from werkzeug.exceptions import HTTPException


def register_error_handlers(app):
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        response = error.get_response()
        response.data = json.dumps({
            "success": False,
            "message": error.description,
        })
        response.content_type = "application/json"
        return response

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Unhandled exception")
        return jsonify({
            "success": False,
            "message": "An unexpected error occurred. Please try again later.",
        }), 500
