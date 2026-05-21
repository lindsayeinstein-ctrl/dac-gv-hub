const https = require('https');

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { endpoint, method, token, payload } = body;

  if (!endpoint || !token) {
    return { statusCode: 400, body: 'Missing endpoint or token' };
  }

  // Only allow Notion API calls
  if (!endpoint.startsWith('https://api.notion.com/')) {
    return { statusCode: 403, body: 'Only Notion API calls allowed' };
  }

  try {
    const response = await fetch(endpoint, {
      method: method || 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: payload ? JSON.stringify(payload) : undefined
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch(e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
