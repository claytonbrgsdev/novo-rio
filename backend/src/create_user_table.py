import sys
import os

# Adicionar diretório atual ao path do Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.db import Base
from src.models.user import User

# Criar o engine e conectar ao banco de dados SQLite
engine = create_engine("sqlite:///./novo_rio.db")

# Criar a tabela de usuários se não existir
Base.metadata.create_all(bind=engine)

# Criar uma sessão para interagir com o banco de dados
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Criar um usuário administrador para testes
admin_user = User(
    email="admin@example.com",
    hashed_password=User.hash_password("senha123"),
    is_active=True,
    player_id=1
)

# Verificar se o usuário já existe antes de adicionar
existing_user = db.query(User).filter(User.email == admin_user.email).first()
if not existing_user:
    db.add(admin_user)
    db.commit()
    print(f"Usuário administrador criado: {admin_user.email}")
else:
    print(f"Usuário administrador já existe: {existing_user.email}")

# Fechar a sessão
db.close()

print("Tabela de usuários criada/verificada com sucesso!")
