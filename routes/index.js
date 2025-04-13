const user = require('./users')
const routers = (app) => {
  app.use('/auth',user)  
}
module.exports = routers;