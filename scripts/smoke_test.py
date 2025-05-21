#!/usr/bin/env python3
"""
Smoke test script for the Novo Rio API.

This script performs a series of tests against the API to ensure that the main endpoints
are functioning correctly. It's designed to be run against a staging or production environment.
"""

import os
import sys
import json
import requests
from typing import Dict, Any, Optional

# Configuration
BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000/api/v1")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# Global session to maintain cookies/headers
session = requests.Session()


def print_step(step: str) -> None:
    """Print a step header."""
    print(f"\n{'-' * 80}")
    print(f"STEP: {step}")
    print(f"{'-' * 80}")


def make_request(method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
    """Make an HTTP request and handle the response."""
    url = f"{BASE_URL.rstrip('/')}/{endpoint.lstrip('/')}"
    
    print(f"\n{method.upper()} {url}")
    if 'json' in kwargs:
        print("Request body:", json.dumps(kwargs['json'], indent=2))
    
    try:
        response = session.request(method, url, **kwargs)
        print(f"Status: {response.status_code}")
        
        if response.text:
            try:
                print("Response:", json.dumps(response.json(), indent=2))
            except ValueError:
                print("Response (text):", response.text)
        
        response.raise_for_status()
        return response.json() if response.text else {}
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        sys.exit(1)


def login() -> str:
    """Authenticate and get an access token."""
    print_step("Authenticating")
    data = {"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    response = make_request("POST", "auth/login", json=data)
    
    token = response.get("access_token")
    if not token:
        print("Error: No token received")
        sys.exit(1)
    
    # Set the token in the session headers
    session.headers.update({"Authorization": f"Bearer {token}"})
    return token


def test_species_crud() -> None:
    """Test CRUD operations for species."""
    print_step("Testing Species CRUD")
    
    # Create a new species
    species_data = {
        "name": "Test Species",
        "scientific_name": "Testus species",
        "description": "A test species",
        "days_to_maturity": 90,
        "water_requirement": "medium",
        "sun_requirement": "full_sun",
        "soil_type": "loamy"
    }
    
    # Create
    print("Creating species...")
    created = make_request("POST", "species/", json=species_data)
    species_id = created["id"]
    
    # Read
    print("\nGetting species...")
    retrieved = make_request("GET", f"species/{species_id}")
    
    # Update
    print("\nUpdating species...")
    update_data = {"description": "Updated description"}
    updated = make_request("PATCH", f"species/{species_id}", json=update_data)
    
    # List
    print("\nListing species...")
    make_request("GET", "species/")
    
    # Delete
    print("\nDeleting species...")
    make_request("DELETE", f"species/{species_id}")
    
    # Verify deletion
    print("\nVerifying deletion...")
    make_request("GET", f"species/{species_id}", expected_status=404)


def test_planting_crud() -> None:
    """Test CRUD operations for plantings."""
    print_step("Testing Planting CRUD")
    
    # First, create a species to use for planting
    species_data = {
        "name": "Test Species for Planting",
        "scientific_name": "Planting testus",
        "days_to_maturity": 60
    }
    species = make_request("POST", "species/", json=species_data)
    
    # Create a new planting
    planting_data = {
        "species_id": species["id"],
        "quadrant_id": 1,  # Assuming quadrant 1 exists
        "slot_index": 1
    }
    
    # Create
    print("Creating planting...")
    created = make_request("POST", "plantings/", json=planting_data)
    planting_id = created["id"]
    
    # Read
    print("\nGetting planting...")
    make_request("GET", f"plantings/{planting_id}")
    
    # Update
    print("\nUpdating planting...")
    update_data = {"notes": "Updated notes"}
    make_request("PATCH", f"plantings/{planting_id}", json=update_data)
    
    # List
    print("\nListing plantings...")
    make_request("GET", "plantings/")
    
    # Delete
    print("\nDeleting planting...")
    make_request("DELETE", f"plantings/{planting_id}")
    
    # Clean up species
    make_request("DELETE", f"species/{species['id']}")


def test_health_check() -> None:
    """Test the health check endpoint."""
    print_step("Testing Health Check")
    make_request("GET", "health")


def main() -> None:
    """Run all smoke tests."""
    print("=" * 80)
    print("NOVO RIO API SMOKE TEST")
    print(f"Testing API at: {BASE_URL}")
    print("=" * 80)
    
    try:
        # Run tests
        test_health_check()
        login()
        test_species_crud()
        test_planting_crud()
        
        print("\n" + "=" * 80)
        print("✅ ALL SMOKE TESTS PASSED SUCCESSFULLY!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ SMOKE TEST FAILED: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
