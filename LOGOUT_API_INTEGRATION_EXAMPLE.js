/**
 * Logout API Integration Example
 * For React/React Native/Flutter WebView
 * 
 * This file shows how to integrate the logout API in your mobile app
 */

// ==========================================
// CONFIGURATION
// ==========================================
const API_BASE_URL = 'https://api-layer.vercel.app';
const LOGOUT_ENDPOINT = '/api/auth/logout';
const GET_TOKEN_ENDPOINT = '/api/get-token';

// ==========================================
// SERVICE: AuthService
// ==========================================

class AuthService {
  /**
   * Get a Bearer Token for testing
   */
  static async getTestToken() {
    try {
      const response = await fetch(`${API_BASE_URL}${GET_TOKEN_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.token) {
        return {
          success: true,
          token: data.data.token,
          user: data.data.user
        };
      } else {
        throw new Error('Failed to get token');
      }
    } catch (error) {
      console.error('Error getting token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sign out / Logout user
   * @param {string} token - JWT Bearer token
   * @returns {Promise<Object>} Logout response
   */
  static async logout(token) {
    try {
      const response = await fetch(`${API_BASE_URL}${LOGOUT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          message: data.message,
          data: data.data
        };
      } else {
        return {
          success: false,
          message: data.message || 'Logout failed',
          error: data
        };
      }
    } catch (error) {
      console.error('Error during logout:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// ==========================================
// REACT EXAMPLE
// ==========================================

/*
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

function ProfileScreen() {
  const navigation = useNavigation();
  const [userToken, setUserToken] = useState(null);

  // Load token on mount (or from Redux/Context)
  useEffect(() => {
    // Get token from your storage/context
    const loadToken = async () => {
      const { token } = await AuthService.getTestToken();
      setUserToken(token);
    };
    loadToken();
  }, []);

  const handleSignOut = async () => {
    // Confirm before logout
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            // Call logout API
            const result = await AuthService.logout(userToken);

            if (result.success) {
              // Show success message (matches your UI)
              Alert.alert('Success', result.message);
              
              // Clear local storage
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              
              // Navigate to login
              navigation.navigate('LoginScreen');
            } else {
              Alert.alert('Error', result.message);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Information</Text>
      
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}
*/

// ==========================================
// COMPLETE LOGIN TO LOGOUT FLOW
// ==========================================

/**
 * Complete Authentication Flow Example
 */
class AuthFlow {
  /**
   * Step 1: Get token (simulating login)
   */
  static async login() {
    console.log('📝 Step 1: Getting token...');
    const tokenResult = await AuthService.getTestToken();
    
    if (tokenResult.success) {
      console.log('✅ Token obtained:', tokenResult.token.substring(0, 20) + '...');
      console.log('👤 User:', tokenResult.user);
      return tokenResult.token;
    } else {
      console.error('❌ Failed to get token:', tokenResult.error);
      return null;
    }
  }

  /**
   * Step 2: Use token (in your app)
   */
  static async useToken(token) {
    console.log('\n📱 Step 2: Using token in your app...');
    console.log('   - Token stored in localStorage/SharedPreferences');
    console.log('   - Token sent with every authenticated API call');
    console.log('   - Example: Authorization: Bearer ' + token.substring(0, 20) + '...');
  }

  /**
   * Step 3: Logout
   */
  static async logout(token) {
    console.log('\n🔓 Step 3: Signing out...');
    const result = await AuthService.logout(token);
    
    if (result.success) {
      console.log('✅ ' + result.message);
      console.log('⏰ Logged out at:', result.data.loggedOutAt);
      console.log('📊 Status:', result.data.status);
      return true;
    } else {
      console.error('❌ Logout failed:', result.message);
      return false;
    }
  }

  /**
   * Complete flow execution
   */
  static async runCompleteFlow() {
    console.log('🚀 Starting complete auth flow...\n');
    
    // Login
    const token = await this.login();
    if (!token) return;

    // Use token
    await this.useToken(token);

    // Logout
    const success = await this.logout(token);
    
    if (success) {
      console.log('\n✨ Complete flow executed successfully!');
    }
  }
}

// ==========================================
// EXPORT FOR USE
// ==========================================

module.exports = {
  AuthService,
  AuthFlow,
  API_BASE_URL
};

// ==========================================
// FOR TESTING IN NODE.JS
// ==========================================

/*
Run this in Node.js to test:

const { AuthFlow } = require('./auth-service');
AuthFlow.runCompleteFlow();

Expected output:
🚀 Starting complete auth flow...

📝 Step 1: Getting token...
✅ Token obtained: eyJhbGciOiJIUzI1NiIsInR5cC...
👤 User: { userId: 1, firstName: 'Test', ... }

📱 Step 2: Using token in your app...
   - Token stored in localStorage/SharedPreferences
   - Token sent with every authenticated API call
   - Example: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cC...

🔓 Step 3: Signing out...
✅ Your sign out success
⏰ Logged out at: 2025-12-30T...
📊 Status: logged_out

✨ Complete flow executed successfully!
*/
