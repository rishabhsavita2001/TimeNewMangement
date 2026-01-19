// Test isContinue field functionality
const testIsContinue = async () => {
  try {
    console.log('⏰ Testing isContinue Field...');
    
    // 1. Get token
    const tokenResponse = await fetch('https://api-layer.vercel.app/api/get-token');
    const tokenData = await tokenResponse.json();
    const token = tokenData.data.token;
    const headers = { 'Authorization': `Bearer ${token}` };
    console.log('✅ Token received');
    
    // 2. Start timer
    console.log('\n2. Starting timer...');
    const startTimer = await fetch('https://api-layer.vercel.app/api/me/timer/start', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Testing isContinue field' })
    });
    const startResult = await startTimer.json();
    console.log('Timer started:', startResult.data.timerId);
    console.log('Initial isContinue:', startResult.data.isContinue);
    
    // 3. Check timer status
    console.log('\n3. Checking initial timer status...');
    const initialStatus = await fetch('https://api-layer.vercel.app/api/me/timer/current', { headers });
    const initialData = await initialStatus.json();
    console.log('Timer Status:');
    console.log('  - isRunning:', initialData.data.timerStatus.isRunning);
    console.log('  - isPaused:', initialData.data.timerStatus.isPaused);
    console.log('  - isBreak:', initialData.data.timerStatus.isBreak);
    console.log('  - isContinue:', initialData.data.timerStatus.isContinue);
    
    // 4. Pause timer (take break)
    console.log('\n4. Pausing timer (taking break)...');
    const pauseTimer = await fetch('https://api-layer.vercel.app/api/me/timer/pause', {
      method: 'POST',
      headers
    });
    const pauseResult = await pauseTimer.json();
    console.log('Pause result:', pauseResult.message);
    console.log('Break status - isContinue:', pauseResult.data.isContinue);
    
    // 5. Check timer status during break
    console.log('\n5. Checking timer status during break...');
    const breakStatus = await fetch('https://api-layer.vercel.app/api/me/timer/current', { headers });
    const breakData = await breakStatus.json();
    console.log('Break Status:');
    console.log('  - isRunning:', breakData.data.timerStatus.isRunning);
    console.log('  - isPaused:', breakData.data.timerStatus.isPaused);
    console.log('  - isBreak:', breakData.data.timerStatus.isBreak);
    console.log('  - isContinue:', breakData.data.timerStatus.isContinue);
    
    // 6. Resume timer (continue work)
    console.log('\n6. Resuming timer (continuing work)...');
    const resumeTimer = await fetch('https://api-layer.vercel.app/api/me/timer/pause', {
      method: 'POST',
      headers
    });
    const resumeResult = await resumeTimer.json();
    console.log('Resume result:', resumeResult.message);
    console.log('Continue status - isContinue:', resumeResult.data.isContinue);
    
    // 7. Final timer status check
    console.log('\n7. Final timer status after resume...');
    const finalStatus = await fetch('https://api-layer.vercel.app/api/me/timer/current', { headers });
    const finalData = await finalStatus.json();
    console.log('Final Status:');
    console.log('  - isRunning:', finalData.data.timerStatus.isRunning);
    console.log('  - isPaused:', finalData.data.timerStatus.isPaused);
    console.log('  - isBreak:', finalData.data.timerStatus.isBreak);
    console.log('  - isContinue:', finalData.data.timerStatus.isContinue, '← Use this for your clock logic!');
    
    console.log('\n🎉 isContinue Field Test Complete!');
    console.log('\n💡 Usage Tips:');
    console.log('   - isContinue: false = Fresh start or on break');
    console.log('   - isContinue: true = User resumed after taking break');
    console.log('   - Use isContinue to trigger clock stop/reset logic');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testIsContinue();