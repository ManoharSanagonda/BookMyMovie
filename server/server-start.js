process.env.NODE_ENV = process.env.NODE_ENV || 'development'
process.env.SERVER_PORT = process.env.SERVER_PORT || '4500'
process.env.JWT_SECRET = '0a6b944d-d2fb-46fc-a85e-0295c986cd9f'
process.env.MONGO_HOST = 'mongodb://localhost:27017/sample'
process.env.MONGO_PORT = '27017'
process.env.SENDGRID_API_KEY = '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'
require('babel-register');
require("babel-polyfill");
require('./server');
