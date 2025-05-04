// testProgressionAuto.js
import axios from 'axios';
import https from 'https';

const agent = new https.Agent({ rejectUnauthorized: false });

const email = 'virtupathai@gmail.com';
const password = 'Dijarqelaj12$';
const careerPathID = 1;
const day = 1; // 👈 set to previous day to simulate auto-progression to day+1

const api = axios.create({
  baseURL: 'https://localhost:7072/api',
  httpsAgent: agent,
  withCredentials: true,
});

let sessionCookie = '';

async function loginAndGetSession() {
  try {
    const res = await api.post('/users/login', {
      email,
      password,
      rememberMe: true,
    });

    const cookies = res.headers['set-cookie'];
    if (!cookies || cookies.length === 0) throw new Error('No session cookie received');

    sessionCookie = cookies.find(c => c.includes('VirtuPathRemember'));
    if (!sessionCookie) throw new Error('VirtuPathRemember cookie not found');

    console.log('🔐 Login successful. Cookie stored.');
  } catch (err) {
    console.error('❌ Login failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function completeDayTasksAndTriggerProgression() {
  try {
    const userRes = await api.get('/users/me', {
      headers: { Cookie: sessionCookie },
    });
    const userID = userRes.data.userID;

    const tasksRes = await api.get('/DailyTasks/bycareerandday', {
      params: { careerPathId: careerPathID, day },
      headers: { Cookie: sessionCookie },
    });

    const tasks = tasksRes.data;
    console.log(`📦 Completing ${tasks.length} tasks for day ${day}`);

    for (const task of tasks) {
      const payload = {
        completionID: 0,
        userID,
        taskID: task.taskID,
        completionDate: new Date().toISOString(),
        careerDay: day,
      };

      await api.post('/TaskCompletion', payload, {
        headers: { Cookie: sessionCookie },
      });

      console.log(`✅ Task ${task.taskID} marked as completed`);
    }

    // Step 3: Trigger progression (next day check)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const todayRes = await api.get('/DailyTasks/today', {
      headers: {
        Cookie: sessionCookie,
        'X-Timezone': timezone,
      },
    });

    console.log(`📈 Day progression triggered. ${todayRes.data.length} tasks returned for new day:`);
    todayRes.data.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.taskDescription}`);
    });

  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  }
}

(async () => {
  await loginAndGetSession();
  await completeDayTasksAndTriggerProgression();
})();
