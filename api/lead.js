export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    // Get configuration from environment variables
    const N8N_URL = process.env.N8N_LEAD_WEBHOOK_URL;
    const API_KEY = process.env.TRM_API_KEY;

    if (!N8N_URL) {
        console.error('Missing N8N_LEAD_WEBHOOK_URL environment variable');
        return res.status(500).json({ error: 'Server configuration error: Missing API URL' });
    }

    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        // Add API Key if it exists
        if (API_KEY) {
            headers['x-api-key'] = API_KEY;
        }

        const response = await fetch(N8N_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(req.body),
        });

        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return res.status(response.status).json(data);
        } else {
            const text = await response.text();
            return res.status(response.status).send(text);
        }
    } catch (error) {
        console.error('Error proxying to N8N:', error);
        return res.status(500).json({ error: 'Failed to process request' });
    }
}
