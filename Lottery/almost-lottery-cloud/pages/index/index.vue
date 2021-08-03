<template>
	<view class="content">
		<template v-if="!isLogin">
		  <input type="text" v-model="username" placeholder="用户名" />
		  <input type="text" v-model="password" password="true" placeholder="密码" />
		  <button type="default" @tap="register">注册</button>
		  <button type="default" @tap="login">登录</button>
		</template>
    <template v-else>
      <view class="text">
        <text>用户名：{{ userInfo.username }}</text>
      </view>
      <view class="text">
        <text>金币：{{ scoreInfo.balance }}</text>
      </view>
      <button type="default" @tap="addScore">添加 1000 金币</button>
      <button type="default" @tap="goToLottery">前往抽奖</button>
      <button type="default" @tap="logout">登出</button>
    </template>
	</view>
</template>

<script>
  const db = uniCloud.database()
  import { mapGetters, mapMutations } from 'vuex'
	export default {
		data() {
			return {
				username: 'unicloud',
				password: '123456'
			}
		},
    computed: {
      ...mapGetters(['isLogin', 'userInfo', 'scoreInfo'])
    },
		methods: {
      ...mapMutations(['setToken', 'setUserInfo', 'setScoreInfo', 'logouted']),
      // 注册
			register() {
        let usernameReg = /^[a-z]{6,12}$/
        let passwordReg = /^[\d]{6}$/
        
        if (!usernameReg.test(this.username)) {
          uni.showToast({
            title: '用户名必须是6-12位的小写字母',
            duration: 2000,
            icon: 'none'
          })
          return
        }
        
        if (!passwordReg.test(this.password)) {
          uni.showToast({
            title: '密码必须是6位数字',
            duration: 2000,
            icon: 'none'
          })
          return
        }
        
				uniCloud.callFunction({
					name: 'almost-passport',
					data: {
						action: 'register',
						params: {
							username: this.username,
							password: this.password
						}
					},
					success(res) {
            console.log('注册', res)
            let result = res.result
            if (result.code === 0) {
              uni.showToast({
                title: result.msg,
                duration: 2000,
                icon: 'none'
              })
            } else {
              uni.showToast({
                title: result.errMsg,
                duration: 2000,
                icon: 'none'
              })
            }
					},
					fail(e) {
						console.error(e)
					}
				})
			},
      // 登录
			login() {
        if (!this.username) {
          uni.showToast({
            title: '请输入用户名',
            duration: 2000,
            icon: 'none'
          })
          return
        }
        
        if (!this.password) {
          uni.showToast({
            title: '请输入密码',
            duration: 2000,
            icon: 'none'
          })
          return
        }
        
        let that = this
				uniCloud.callFunction({
					name: 'almost-passport',
					data: {
						action: 'login',
						params: {
							username: this.username,
							password: this.password
						}
					},
					success(res) {
            console.log('登录', res)
            let result = res.result
            if (result.code === 0) {
              uni.setStorageSync('userInfo', result.userInfo)
              uni.setStorageSync('uni_id_token', result.token)
              
              that.setToken(result.token)
              that.setUserInfo(result.userInfo)
              that.getScoreInfo()
            } else {
              let errMsg = result.code === 10002 ? `${result.errMsg}，请先注册` : result.errMsg
              uni.showToast({
                title: errMsg,
                duration: 2000,
                icon: 'none'
              })
            }
					},
					fail(e) {
						console.error(e)
					}
				})
			},
      // 登出
      logout () {
        let that = this
        uniCloud.callFunction({
          name: 'almost-passport',
          data: {
            action: 'logout'
          },
          success(res) {
            console.log('登出', res)
            uni.clearStorageSync()
            that.logouted()
					},
					fail(e) {
						console.error(e)
					}
        })
      },
      // 获取金币信息
      getScoreInfo () {
        let that = this
        uniCloud.callFunction({
          name: 'almost-passport',
          data: {
            action: 'getScore'
          },
          success(res) {
            console.log('获取金币信息', res.result)
            let result = res.result
            if (result.code === 30203) {
              that.logout()
              uni.showToast({
                title: `${result.msg}，请重新登录`,
                duration: 2000,
                icon: 'none'
              })
            } else if (result.data.length) {
              let balance = 0
              result.data.forEach((item) => {
                balance += item.score
              })
              that.setScoreInfo({ balance })
            }
          },
          fail(e) {
            console.error(e)
          }
        })
      },
      // 添加金币
      addScore () {
        let that = this
        uniCloud.callFunction({
          name: 'almost-passport',
          data: {
            action: 'scoreAdd'
          },
          success(res) {
            console.log('添加金币', res.result)
            that.getScoreInfo()
          },
          fail(e) {
            console.error(e)
          }
        })
      },
      // 前往抽奖
      goToLottery () {
        uni.navigateTo({
          url: '/uni_modules/almost-lottery-cloud/pages/lottery'
        })
      }
		},
    onShow () {
      if (this.isLogin) {
        this.getScoreInfo()
      }
    }
	}
</script>

<style>
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0 28rpx;
  }
  
	.content input {
		height: 46px;
		border: solid 1px #DDDDDD;
		border-radius: 5px;
		margin-bottom: 15px;
		padding: 0px 15px;
	}
  
  .content .text {
    display: flex;
    align-items: center;
		height: 46px;
		border: solid 1px #DDDDDD;
		border-radius: 5px;
		margin-bottom: 15px;
		padding: 0px 15px;
    background-color: #F1F1F1;
  }

	.content button {
    width: 100%;
		margin-bottom: 15px;
	}

	.content navigator {
		display: inline-block;
		color: #007AFF;
		border-bottom: solid 1px #007AFF;
		font-size: 16px;
		line-height: 24px;
		margin-bottom: 15px;
	}
	
	.content .row {
		margin-bottom: 15px;
	}

	.tips {
		text-align: center;
		line-height: 20px;
		font-size: 14px;
		color: #999999;
		margin-bottom: 20px;
	}
</style>
