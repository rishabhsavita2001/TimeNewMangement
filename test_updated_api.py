import requests
import json

def test_delete_account_api():
    base_url = "https://apilayer-mw09v8dwi-soludoo.vercel.app"
    
    print("🔐 Testing Updated Delete Account API with Email Field")
    print("=" * 55)
    
    try:
        # Step 1: Login to get token
        print("\n1. Logging in to get token...")
        login_response = requests.post(
            f"{base_url}/auth/login",
            headers={"Content-Type": "application/json"},
            json={
                "email": "test@company.com",
                "password": "password123"
            }
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            return
            
        login_data = login_response.json()
        print("✅ Login successful")
        print(f"Token: {login_data['token'][:20]}...")
        
        # Step 2: Test DELETE with email field
        print("\n2. Testing delete account with email field...")
        headers = {
            "Authorization": f"Bearer {login_data['token']}",
            "Content-Type": "application/json"
        }
        
        delete_data = {
            "email": "test@company.com",
            "password": "password123", 
            "confirmPassword": "password123",
            "reason": "Testing updated API with email field"
        }
        
        delete_response = requests.delete(
            f"{base_url}/auth/delete-account",
            headers=headers,
            json=delete_data
        )
        
        delete_result = delete_response.json()
        
        if delete_response.status_code == 200:
            print("✅ DELETE ACCOUNT API WITH EMAIL FIELD IS WORKING!")
            print(f"Status: {delete_response.status_code}")
            print(f"Success: {delete_result.get('success', False)}")
            print(f"Message: {delete_result.get('message', 'No message')}")
        else:
            print("❌ Delete account API test failed")
            print(f"Status: {delete_response.status_code}")
            print(f"Response: {delete_result}")
            
        # Step 3: Test without email field (should fail)
        print("\n3. Testing delete account WITHOUT email field (should fail)...")
        delete_data_no_email = {
            "password": "password123",
            "confirmPassword": "password123", 
            "reason": "Testing without email"
        }
        
        delete_response_no_email = requests.delete(
            f"{base_url}/auth/delete-account",
            headers=headers,
            json=delete_data_no_email
        )
        
        if delete_response_no_email.status_code == 400:
            print("✅ API correctly rejects request without email field")
        else:
            print("❌ API should require email field")
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
    
    print(f"\n🌐 Swagger UI: {base_url}/docs/")
    print("🎉 Test completed!")

if __name__ == "__main__":
    test_delete_account_api()