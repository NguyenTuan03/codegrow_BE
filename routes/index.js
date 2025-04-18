const auth = require('./auth')
const users = require('./users')
const classroom = require('./class')
const courses = require('./course')
const routers = (app) => {  
  app.use('/auth', auth)
  app.use('/users', users)
  app.use('/classrooms', classroom)
  app.use('/course', courses)
}
module.exports = routers;