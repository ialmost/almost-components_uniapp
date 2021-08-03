import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: uni.getStorageSync('uni_id_token') || '',
    userInfo: uni.getStorageSync('userInfo') || '',
    scoreInfo: uni.getStorageSync('scoreInfo') || ''
  },
  getters: {
    // 登录状态
    isLogin (state) {
      return !!state.token
    },
    // 用户信息
    userInfo (state) {
      if (!state.userInfo) return {}
      let type = typeof (state.userInfo)
      let userInfo = null
      
      if (type === 'string') {
        userInfo = JSON.parse(state.userInfo)
      } else {
        userInfo = { ...state.userInfo }
      }
      return userInfo
    },
    // 积分信息
    scoreInfo (state) {
      if (!state.scoreInfo) return {}
      let type = typeof (state.scoreInfo)
      let scoreInfo = null
      
      if (type === 'string') {
        scoreInfo = JSON.parse(state.scoreInfo)
      } else {
        scoreInfo = { ...state.scoreInfo }
      }
      return scoreInfo
    },
  },
  mutations: {
    setToken (state, token) {
      state.token = token
    },
    setUserInfo (state, info) {
      state.userInfo = info
    },
    setScoreInfo (state, info) {
      state.scoreInfo = info
    },
    logouted (state) {
      state.token = ''
      state.userInfo = ''
      state.scoreInfo = ''
    }
  },
  actions: {
    
  }
})
