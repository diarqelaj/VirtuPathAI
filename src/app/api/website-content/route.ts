import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const websiteContent = `
Welcome to VirtuPath AI – your AI-powered career training hub.

✅ Current Career Trainings (19 total):
1. Software Developer – Full-stack web dev with real tools.
2. Content Creator – Video, scripting, branding.
3. Businessman – Pitching, scaling, competitive edge.
4. MMA Fighter – AI combat training + strategy.
5. Chef – Cuisine mastery, plating, food safety.
6. Graphic Designer – Design with Figma & Adobe Suite.
7. Fashion Designer – Sketching, digital design, trends.
8. Footballer – Virtual tactical coaching + nutrition.
9. Trader – Crypto, Forex, technical analysis.
10. Data Scientist – ML, Python, SQL, insights.
11. Actor – Virtual stage and screen performance.
12. Cybersecurity Specialist – Hands-on ethical hacking.
13. Author – Creative writing and publishing skills.
14. Investor – Stocks, crypto, real estate.
15. Musician – Production, mixing, digital tools.
16. Game Developer – Unity, Unreal, game publishing.
17. Animator – 2D/3D animation with Blender, AE.
18. Journalist – Investigative writing with AI.
19. E-commerce Specialist – Shopify + digital strategy.

🔗 Navigation:
- Home
- Courses
- Dashboard (post-login)
- AI Tools
- Support Chat
- Enrollment Portal

📎 Assistant Rules:
- You are a friendly assistant bot.
- Never give users tasks just general help if they ask about a specific task.
- Redirect "task" queries to TaskBot or suggest enrolling.
- Always stay helpful and informative about the platform.

🚀 Note:
- Courses are remote, online, or hybrid.
- Most courses cost €39–€69 with discounted pricing.
- Each includes projects and real-world tools.

Use this knowledge when answering user questions.
    `;

    return NextResponse.json({ content: websiteContent });
  } catch (error) {
    console.error('❌ Website content API error:', error);
    return NextResponse.json({ content: 'Failed to fetch website content.' }, { status: 500 });
  }
}
