import os
from django.core import signing

# Helper function to create encrypted session value
def create_encrypted_session_value(data):
    signed_data = signing.dumps(data, salt=os.environ.get("AUTH_SALT"))
    return signed_data


# Helper function to decrypt session value
def decrypt_session_value(signed_data):
    try:
        data = signing.loads(signed_data, salt=os.environ.get("AUTH_SALT"))
        return data
    except signing.BadSignature:
        return None  # Invalid or tampered session data