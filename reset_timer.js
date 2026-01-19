// Quick Timer Reset
const axios = require('axios');

async function resetTimer() {
  try {
    const tokenRes = await axios.get('https://api-layer.vercel.app/api/get-token');
    const token = tokenRes.data.data.token;
    
    const stopRes = await axios.post('https://api-layer.vercel.app/api/me/timer/stop', {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Timer reset successfully!');
  } catch (error) {
    console.log('Timer already stopped or reset');
  }
}

resetTimer();