from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db import Base
import hashlib
import os

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    player = relationship("Player", backref="user")

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password for storing."""
        salt = os.urandom(32)  # A 32-byte salt
        key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        # Armazenar salt e senha concatenados (primeiro o salt, depois a chave)
        storage = salt + key
        return storage.hex()

    def verify_password(self, password: str) -> bool:
        """Verify a stored password against a provided password."""
        try:
            # Converter o hash armazenado de string hex para bytes
            storage = bytes.fromhex(self.hashed_password)
            salt = storage[:32]  # Os primeiros 32 bytes são o salt
            key = storage[32:]   # O resto é a chave
            # Verificar se o hash da senha fornecida corresponde ao hash armazenado
            new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
            return key == new_key
        except Exception:
            return False
