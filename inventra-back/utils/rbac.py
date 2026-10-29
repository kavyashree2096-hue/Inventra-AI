from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from models import User

def get_current_authenticated_user():
    """
    Safely retrieves the current authenticated user if a valid JWT is provided,
    otherwise returns None without raising an exception.
    """
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(int(user_id))
    except Exception:
        pass
    return None

def role_required(*allowed_roles):
    """
    Enforces role-based access control (RBAC).
    Returns 401 if unauthenticated, 403 if user's role is not in allowed_roles.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception:
                return jsonify({
                    'error': 'Authentication Required',
                    'message': 'A valid Bearer JWT token is required to access this endpoint.',
                    'privacy_shield': True
                }), 401

            user_id = get_jwt_identity()
            user = User.query.get(int(user_id))
            if not user or user.status != 'Active':
                return jsonify({
                    'error': 'Account Inactive',
                    'message': 'Your account is inactive or not found.',
                    'privacy_shield': True
                }), 403

            if user.role not in allowed_roles:
                return jsonify({
                    'error': 'Access Restricted',
                    'message': f'Privacy & Security Shield: This feature requires {", ".join(allowed_roles)} privileges. Your current role is {user.role}.',
                    'required_roles': list(allowed_roles),
                    'user_role': user.role,
                    'privacy_shield': True
                }), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
