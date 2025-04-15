const auth = require('./auth')
const users = require('./users')
const routers = (app) => {  
  app.use('/auth', auth)
  app.use('/users', users)
}
module.exports = routers;