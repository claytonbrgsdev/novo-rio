import pytest
from fastapi.testclient import TestClient
import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import timedelta

# Importações necessárias para setup dos testes
from src.db import Base, get_db
from src.main import app
from src.models.user import User
from src.auth.security import create_access_token

# Criar banco de dados de teste em memória
TEST_DATABASE_URL = "sqlite:///./test_auth.db"
engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sobrescrever dependência get_db
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Setup fixture
@pytest.fixture(scope="module")
def test_app():
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    # Criar cliente para testes
    test_client = TestClient(app)
    
    yield test_client
    
    # Cleanup
    Base.metadata.drop_all(bind=engine)

# Fixture para criar usuário de teste
@pytest.fixture(scope="module")
def test_user():
    # Criar banco de dados
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    try:
        # Verificar se o usuário já existe
        user = db.query(User).filter(User.email == "test@user.com").first()
        if not user:
            # Criar usuário para teste
            user = User(
                email="test@user.com",
                hashed_password=User.hash_password("password123"),
                player_id=None
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Gerar token
        token = create_access_token(
            data={"sub": user.email, "user_id": user.id},
            expires_delta=timedelta(minutes=30)
        )
        
        # Retornar usuário e headers
        headers = {"Authorization": f"Bearer {token}"}
        yield user, headers
    finally:
        db.close()

def test_token_consistency(test_app, test_user):
    """
    Testa a consistência dos dados retornados pelos endpoints /auth/validate e /auth/me.
    Garante que ambos retornam o mesmo ID de usuário e dados consistentes.
    """
    user, headers = test_user

    # 1) Validar /auth/validate
    resp1 = test_app.get("/auth/validate", headers=headers)
    assert resp1.status_code == 200, f"Erro ao validar token: {resp1.text}"
    data1 = resp1.json()
    
    # Verificar que o endpoint usa "id" e não apenas "user_id"
    assert "id" in data1, "Endpoint /auth/validate deve retornar 'id' do usuário"
    assert data1["id"] == user.id, f"ID inconsistente: esperado {user.id}, recebido {data1.get('id')}"
    assert data1["email"] == user.email, "Email inconsistente na validação do token"

    # 2) Validar /auth/me
    resp2 = test_app.get("/auth/me", headers=headers)
    assert resp2.status_code == 200, f"Erro no endpoint /auth/me: {resp2.text}"
    data2 = resp2.json()
    
    assert "id" in data2, "Endpoint /auth/me deve retornar 'id' do usuário"
    assert data2["id"] == user.id, f"ID inconsistente em /auth/me: esperado {user.id}, recebido {data2.get('id')}"
    assert data2["email"] == user.email, "Email inconsistente no endpoint /auth/me"

    # 3) IDs devem ser consistentes entre endpoints
    assert data1["id"] == data2["id"], "IDs retornados pelos endpoints são diferentes"
    
    print(f"Dados /auth/validate: {data1}")
    print(f"Dados /auth/me: {data2}")


def test_invalid_token(test_app):
    """
    Testa que endpoints de autenticação rejeitam tokens inválidos com status 401.
    """
    # Cabeçalhos com token inválido
    headers = {"Authorization": "Bearer invalid.token.here"}

    # Testar /auth/validate
    resp1 = test_app.get("/auth/validate", headers=headers)
    assert resp1.status_code == 401, f"Endpoint /auth/validate deve recusar token inválido (status={resp1.status_code})"

    # Testar /auth/me
    resp2 = test_app.get("/auth/me", headers=headers)
    assert resp2.status_code == 401, f"Endpoint /auth/me deve recusar token inválido (status={resp2.status_code})"


def test_login_endpoint(test_app):
    """
    Testa o endpoint de login (/auth/login).
    """
    # Dados para login
    login_data = {
        "username": "test@user.com",  # Nome de usuário é o email no formato OAuth2
        "password": "password123"
    }

    # Tentar login
    response = test_app.post("/auth/login", data=login_data)
    assert response.status_code == 200, f"Falha no login: {response.text}"
    
    # Verificar formato da resposta
    data = response.json()
    assert "access_token" in data, "Resposta de login deve conter 'access_token'"
    assert "token_type" in data, "Resposta de login deve conter 'token_type'"
    assert data["token_type"] == "bearer", "Token type deve ser 'bearer'"
    
    # Verificar que o token é válido
    token = data["access_token"]
    validate_headers = {"Authorization": f"Bearer {token}"}
    validate_resp = test_app.get("/auth/validate", headers=validate_headers)
    assert validate_resp.status_code == 200, "Token gerado no login é inválido"


