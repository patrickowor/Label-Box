import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import bcrypt
from datetime import datetime, timedelta
from datetime import timezone
import os

DAYS = 2
MINUTES = 30

class AuthHandler():
    security = HTTPBearer()
    salt = bcrypt.gensalt() 
    secret = os.environ.get("SECRET")

    def get_password_hash(self, password : str):
        return bcrypt.hashpw(password=password.encode('utf-8'), salt=self.salt)

    def verify_password(self, plain_password, hashed_password):
        return bcrypt.checkpw(password = plain_password.encode("utf-8") , hashed_password = hashed_password if isinstance(hashed_password, bytes) else hashed_password.encode("utf-8"))

    def encode_token(self, user_id):
        payload = {
            'exp': datetime.now(timezone.utc) + timedelta(days=DAYS, minutes=MINUTES),
            'iat': datetime.now(timezone.utc),
            'sub': user_id
        }
        return jwt.encode(
            payload,
            self.secret,
            algorithm='HS256'
        )

    def decode_token(self, token):
        try:
            payload = jwt.decode(token, self.secret, algorithms=['HS256'])
            return payload['sub']
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail='Signature has expired')
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail='Invalid token')

    def auth_wrapper(self, auth: HTTPAuthorizationCredentials = Security(security)):
        return self.decode_token(auth.credentials)
    
auth_handler = AuthHandler()        
"""
::: to encode a token  -> 
token = auth_handler.encode_token(user['username'])

::: jwt protected route
def protected(username=Depends(auth_handler.auth_wrapper)):
    return { 'name': username }
"""
