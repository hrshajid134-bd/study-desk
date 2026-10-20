# StudyDesk deploy (key stays on the server)

1. Create a NEW API key (revoke the one you shared in chat).
2. Put this folder on Vercel (vercel.com > Add New > Project, or `vercel` in this folder).
3. In Project Settings > Environment Variables add: AI_API_KEY = your new key. Redeploy.
4. Open your Vercel URL. Students can sign in and ask; nobody can see the key.

Optional: AI_MODEL to change the model (default gemini-2.5-flash).
The code assumes a Google Gemini key. For another provider, only api/ask.js needs changing.
Photos are limited to 3 MB because of Vercel's request size limit.
