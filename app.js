const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
// const { check, validationResult } = require('express-validator')
const router = express.Router()
const { User } = require('./db')
const SECRET = 'iloveyou' // 密匙

// app.use(express.static('public'));
app.use(express.json())
app.use(cors())

/* ---------------------------------- 渲染模版 ---------------------------------- */
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/login.html')
})
app.get('/register', function (req, res) {
  res.sendFile(__dirname + '/views/register.html')
})
app.get('/user', function (req, res) {
  res.sendFile(__dirname + '/views/user.html')
})

/* ----------------------------------- api ---------------------------------- */
// TODO: 路由拆分

/**
 * @api {post} /register 用户注册
 * @apiDescription 用户注册发了多少分开了上的饭开始懂了疯狂刷登录反馈上的饭
 * @apiName register
 * @apiGroup User
 * @apiParam {string} phone 手机号
 * @apiParam {string} password 密码
 * @apiSuccess {json} result
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "success" : "true",
 *      "result" : {
 *          "phone" : "18538300839",
 *          "password" : "123456"
 *      }
 *  }
 * @apiSampleRequest http://localhost:3000/api/register
 * @apiVersion 1.0.0
 */
router.post('/register', async (req, res) => {
  const data = await User.create({
    phone: req.body.phone,
    password: req.body.password
  })
  res.send(data)
})

router.post('/login', async (req, res) => {
  const user = await User.findOne({
    phone: req.body.phone
  })
  if (!user) {
    // TODO: err_code完善
    return res.status(202).send({
      message: "没有此用户"
    })
  }

  const isPass = require('bcryptjs').compareSync(req.body.password, user.password)
  if (!isPass) {
    return res.status(202).send({
      message: "密码错误"
    })
  }

  // 生成token
  const token = jwt.sign({
    id: user._id
  }, SECRET, {
    expiresIn: 60
  })
  res.send({
    user,
    token
  })
})

// token验证中间件
async function auth(req, res, next) {
  let raw = req.headers.authorization.split(' ').pop()
  let token = jwt.verify(raw, SECRET)
  let { id } = token
  const user = await User.findById(id)
  req.user = {
    token,
    id,
    user
  }
  next()
}

router.get('/userinfo', auth, async (req, res) => {
  res.send(req.user)
})
/**
 * @api {get} /all 获取所有用户
 * @apiDescription 获取用户信息
 * @apiName all
 * @apiGroup User
 * @apiSuccessExample {json} Success-Response:
 * [
    {
        "_id": "5ddf450429748437d86adeb3",
        "phone": "18538300839",
        "password": "$2a$10$xe3MiSRPo6vtg157OhqW5uwnFavqr1oN1NhpFPYcMuG2FK0UNJwMy",
        "__v": 0
    },
    {
        "_id": "5ddf57d6fcdec139d059a58d",
        "phone": "111",
        "password": "$2a$10$vIhm0yz.h7I2jVqxKlOtAOEdmjzTkcXEmf3XngtV0/suRDnnAV5a6",
        "__v": 0
    }
  ]
 * @apiSampleRequest http://localhost:3000/api/all
 * @apiVersion 1.0.0
 */
router.get('/all', async (req, res) => {
  res.send(await User.find())
})
app.use('/api', router)

/* -------------------------------- apidoc文档 -------------------------------- */

app.use('/apidoc', express.static(__dirname + '/api/apidoc'))
app.get('/apidoc/index.html', (req, res) => {
  res.header('Content-type:text/html')
  res.sendFile(__dirname + '/api/apidoc/index.html')
})

const server = app.listen(4400, function () {
  const host = server.address().address
  const port = server.address().port
  console.log('服务已启动, http://%s:%s', host, port);
})