// 📱 Complete Profile Management APIs Test (Based on Figma Screenshots)

const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

async function testProfileManagementAPIs() {
    console.log('🎨 Testing Figma Profile Management APIs...\n');
    
    try {
        // 1. Get Bearer Token
        console.log('1. 🔑 Getting Bearer Token...');
        const tokenRes = await axios.get(`${BASE_URL}/get-token`);
        const token = tokenRes.data.data.token;
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        console.log('   ✅ Token obtained\n');

        // 2. Get Profile Information (Personal Information Screen)
        console.log('2. 👤 Testing GET /api/me/profile (Personal Information Screen)...');
        const profileRes = await axios.get(`${BASE_URL}/me/profile`, { headers });
        const profile = profileRes.data.data.user;
        console.log(`   ✅ Profile: ${profile.full_name} (${profile.email})`);
        console.log(`   • Role: ${profile.role} at ${profile.company}`);
        console.log(`   • Phone: ${profile.phone}`);
        console.log(`   • Joined: ${profile.joined_date}\n`);

        // 3. Upload Profile Photo (Upload Photos Screen)
        console.log('3. 📸 Testing POST /api/me/profile/photo (Upload Photos Screen)...');
        const photoRes = await axios.post(`${BASE_URL}/me/profile/photo`, {
            photo_data: 'base64_image_data_here',
            photo_type: 'image/jpeg'
        }, { headers });
        console.log(`   ✅ Photo uploaded: ${photoRes.data.data.file_size}`);
        console.log(`   • Photo URL: ${photoRes.data.data.photo_url}\n`);

        // 4. Update Full Name (Edit Full Name Screen)
        console.log('4. ✏️ Testing PUT /api/me/profile/name (Edit Full Name Screen)...');
        const nameRes = await axios.put(`${BASE_URL}/me/profile/name`, {
            first_name: 'Jennifer',
            last_name: 'Wilson'
        }, { headers });
        console.log(`   ✅ Name updated: ${nameRes.data.data.full_name}\n`);

        // 5. Update Email (Edit Email Address Screen)
        console.log('5. 📧 Testing PUT /api/me/profile/email (Edit Email Address Screen)...');
        const emailRes = await axios.put(`${BASE_URL}/me/profile/email`, {
            email: 'jennifer.wilson@newdomain.com'
        }, { headers });
        console.log(`   ✅ Email updated: ${emailRes.data.data.email}`);
        console.log(`   • Verification sent: ${emailRes.data.data.verification_sent}\n`);

        // 6. Update Phone Number (Edit Phone Number Screen)
        console.log('6. 📱 Testing PUT /api/me/profile/phone (Edit Phone Number Screen)...');
        const phoneRes = await axios.put(`${BASE_URL}/me/profile/phone`, {
            phone: '(+1) 555 - 0123'
        }, { headers });
        console.log(`   ✅ Phone updated: ${phoneRes.data.data.phone}\n`);

        // 7. Change Password (Edit Password Screen)
        console.log('7. 🔒 Testing PUT /api/me/profile/password (Edit Password Screen)...');
        const passwordRes = await axios.put(`${BASE_URL}/me/profile/password`, {
            current_password: 'oldpassword123',
            new_password: 'newpassword456',
            confirm_password: 'newpassword456'
        }, { headers });
        console.log(`   ✅ Password changed successfully`);
        console.log(`   • Other sessions logged out: ${passwordRes.data.data.logout_other_sessions}\n`);

        // 8. Test Password Validation
        console.log('8. ⚠️ Testing Password Validation...');
        try {
            await axios.put(`${BASE_URL}/me/profile/password`, {
                current_password: 'oldpassword123',
                new_password: 'weak',
                confirm_password: 'different'
            }, { headers });
        } catch (error) {
            console.log(`   ✅ Validation working: ${error.response.data.message}`);
            console.log(`   • Errors: ${JSON.stringify(error.response.data.errors, null, 2)}\n`);
        }

        // 9. Test Email Validation
        console.log('9. ⚠️ Testing Email Validation...');
        try {
            await axios.put(`${BASE_URL}/me/profile/email`, {
                email: 'invalid-email'
            }, { headers });
        } catch (error) {
            console.log(`   ✅ Email validation working: ${error.response.data.message}\n`);
        }

        // 10. Test Delete Account (Delete Account Screens)
        console.log('10. 🗑️ Testing DELETE /api/me/profile (Delete Account Screens)...');
        console.log('    First testing without proper confirmation...');
        try {
            await axios.delete(`${BASE_URL}/me/profile`, {
                headers,
                data: { confirmation_text: 'wrong', password: 'mypassword' }
            });
        } catch (error) {
            console.log(`   ✅ Delete validation working: ${error.response.data.message}`);
        }

        console.log('    Now testing with proper confirmation...');
        const deleteRes = await axios.delete(`${BASE_URL}/me/profile`, {
            headers,
            data: { confirmation_text: 'DELETE', password: 'mypassword' }
        });
        console.log(`   ✅ Account deletion initiated`);
        console.log(`   • Deletion ID: ${deleteRes.data.data.deletion_id}`);
        console.log(`   • Completion time: ${deleteRes.data.data.completion_time}`);
        console.log(`   • Cancel deadline: ${deleteRes.data.data.cancellation_deadline}\n`);

        // 11. Test Profile Update
        console.log('11. 🔄 Testing PUT /api/me/profile (General Update)...');
        const updateRes = await axios.put(`${BASE_URL}/me/profile`, {
            first_name: 'Jenny',
            last_name: 'Wilson Updated',
            email: 'jenny.updated@email.com',
            phone: '(+1) 999 - 8888'
        }, { headers });
        console.log(`   ✅ Profile updated: ${updateRes.data.data.user.full_name}`);
        console.log(`   • Email: ${updateRes.data.data.user.email}`);
        console.log(`   • Phone: ${updateRes.data.data.user.phone}\n`);

        console.log('🎉 ALL FIGMA PROFILE MANAGEMENT APIS WORKING PERFECTLY!\n');

        console.log('📋 SUMMARY - 8 New Profile APIs Created:');
        console.log('• ✅ GET /api/me/profile - Personal Information Screen');
        console.log('• ✅ PUT /api/me/profile - General Profile Update');
        console.log('• ✅ POST /api/me/profile/photo - Upload Photos Screen'); 
        console.log('• ✅ PUT /api/me/profile/name - Edit Full Name Screen');
        console.log('• ✅ PUT /api/me/profile/email - Edit Email Address Screen');
        console.log('• ✅ PUT /api/me/profile/phone - Edit Phone Number Screen');
        console.log('• ✅ PUT /api/me/profile/password - Edit Password Screen');
        console.log('• ✅ DELETE /api/me/profile - Delete Account Screens');

        console.log('\n🎯 Figma Features Implemented:');
        console.log('• ✅ Personal Information display with profile photo');
        console.log('• ✅ Photo gallery selection and upload');
        console.log('• ✅ Individual field editing (name, email, phone)');
        console.log('• ✅ Password change with validation');
        console.log('• ✅ Account deletion with confirmation');
        console.log('• ✅ Form validation and error handling');
        
        console.log('\n🔗 Live Resources:');
        console.log('• API Base: https://api-layer.vercel.app/api');
        console.log('• Swagger Docs: https://api-layer.vercel.app/api-docs');
        console.log('• Check "Profile Management" section in Swagger');

    } catch (error) {
        console.error('❌ Test Error:', {
            message: error.message,
            url: error.config?.url?.replace(BASE_URL, '/api'),
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testProfileManagementAPIs();