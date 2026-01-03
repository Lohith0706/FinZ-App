import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Helper to wrap Vercel handlers
const wrap = (handler: any) => async (req: any, res: any) => {
    try {
        await handler(req, res);
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

// Routes
// Consolidated Handlers
// @ts-ignore
import auth from './api/auth.ts';
// @ts-ignore
import data from './api/data.ts';
// @ts-ignore
import social from './api/social.ts';
// @ts-ignore
import ai from './api/ai.ts';

app.all('/api/auth-*', wrap(auth));
app.all('/api/user-data', wrap(data));
app.all('/api/update-user-data', wrap(data));
app.all('/api/resolve-friend-code', wrap(social));
app.all('/api/update-friends', wrap(social));
app.all('/api/leaderboard', wrap(social));
app.all('/api/finz-chat', wrap(ai));
app.all('/api/finz-advice', wrap(ai));
app.all('/api/finz', wrap(ai));

app.listen(port, () => {
    console.log(`Local API server listening at http://localhost:${port}`);
});
