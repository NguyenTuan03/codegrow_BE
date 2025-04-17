const auth = require('./auth')
const users = require('./users')
const classroom = require('./class')

const routers = (app) => {  
  app.use('/auth', auth)
  app.use('/users', users)
  app.use('/classrooms', classroom)
}
module.exports = routers;