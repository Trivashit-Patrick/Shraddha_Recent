#!/usr/bin/env python3
"""
Backend API Testing for Shraddha Enterprises B2B E-commerce Platform
Tests all CRUD operations, authentication, and business logic
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class ShraddhaAPITester:
    def __init__(self, base_url: str = "https://product-portal-73.preview.emergentagent.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test data storage
        self.created_product_id = None
        self.created_category_id = None
        self.created_query_id = None

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            self.failed_tests.append({"test": test_name, "details": details})
            print(f"❌ {test_name} - {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, auth_required: bool = False) -> tuple[bool, Dict]:
        """Make HTTP request and validate response"""
        url = f"{self.base_url}/api{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json() if response.content else {}
            except:
                response_data = {"raw_response": response.text}
                
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_admin_authentication(self):
        """Test admin login and authentication flow"""
        print("\n🔐 Testing Admin Authentication...")
        
        # Test login with correct credentials
        success, response = self.make_request(
            'POST', '/auth/login',
            data={"email": "admin@shraddha.com", "password": "admin123"},
            expected_status=200
        )
        
        if success and 'id' in response:
            # Check if token is set in cookies (httpOnly)
            cookies = self.session.cookies.get_dict()
            if 'access_token' in cookies:
                self.admin_token = cookies['access_token']
                self.log_result("Admin login with httpOnly cookie", True)
            else:
                self.log_result("Admin login - missing httpOnly cookie", False, "No access_token cookie set")
        else:
            self.log_result("Admin login", False, f"Response: {response}")
            return False

        # Test /auth/me endpoint
        success, response = self.make_request('GET', '/auth/me', auth_required=True)
        self.log_result("Get current admin info", success, 
                       f"Expected admin data, got: {response}" if not success else "")

        # Test invalid credentials
        success, response = self.make_request(
            'POST', '/auth/login',
            data={"email": "admin@shraddha.com", "password": "wrongpassword"},
            expected_status=401
        )
        self.log_result("Login with invalid credentials (should fail)", success,
                       f"Expected 401, got different response" if not success else "")

        return True

    def test_products_api(self):
        """Test products CRUD operations"""
        print("\n📦 Testing Products API...")
        
        # Get all products
        success, response = self.make_request('GET', '/products')
        if success and 'products' in response:
            products_count = len(response['products'])
            self.log_result(f"Get products list ({products_count} products)", True)
        else:
            self.log_result("Get products list", False, f"Response: {response}")

        # Get categories first for product creation
        success, categories_response = self.make_request('GET', '/categories')
        if not success or not categories_response:
            self.log_result("Get categories for product test", False, "Cannot proceed without categories")
            return False

        categories = categories_response
        if not categories:
            self.log_result("Categories available for product test", False, "No categories found")
            return False

        category = categories[0]
        subcategory = category.get('subcategories', [{}])[0] if category.get('subcategories') else {}

        # Create a new product
        test_product = {
            "name": f"Test Product {datetime.now().strftime('%H%M%S')}",
            "description": "Test product for API validation",
            "category_id": category['id'],
            "subcategory_id": subcategory.get('id', ''),
            "is_featured": True,
            "availability": "in_stock",
            "specifications": [
                {"key": "Test Spec", "value": "Test Value"}
            ],
            "colour_variants": [
                {
                    "colour_name": "Test Red",
                    "hex_code": "#ff0000",
                    "images": ["https://images.unsplash.com/photo-1759830337357-29c472b6746c?w=600"]
                }
            ]
        }

        success, response = self.make_request(
            'POST', '/products', 
            data=test_product, 
            expected_status=200,
            auth_required=True
        )
        
        if success and 'id' in response:
            self.created_product_id = response['id']
            self.log_result("Create new product", True)
        else:
            self.log_result("Create new product", False, f"Response: {response}")
            return False

        # Get specific product
        success, response = self.make_request('GET', f'/products/{self.created_product_id}')
        if success and response.get('name') == test_product['name']:
            self.log_result("Get specific product by ID", True)
        else:
            self.log_result("Get specific product by ID", False, f"Response: {response}")

        # Update product
        updated_product = test_product.copy()
        updated_product['name'] = f"Updated {test_product['name']}"
        updated_product['is_featured'] = False

        success, response = self.make_request(
            'PUT', f'/products/{self.created_product_id}',
            data=updated_product,
            auth_required=True
        )
        
        if success and response.get('name') == updated_product['name']:
            self.log_result("Update product", True)
        else:
            self.log_result("Update product", False, f"Response: {response}")

        # Test product search
        success, response = self.make_request('GET', f'/products?search=Test')
        if success and 'products' in response:
            self.log_result("Search products", True)
        else:
            self.log_result("Search products", False, f"Response: {response}")

        # Test category filter
        success, response = self.make_request('GET', f'/products?category={category["id"]}')
        if success and 'products' in response:
            self.log_result("Filter products by category", True)
        else:
            self.log_result("Filter products by category", False, f"Response: {response}")

        return True

    def test_categories_api(self):
        """Test categories CRUD operations"""
        print("\n📁 Testing Categories API...")
        
        # Get all categories
        success, response = self.make_request('GET', '/categories')
        if success and isinstance(response, list):
            categories_count = len(response)
            self.log_result(f"Get categories list ({categories_count} categories)", True)
        else:
            self.log_result("Get categories list", False, f"Response: {response}")

        # Create a new category
        test_category = {
            "name": f"Test Category {datetime.now().strftime('%H%M%S')}",
            "subcategories": [
                {"name": "Test Subcategory 1"},
                {"name": "Test Subcategory 2"}
            ]
        }

        success, response = self.make_request(
            'POST', '/categories',
            data=test_category,
            expected_status=200,
            auth_required=True
        )
        
        if success and 'id' in response:
            self.created_category_id = response['id']
            self.log_result("Create new category", True)
        else:
            self.log_result("Create new category", False, f"Response: {response}")
            return False

        # Update category
        updated_category = {
            "name": f"Updated {test_category['name']}",
            "subcategories": [
                {"name": "Updated Subcategory 1"},
                {"name": "New Subcategory 3"}
            ]
        }

        success, response = self.make_request(
            'PUT', f'/categories/{self.created_category_id}',
            data=updated_category,
            auth_required=True
        )
        
        if success and response.get('name') == updated_category['name']:
            self.log_result("Update category", True)
        else:
            self.log_result("Update category", False, f"Response: {response}")

        return True

    def test_queries_api(self):
        """Test queries and contact functionality"""
        print("\n📧 Testing Queries API...")
        
        # Create a product query
        test_query = {
            "customer_name": "Test Customer",
            "email": "test@example.com",
            "phone": "+91 9876543210",
            "products": [
                {
                    "product_name": "Test Product",
                    "colour_selected": "Red"
                }
            ],
            "message": "I need pricing for this product",
            "type": "single"
        }

        success, response = self.make_request(
            'POST', '/queries',
            data=test_query,
            expected_status=200
        )
        
        if success and 'id' in response:
            self.created_query_id = response['id']
            self.log_result("Create product query", True)
        else:
            self.log_result("Create product query", False, f"Response: {response}")

        # Create a contact form submission
        test_contact = {
            "name": "Test Contact",
            "email": "contact@example.com",
            "phone": "+91 9876543211",
            "message": "I need information about your services"
        }

        success, response = self.make_request(
            'POST', '/contact',
            data=test_contact
        )
        
        if success and 'message' in response:
            self.log_result("Submit contact form", True)
        else:
            self.log_result("Submit contact form", False, f"Response: {response}")

        # Get queries list (admin only)
        success, response = self.make_request('GET', '/queries', auth_required=True)
        if success and 'queries' in response:
            queries_count = len(response['queries'])
            self.log_result(f"Get queries list ({queries_count} queries)", True)
        else:
            self.log_result("Get queries list", False, f"Response: {response}")

        # Test query filtering
        success, response = self.make_request('GET', '/queries?is_read=false', auth_required=True)
        if success and 'queries' in response:
            self.log_result("Filter unread queries", True)
        else:
            self.log_result("Filter unread queries", False, f"Response: {response}")

        # Mark query as read
        if self.created_query_id:
            success, response = self.make_request(
                'PUT', f'/queries/{self.created_query_id}/read',
                auth_required=True
            )
            if success and 'is_read' in response:
                self.log_result("Toggle query read status", True)
            else:
                self.log_result("Toggle query read status", False, f"Response: {response}")

        return True

    def test_dashboard_api(self):
        """Test dashboard statistics"""
        print("\n📊 Testing Dashboard API...")
        
        success, response = self.make_request('GET', '/dashboard/stats', auth_required=True)
        
        if success and all(key in response for key in ['total_products', 'total_categories', 'total_queries']):
            stats = response
            self.log_result(f"Dashboard stats (Products: {stats['total_products']}, Categories: {stats['total_categories']}, Queries: {stats['total_queries']})", True)
            
            # Verify chart data
            if 'monthly_queries' in stats and isinstance(stats['monthly_queries'], list):
                self.log_result("Monthly queries chart data", True)
            else:
                self.log_result("Monthly queries chart data", False, "Missing or invalid monthly_queries")
                
            if 'top_queried' in stats and isinstance(stats['top_queried'], list):
                self.log_result("Top queried products data", True)
            else:
                self.log_result("Top queried products data", False, "Missing or invalid top_queried")
        else:
            self.log_result("Dashboard stats", False, f"Response: {response}")

    def test_settings_api(self):
        """Test settings functionality"""
        print("\n⚙️ Testing Settings API...")
        
        # Get current settings
        success, response = self.make_request('GET', '/settings')
        if success and 'whatsapp_number' in response:
            self.log_result("Get settings", True)
            current_settings = response
        else:
            self.log_result("Get settings", False, f"Response: {response}")
            return False

        # Update settings
        updated_settings = current_settings.copy()
        updated_settings['company_name'] = f"Updated Company {datetime.now().strftime('%H%M%S')}"
        
        success, response = self.make_request(
            'PUT', '/settings',
            data=updated_settings,
            auth_required=True
        )
        
        if success and response.get('company_name') == updated_settings['company_name']:
            self.log_result("Update settings", True)
        else:
            self.log_result("Update settings", False, f"Response: {response}")

    def test_testimonials_api(self):
        """Test testimonials functionality"""
        print("\n⭐ Testing Testimonials API...")
        
        success, response = self.make_request('GET', '/testimonials')
        if success and isinstance(response, list):
            testimonials_count = len(response)
            self.log_result(f"Get testimonials ({testimonials_count} testimonials)", True)
        else:
            self.log_result("Get testimonials", False, f"Response: {response}")

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        
        # Delete test product
        if self.created_product_id:
            success, _ = self.make_request(
                'DELETE', f'/products/{self.created_product_id}',
                auth_required=True
            )
            self.log_result("Delete test product", success)

        # Delete test category
        if self.created_category_id:
            success, _ = self.make_request(
                'DELETE', f'/categories/{self.created_category_id}',
                auth_required=True
            )
            self.log_result("Delete test category", success)

        # Delete test query
        if self.created_query_id:
            success, _ = self.make_request(
                'DELETE', f'/queries/{self.created_query_id}',
                auth_required=True
            )
            self.log_result("Delete test query", success)

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Shraddha Enterprises API Test Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication must pass first
        if not self.test_admin_authentication():
            print("\n❌ Authentication failed - stopping tests")
            return False
        
        # Run all API tests
        self.test_products_api()
        self.test_categories_api()
        self.test_queries_api()
        self.test_dashboard_api()
        self.test_settings_api()
        self.test_testimonials_api()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  • {failure['test']}: {failure['details']}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    tester = ShraddhaAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())