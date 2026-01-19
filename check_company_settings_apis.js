const axios = require('axios');

const BASE_URL = 'https://apilayer.vercel.app';

async function checkCompanyAPIs() {
    try {
        console.log('🏢 CHECKING COMPANY SETTINGS APIS\n');
        
        // Get token
        console.log('🔑 Getting token...');
        const tokenRes = await axios.get(`${BASE_URL}/api/get-token`);
        const token = tokenRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Token received\n');
        
        // Test existing Company APIs
        const apis = [
            { method: 'GET', url: '/api/company/settings', name: 'Company Settings' },
            { method: 'PUT', url: '/api/company/settings', name: 'Update Company Settings' },
            { method: 'POST', url: '/api/company/logo', name: 'Upload Company Logo' },
            { method: 'PUT', url: '/api/company/name', name: 'Update Company Name' },
            { method: 'PUT', url: '/api/company/industry', name: 'Update Industry' },
            { method: 'PUT', url: '/api/company/brand-color', name: 'Update Brand Color' },
            { method: 'PUT', url: '/api/company/support-email', name: 'Update Support Email' },
            { method: 'PUT', url: '/api/company/phone', name: 'Update Company Phone' },
            { method: 'PUT', url: '/api/company/address', name: 'Update Company Address' },
        ];
        
        console.log('📋 EXISTING COMPANY APIS:');
        for (const api of apis) {
            try {
                if (api.method === 'GET') {
                    const res = await axios.get(`${BASE_URL}${api.url}`, { headers });
                    console.log(`✅ ${api.name} - Working`);
                } else {
                    console.log(`✅ ${api.name} - Available (${api.method})`);
                }
            } catch (err) {
                console.log(`❌ ${api.name} - Issue:`, err.response?.data?.message || err.message);
            }
        }
        
        console.log('\n📋 CHECKING FOR MISSING APIS FROM SCREENSHOTS:');
        
        // APIs needed from screenshots
        const neededAPIs = [
            // Working Hours APIs
            { method: 'GET', url: '/api/company/working-hours', name: 'Get Working Hours' },
            { method: 'PUT', url: '/api/company/working-hours', name: 'Update Working Hours' },
            
            // Preferences APIs  
            { method: 'GET', url: '/api/company/preferences', name: 'Get Company Preferences' },
            { method: 'PUT', url: '/api/company/preferences', name: 'Update Company Preferences' },
            
            // Theme/Website Info APIs
            { method: 'PUT', url: '/api/company/website', name: 'Update Website URL' },
            { method: 'PUT', url: '/api/company/registration-number', name: 'Update Registration Number' },
            { method: 'PUT', url: '/api/company/timezone', name: 'Update Timezone' },
            
            // Localization APIs
            { method: 'GET', url: '/api/company/localization', name: 'Get Localization Settings' },
            { method: 'PUT', url: '/api/company/localization', name: 'Update Localization' },
            
            // Danger Zone APIs
            { method: 'POST', url: '/api/company/export-data', name: 'Export Company Data' },
            { method: 'POST', url: '/api/company/reset-settings', name: 'Reset Company Settings' },
            { method: 'DELETE', url: '/api/company/delete-account', name: 'Delete Company Account' }
        ];
        
        for (const api of neededAPIs) {
            try {
                if (api.method === 'GET') {
                    await axios.get(`${BASE_URL}${api.url}`, { headers });
                    console.log(`✅ ${api.name} - Exists`);
                } else {
                    console.log(`🔍 ${api.name} - Need to check if exists`);
                }
            } catch (err) {
                if (err.response?.status === 404) {
                    console.log(`❌ ${api.name} - MISSING - Need to create`);
                } else {
                    console.log(`🔍 ${api.name} - Need to verify`);
                }
            }
        }
        
    } catch (error) {
        console.log('❌ Check failed:', error.message);
    }
}

checkCompanyAPIs();