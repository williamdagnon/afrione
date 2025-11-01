module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'AFRIONE API',
    version: '1.0.0',
    description: 'API REST Futuristia (Node.js/Express, PostgreSQL/Supabase)'
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Serveur local'
    }
  ]
};
