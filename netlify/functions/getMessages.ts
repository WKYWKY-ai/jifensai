import { Handler } from '@netlify/functions';
import { Deta } from 'deta';

const deta = Deta(process.env.DETA_PROJECT_KEY);
const db = deta.Base('messages');

const handler: Handler = async (event) => {
    try {
        const { items } = await db.fetch();
        const sortedItems = items.sort((a: any, b: any) => b.id - a.id);
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(sortedItems),
        };
    } catch (error) {
        console.error('Error fetching messages:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch messages' }),
        };
    }
};

export { handler };