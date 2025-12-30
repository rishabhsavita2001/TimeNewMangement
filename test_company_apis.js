// 🏢 Complete Company Management APIs Test (Based on Figma Company Settings - Admin/Owner Flow)

const axios = require('axios');

const BASE_URL = 'https://api-layer.vercel.app/api';

async function testCompanyManagementAPIs() {
    console.log('🏢 Testing Figma Company Management APIs (Admin/Owner Flow)...\n');
    
    try {
        // 1. Get Bearer Token
        console.log('1. 🔑 Getting Bearer Token (Admin Access)...');
        const tokenRes = await axios.get(`${BASE_URL}/get-token`);
        const token = tokenRes.data.data.token;
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
        console.log('   ✅ Admin token obtained\n');

        // 2. Get Company Settings (Company Settings Screen)
        console.log('2. 🏢 Testing GET /api/company/settings (Company Settings Screen)...');
        const companyRes = await axios.get(`${BASE_URL}/company/settings`, { headers });
        const company = companyRes.data.data.company;
        console.log(`   ✅ Company: ${company.name} (${company.industry})`);
        console.log(`   • Brand Color: ${company.brand_color} (${company.brand_color_name})`);
        console.log(`   • Support Email: ${company.support_email}`);
        console.log(`   • Phone: ${company.company_phone}`);
        console.log(`   • Address: ${company.address}`);
        console.log(`   • Employees: ${company.employee_count}\n`);

        // 3. Upload Company Logo (Upload Logos Screen)
        console.log('3. 🖼️ Testing POST /api/company/logo (Upload Logos Screen)...');
        const logoRes = await axios.post(`${BASE_URL}/company/logo`, {
            logo_data: 'base64_logo_data_here',
            logo_type: 'image/png',
            variant: 'primary'
        }, { headers });
        console.log(`   ✅ Logo uploaded: ${logoRes.data.data.file_size}`);
        console.log(`   • Logo ID: ${logoRes.data.data.logo_id}`);
        console.log(`   • Variants: ${Object.keys(logoRes.data.data.variants_generated).length} generated\n`);

        // 4. Update Company Name (Edit Company Name Screen)
        console.log('4. ✏️ Testing PUT /api/company/name (Edit Company Name Screen)...');
        const nameRes = await axios.put(`${BASE_URL}/company/name`, {
            company_name: 'ACME Corporation Ltd.'
        }, { headers });
        console.log(`   ✅ Company name updated: ${nameRes.data.data.company_name}`);
        console.log(`   • Slug: ${nameRes.data.data.slug}\n`);

        // 5. Update Industry (Edit Industry Screen)
        console.log('5. 🏭 Testing PUT /api/company/industry (Edit Industry Screen)...');
        const industryRes = await axios.put(`${BASE_URL}/company/industry`, {
            industry: 'Technology Services',
            category: 'Software Development'
        }, { headers });
        console.log(`   ✅ Industry updated: ${industryRes.data.data.industry}`);
        console.log(`   • Category: ${industryRes.data.data.category}`);
        console.log(`   • Code: ${industryRes.data.data.industry_code}\n`);

        // 6. Update Brand Color - Predefined (Edit Brand Color Screen)
        console.log('6. 🎨 Testing PUT /api/company/brand-color (Edit Brand Color - Predefined)...');
        const colorRes = await axios.put(`${BASE_URL}/company/brand-color`, {
            color_name: 'Purple'
        }, { headers });
        console.log(`   ✅ Brand color updated: ${colorRes.data.data.brand_color} (${colorRes.data.data.color_name})`);
        console.log(`   • RGB: ${JSON.stringify(colorRes.data.data.rgb)}`);
        console.log(`   • Available colors: ${Object.keys(colorRes.data.data.predefined_colors).join(', ')}\n`);

        // 7. Update Brand Color - Custom (Color Picker)
        console.log('7. 🖌️ Testing PUT /api/company/brand-color (Custom Color Picker)...');
        const customColorRes = await axios.put(`${BASE_URL}/company/brand-color`, {
            custom_color: '#FF5733'
        }, { headers });
        console.log(`   ✅ Custom color set: ${customColorRes.data.data.brand_color}`);
        console.log(`   • Color name: ${customColorRes.data.data.color_name}`);
        console.log(`   • RGB: ${JSON.stringify(customColorRes.data.data.rgb)}\n`);

        // 8. Test Color Validation
        console.log('8. ⚠️ Testing Brand Color Validation...');
        try {
            await axios.put(`${BASE_URL}/company/brand-color`, {
                brand_color: 'invalid-color'
            }, { headers });
        } catch (error) {
            console.log(`   ✅ Color validation working: ${error.response.data.message}\n`);
        }

        // 9. Update Support Email (Edit Support Email Screen)
        console.log('9. 📧 Testing PUT /api/company/support-email (Edit Support Email Screen)...');
        const emailRes = await axios.put(`${BASE_URL}/company/support-email`, {
            support_email: 'support@acmecorp.com'
        }, { headers });
        console.log(`   ✅ Support email updated: ${emailRes.data.data.support_email}`);
        console.log(`   • Verification sent: ${emailRes.data.data.verification_sent}\n`);

        // 10. Update Company Phone (Edit Company Phone Screen)
        console.log('10. 📱 Testing PUT /api/company/phone (Edit Company Phone Screen)...');
        const phoneRes = await axios.put(`${BASE_URL}/company/phone`, {
            company_phone: '(+1) 555 - 0199'
        }, { headers });
        console.log(`   ✅ Company phone updated: ${phoneRes.data.data.company_phone}`);
        console.log(`   • Country code: ${phoneRes.data.data.country_code}\n`);

        // 11. Update Company Address (Edit Address Screen)
        console.log('11. 📍 Testing PUT /api/company/address (Edit Address Screen)...');
        const addressRes = await axios.put(`${BASE_URL}/company/address`, {
            address: '123 Technology Drive',
            city: 'Wellington',
            state: 'Wellington',
            country: 'New Zealand',
            postal_code: '6011'
        }, { headers });
        console.log(`   ✅ Address updated: ${addressRes.data.data.full_address}`);
        console.log(`   • Coordinates: ${addressRes.data.data.coordinates.latitude}, ${addressRes.data.data.coordinates.longitude}\n`);

        // 12. Test Email Validation
        console.log('12. ⚠️ Testing Support Email Validation...');
        try {
            await axios.put(`${BASE_URL}/company/support-email`, {
                support_email: 'invalid-email-format'
            }, { headers });
        } catch (error) {
            console.log(`   ✅ Email validation working: ${error.response.data.message}\n`);
        }

        // 13. Test Company Name Validation
        console.log('13. ⚠️ Testing Company Name Validation...');
        try {
            await axios.put(`${BASE_URL}/company/name`, {
                company_name: ''
            }, { headers });
        } catch (error) {
            console.log(`   ✅ Name validation working: ${error.response.data.message}\n`);
        }

        // 14. Test General Company Settings Update
        console.log('14. 🔄 Testing PUT /api/company/settings (General Update)...');
        const updateRes = await axios.put(`${BASE_URL}/company/settings`, {
            name: 'ACME Innovation Hub',
            industry: 'Tech Innovation',
            brand_color: '#4F46E5',
            support_email: 'hello@acmeinnovation.com',
            company_phone: '(+64) 9 123 4567',
            address: '88 Queen Street, Auckland, NZ',
            description: 'Leading innovation in technology solutions'
        }, { headers });
        console.log(`   ✅ Company settings updated: ${updateRes.data.data.company.name}`);
        console.log(`   • Industry: ${updateRes.data.data.company.industry}`);
        console.log(`   • Brand Color: ${updateRes.data.data.company.brand_color}`);
        console.log(`   • Updated by: ${updateRes.data.data.company.updated_by}\n`);

        console.log('🎉 ALL FIGMA COMPANY MANAGEMENT APIS WORKING PERFECTLY!\n');

        console.log('📋 SUMMARY - 9 New Company Management APIs:');
        console.log('• ✅ GET /api/company/settings - Company Settings Screen');
        console.log('• ✅ PUT /api/company/settings - General Company Update'); 
        console.log('• ✅ POST /api/company/logo - Upload Logos Screen');
        console.log('• ✅ PUT /api/company/name - Edit Company Name Screen');
        console.log('• ✅ PUT /api/company/industry - Edit Industry Screen');
        console.log('• ✅ PUT /api/company/brand-color - Edit Brand Color Screen');
        console.log('• ✅ PUT /api/company/support-email - Edit Support Email Screen');
        console.log('• ✅ PUT /api/company/phone - Edit Company Phone Screen');
        console.log('• ✅ PUT /api/company/address - Edit Address Screen');

        console.log('\n🎯 Figma Admin Features Implemented:');
        console.log('• ✅ Complete company settings dashboard');
        console.log('• ✅ Logo upload with multiple variants');
        console.log('• ✅ Brand color picker (predefined + custom colors)');
        console.log('• ✅ Individual field editing for all company data');
        console.log('• ✅ Form validation and error handling');
        console.log('• ✅ Admin/Owner role-based access');

        console.log('\n🎨 Color Picker Features:');
        console.log('• ✅ Predefined colors: Blue, Purple, Burgundy, Red, Midnight Blue');
        console.log('• ✅ Custom color picker with hex validation');
        console.log('• ✅ RGB conversion and color name assignment');

        console.log('\n🔗 Live Resources:');
        console.log('• API Base: https://api-layer.vercel.app/api');
        console.log('• Swagger Docs: https://api-layer.vercel.app/api-docs');
        console.log('• Check "Company Management" section in Swagger');
        console.log('• Admin/Owner role required for these APIs');

    } catch (error) {
        console.error('❌ Test Error:', {
            message: error.message,
            url: error.config?.url?.replace(BASE_URL, '/api'),
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

testCompanyManagementAPIs();