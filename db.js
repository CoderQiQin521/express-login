const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/express-login', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

// TODO: monogo错误捕获
const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    set(val) {
      return require('bcryptjs').hashSync(val, 10)
    }
  }
})


const User = mongoose.model('User', userSchema)
// User.db.dropCollection('users')

module.exports = {
  User
}