import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    
    // 使用 Deta Base 存储数据
    const API_KEY = process.env.DETA_API_KEY;
    const BASE_NAME = 'spark-park-messages';
    
    // 获取现有数据
    const getResponse = await fetch(
      `https://database.deta.sh/v1/${process.env.DETA_PROJECT_ID}/base/${BASE_NAME}/items`,
      {
        headers: {
          'X-API-Key': API_KEY!,
          'Content-Type': 'application/json',
        },
      }
    );
    
    let items: any[] = [];
    if (getResponse.ok) {
      const data = await getResponse.json();
      items = data.items || [];
    }
    
    // 添加新消息
    const newMessage = {
      ...body,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('zh-CN'),
    };
    
    // 保存新消息
    const putResponse = await fetch(
      `https://database.deta.sh/v1/${process.env.DETA_PROJECT_ID}/base/${BASE_NAME}/items`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item: newMessage }),
      }
    );
    
    if (!putResponse.ok) {
      throw new Error('Failed to save message');
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: newMessage }),
      headers: { 'Access-Control-Allow-Origin': '*' },
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Failed to save' }),
    };
  }
};

export { handler };