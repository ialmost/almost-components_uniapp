'use strict'

const uniId = require('uni-id')
const db = uniCloud.database()
const dbCmd = db.command
const $ = db.command.aggregate

exports.main = async (event, context) => {
  const uniID = uniId.createInstance({
    context
  })
  
  //event为客户端上传的参数
  console.log('event.action : ', event.action)
  console.log('event.params : ', event.params)
  
  // context 包含了此处调用的调用信息和运行状态
  console.log('context', context)
  
  let deviceInfo = event.deviceInfo || {
    ip: context.CLIENTIP,
    os: context.OS,
    ua: context.CLIENTUA,
    deviceId: context.DEVICEID,
    platform: context.PLATFORM
  }
  
  let params = event.params || {}
  let payload = {}
  let noCheckAction = ['register', 'checkToken', 'encryptPwd', 'login']
  if (noCheckAction.indexOf(event.action) === -1) {
    if (!event.uniIdToken) {
      return {
        code: 403,
        msg: '缺少token'
      }
    }
    payload = await uniID.checkToken(event.uniIdToken)
    console.log('payload', payload)

    if (payload.code && payload.code > 0) {
      return payload
    }
    params.uid = payload.uid
  }
  
  // 注册成功后的一些处理
  const regSucAction = async (res = {}) => {
    // 记录注册时的设备信息
    let obj = {
      user_id: res.uid,
      type: 'register'
    }
    recordDevice(obj)
    recordLog(obj)
    
    // 注册赠送金币1000
    await db.collection('uni-id-scores').add({
      user_id: res.uid,
      score: 1000,
      balance: 1000,
      type: 1,
      comment: '新用户注册赠送金币1000',
      create_date: Date.now()
    })
  }
  
  // 登录成功后的一些处理
  const loginSucAction = async (res = {}) => {
    // 记录登录时的设备信息
    let obj = {
      user_id: res.uid,
      type: 'login'
    }
    recordDevice(obj)
    recordLog(obj)
  }
  
  // 记录注册/登录时的设备信息
  const recordDevice = async (obj) => {
    await db.collection('uni-id-device').add({
      ...obj,
      ...deviceInfo,
      create_date: Date.now()
    })
  }
  
  // 存储日志信息
  const recordLog = async (obj) => {
    await db.collection('uni-id-log').add({
      ...obj,
      ...deviceInfo,
      create_date: Date.now()
    })
  }
  
  // action
  let res = {}
  switch (event.action) {
    case 'register': {
      const {
        username,
        password
      } = params
      
      // https://uniapp.dcloud.io/uniCloud/uni-id?id=encrypt-password
      const encryptPwd = uniID.encryptPwd(password)

      res = await uniID.register({
        username,
        password: encryptPwd.passwordHash,
        role: ['user']
      })
      res.code === 0 && regSucAction(res)
      break;
    }
    case 'login': {
      const {
        username,
        password
      } = params
      
      // https://uniapp.dcloud.io/uniCloud/uni-id?id=encrypt-password
      const encryptPwd = uniID.encryptPwd(password)

      res = await uniID.login({
        username,
        password: encryptPwd.passwordHash
      })
      
      res.code === 0 && loginSucAction(res)
      break;
    }
    case 'logout': {
      res = await uniID.logout(event.uniIdToken)
      break;
    }
    case 'getScore': {
      const { uid } = params
      res = await db.collection('uni-id-scores').where({ user_id: uid }).orderBy('create_date', 'desc').get()
      break;
    }
    case 'scoreAdd': {
      const { uid } = params
      let currentScore = await db.collection('uni-id-scores').where({ user_id: uid }).get()
      let balance = 0
      currentScore.data.forEach((item) => {
        balance += item.score
      })
      balance += 1000
      await db.collection('uni-id-scores').add({
        user_id: uid,
        score: 1000,
        balance,
        type: 1,
        comment: '自定义事件添加1000',
        create_date: Date.now()
      })
      res = await db.collection('uni-id-scores').where({ user_id: uid }).get()
      break;
    }
  }

  return res
};
