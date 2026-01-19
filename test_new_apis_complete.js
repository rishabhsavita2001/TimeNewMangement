const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test token (you can get from /api/get-token)
const TEST_TOKEN = 'test-token';
const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
};

async function testNewAPIs() {
    console.log('🚀 Testing New APIs Implementation');
    console.log('===================================');
    
    const newAPIs = [
        // Notification APIs
        {
            name: 'PUT /api/notifications/:id/read',
            method: 'PUT',
            url: '/api/notifications/1/read',
            description: 'Mark notification as read (PUT method)'
        },
        
        // Company Settings APIs
        {
            name: 'PUT /api/company/website',
            method: 'PUT',
            url: '/api/company/website',
            body: { website: 'https://example.com' },
            description: 'Update company website'
        },
        {
            name: 'PUT /api/company/registration-number',
            method: 'PUT',
            url: '/api/company/registration-number',
            body: { registration_number: 'REG123456', country_code: 'US' },
            description: 'Update company registration number'
        },
        {
            name: 'PUT /api/company/timezone',
            method: 'PUT',
            url: '/api/company/timezone',
            body: { timezone: 'America/New_York', auto_detect: false },
            description: 'Update company timezone'
        },
        {
            name: 'PUT /api/company/theme-color',
            method: 'PUT',
            url: '/api/company/theme-color',
            body: { primary_color: '#007bff', secondary_color: '#6c757d' },
            description: 'Update company theme colors'
        },
        {
            name: 'PUT /api/company/additional-info',
            method: 'PUT',
            url: '/api/company/additional-info',
            body: { 
                description: 'A technology company', 
                founding_year: 2020, 
                employee_count: '50-100',
                company_type: 'Technology'
            },
            description: 'Update company additional info'
        },
        {
            name: 'GET /api/company/working-hours',
            method: 'GET',
            url: '/api/company/working-hours',
            description: 'Get company working hours'
        },
        {
            name: 'PUT /api/company/working-hours',
            method: 'PUT',
            url: '/api/company/working-hours',
            body: { 
                working_hours: {
                    monday: { start: "09:00", end: "17:00", is_working_day: true },
                    tuesday: { start: "09:00", end: "17:00", is_working_day: true }
                },
                break_duration: 60 
            },
            description: 'Update company working hours'
        },
        {
            name: 'GET /api/company/preferences',
            method: 'GET',
            url: '/api/company/preferences',
            description: 'Get company preferences'
        },
        {
            name: 'PUT /api/company/preferences',
            method: 'PUT',
            url: '/api/company/preferences',
            body: {
                notifications: { email_notifications: true, push_notifications: true },
                time_tracking: { auto_break_reminder: true, overtime_alerts: true }
            },
            description: 'Update company preferences'
        },
        {
            name: 'GET /api/company/localization',
            method: 'GET',
            url: '/api/company/localization',
            description: 'Get company localization settings'
        },
        {
            name: 'PUT /api/company/localization',
            method: 'PUT',
            url: '/api/company/localization',
            body: {
                language: 'en',
                currency: 'USD',
                date_format: 'MM/dd/yyyy',
                time_format: '12'
            },
            description: 'Update company localization'
        },
        {
            name: 'POST /api/company/export-data',
            method: 'POST',
            url: '/api/company/export-data',
            body: { data_types: ['users', 'time_entries'], format: 'json' },
            description: 'Export company data'
        },
        {
            name: 'POST /api/company/reset-settings',
            method: 'POST',
            url: '/api/company/reset-settings',
            body: { confirm: true, reset_type: 'preferences' },
            description: 'Reset company settings'
        },
        {
            name: 'DELETE /api/company/delete-account',
            method: 'DELETE',
            url: '/api/company/delete-account',
            body: { confirm: true, password: 'testpassword' },
            description: 'Delete company account'
        }
    ];

    let passCount = 0;
    let failCount = 0;

    for (const api of newAPIs) {
        try {
            console.log(`\n🧪 Testing: ${api.name}`);
            console.log(`   ${api.description}`);
            
            let response;
            const config = { headers };
            
            switch (api.method) {
                case 'GET':
                    response = await axios.get(`${BASE_URL}${api.url}`, config);
                    break;
                case 'POST':
                    response = await axios.post(`${BASE_URL}${api.url}`, api.body || {}, config);
                    break;
                case 'PUT':
                    response = await axios.put(`${BASE_URL}${api.url}`, api.body || {}, config);
                    break;
                case 'DELETE':
                    response = await axios.delete(`${BASE_URL}${api.url}`, { ...config, data: api.body });
                    break;
            }

            if (response.status === 200 || response.status === 201) {
                console.log(`   ✅ Status: ${response.status} - SUCCESS`);
                if (response.data.success) {
                    console.log(`   📋 Response: ${response.data.message || 'OK'}`);
                }
                passCount++;
            } else {
                console.log(`   ⚠️  Status: ${response.status} - Unexpected`);
                failCount++;
            }

        } catch (error) {
            console.log(`   ❌ FAILED: ${error.response?.status || 'Network Error'} - ${error.response?.data?.message || error.message}`);
            failCount++;
        }
    }

    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Total: ${passCount + failCount}`);
    
    if (passCount === newAPIs.length) {
        console.log('\n🎉 All new APIs are working correctly!');
    } else {
        console.log('\n⚠️  Some APIs need attention or server needs to be running');
    }
}

// Enhanced Leave Request Test with Notification Preferences
async function testEnhancedLeaveRequest() {
    console.log('\n🍃 Testing Enhanced Leave Request with Notifications');
    console.log('===================================================');
    
    try {
        const enhancedLeaveRequest = {
            leaveTypeId: 'paid_leave',
            startDate: '2026-02-01',
            endDate: '2026-02-03',
            reason: 'Family vacation',
            isHalfDay: false,
            emergency_contact: 'John Doe - +1234567890',
            notes: 'Will be available by email if urgent',
            notification_preferences: {
                email: true,
                push: true,
                sms: false
            }
        };

        const response = await axios.post(
            `${BASE_URL}/api/me/leave-requests`,
            enhancedLeaveRequest,
            { headers }
        );

        console.log('✅ Enhanced leave request created successfully');
        console.log('📋 Response includes notification tracking:');
        console.log('   - Notification preferences:', response.data.data?.notifications_created?.notification_preferences || 'Missing');
        console.log('   - Manager notification:', response.data.data?.notifications_created?.manager_notification || false);
        console.log('   - HR notification:', response.data.data?.notifications_created?.hr_notification || false);

    } catch (error) {
        console.log(`❌ Enhanced leave request failed: ${error.response?.data?.message || error.message}`);
    }
}

if (require.main === module) {
    testNewAPIs().then(() => {
        return testEnhancedLeaveRequest();
    });
}

module.exports = { testNewAPIs, testEnhancedLeaveRequest };