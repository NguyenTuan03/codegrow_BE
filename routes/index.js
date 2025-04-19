const auth = require('./auth')
const users = require('./users')
const classroom = require('./class')
const courses = require('./course')
const enroll = require('./enroll')
const routers = (app) => {  
  app.use('/auth', auth)
  app.use('/users', users)
  app.use('/classrooms', classroom)
  app.use('/course', courses)
  app.use('/enroll', enroll)
}
module.exports = routers;