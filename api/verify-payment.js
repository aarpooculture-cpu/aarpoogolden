const netlifyFunction = require('../netlify/functions/verify-payment').handler;

module.exports = async function handler(req, res) {
  const event = {
    httpMethod: req.method,
    headers: req.headers,
    body: typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})
  };
  const context = {};

  try {
    const result = await netlifyFunction(event, context);
    const headers = result.headers || {};
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
    res.status(result.statusCode || 200).send(result.body);
  } catch (err) {
    res.status(500).send(JSON.stringify({ success: false, message: 'Server error' }));
  }
};
