<template>
  <view class="almost-lottery">
    <!-- head -->
    <view class="almost-lottery__head">
      <view :class="['action', isApple && 'action-shadow']">
        <text class="gold"></text>
        <text class="content">金币余额：<text class="num">{{ scoreInfo.balance }}</text></text>
      </view>
      <view class="tip"><text class="tip-content">每次抽奖消耗 {{ goldCoinCost }} 金币，不限次数</text></view>
    </view>
    <!-- action -->
    <view class="almost-action" @tap="handleInitCanvas" v-if="isDev">
      <text class="text">重新生成画板-开发模式使用</text>
    </view>
    <!-- lottery -->
    <view class="almost-lottery__wheel">
      <almost-lottery
        :lottery-size="lotteryConfig.lotterySize"
        str-key="prizeName"
        :ring-count="2"
        :duration="1"
        :prize-list="prizeList"
        :prize-index="prizeIndex"
        @reset-index="prizeIndex = -1"
        @draw-start="handleDrawStart"
        @draw-end="handleDrawEnd"
        @finish="handleDrawFinish"
        v-if="prizeList.length"
      />
      <view class="count">
        <text class="text">剩余免费抽奖 {{ freeNum }} 次</text>
      </view>
    </view>
    <!-- rule -->
    <view class="almost-lottery__rule">
      <view class="rule-head">
        <view class="line"></view>
        <text class="title">活动规则</text>
        <view class="line"></view>
      </view>
      <view class="rule-body">
        <view class="item">
          <view class="number">1</view>
          <view class="text">
            <text>抽奖细则：</text>
            <text>每人每天拥有{{ freeNumDay }}次抽奖机会，每次消耗{{ goldCoinCost }}金币。</text>
          </view>
        </view>
        <view class="item item-rule">
          <view class="number">2</view>
          <view class="text">
            <text>奖励说明：</text>
            <text>a.现金奖：系统会即时转入账户余额，可提现。</text>
            <text>b.金币奖：系统会即时转入金币账户，可在平台内使用。</text>
            <text>c.实物奖：中奖后需联系客服领取。</text>
          </view>
        </view>
        <template v-if="isApple">
          <view class="item"><view class="number">3</view><view class="text">本次活动由XXXXXXX发起，与Apple.Inc无关。</view></view>
          <view class="item"><view class="number">4</view><view class="text">苹果公司不是本活动的赞助商且没有以任何形式参与活动。</view></view>
          <view class="item"><view class="number">5</view><view class="text">本活动仅限17岁以上用户参加。</view></view>
          <view class="item"><view class="number">6</view><view class="text">本活动最终解释权归XXXXXXX所有。</view></view>
        </template>
        <template v-else>
          <view class="item"><view class="number">3</view><view class="text">本次活动由XXXXXXX发起。</view></view>
          <view class="item"><view class="number">4</view><view class="text">本活动仅限17岁以上用户参加。</view></view>
          <view class="item"><view class="number">5</view><view class="text">本活动最终解释权归XXXXXXX所有。</view></view>
        </template>
      </view>
    </view>
  </view>
</template>

<script>
  // AlmostLottery 组件的配置文档，请查看 https://ext.dcloud.net.cn/plugin?id=1030
  import AlmostLottery from '@/uni_modules/almost-lottery-cloud/components/almost-lottery.vue'
	import { clearCacheFile } from '@/uni_modules/almost-lottery-cloud/utils/almost-utils.js'
  import { mapGetters, mapMutations } from 'vuex'
  
  export default {
    name: 'Home',
    components: {
      AlmostLottery
    },
    data () {
      return {
        // 开启调试模式
        isDev: true,
        
        // 以下是转盘配置相关数据
        lotteryConfig: {
          // 抽奖转盘的整体尺寸，单位rpx
          lotterySize: 630
        },
        
        // 以下是奖品配置数据
        // 奖品数据
        prizeList: [],
        // 中奖下标
        prizeIndex: -1,
        
        // 是否正在抽奖中，避免重复触发
        prizeing: false,
        
        // 以下为中奖概率有关数据
        // 权重随机数的最大值
        weightTotal: 0,
        // 权重数组
        weightArr: [],
        
        // 以下为业务需求有关示例数据
        enable: false,
        startDate: null,
        endDate: null,
        // 每天免费抽奖次数
        freeNumDay: 0,
        // 每次消耗的金币数
        goldCoinCost: 0,
        // 剩余免费抽奖次数
        freeNum: 0
      }
    },
    computed: {
      ...mapGetters(['scoreInfo']),
      isApple () {
        return uni.getSystemInfoSync().platform === 'ios'
      }
    },
    methods: {
      ...mapMutations(['setScoreInfo']),
      // 重新生成
      handleInitCanvas () {
				clearCacheFile()
				
        this.prizeList = []
        this.getPrizeData()
				
      },
      // 获取免费抽奖剩余次数
      getFreeNum () {
        let that = this
        uniCloud.callFunction({
          name: 'almost-lottery-draw',
          data: {
            action: 'getFreeNum',
            params: {
              lotteryId: 10000
            }
          },
          success (res) {
            let { result } = res
            that.freeNum = result.free_num
          }
        })
      },
      // 获取抽奖数据
      getPrizeData () {
        uni.showLoading({
          title: '奖品准备中...'
        })
        
        let that = this
        uniCloud.callFunction({
          name: 'almost-lottery-draw',
          data: {
            action: 'getPrizeData',
            params: {
              lotteryId: 10000
            }
          },
          success (res) {
            console.log('奖品准备中', res)
            let { result } = res
            if (result.prizeList && result.prizeList.length) {
              that.freeNumDay = result.free_num_day
              that.goldCoinCost = result.gold_coin_cost
              that.enable = result.enable
              that.startDate = result.start_date
              that.endDate = result.end_date
              that.prizeList = result.prizeList
              that.getFreeNum()
            } else {
              uni.showToast({
                title: '获取奖品失败，请先在后台添加奖品设置',
              	icon: 'none',
                duration: 2000
              })
              
              let stoTimer = setTimeout(() => {
                clearTimeout(stoTimer)
                stoTimer = null
                
                uni.navigateBack()
              }, 2000)
            }
          },
          fail(err) {
            console.error(err)
            uni.showToast({
              title: err.errMsg,
            	icon: 'none',
              duration: 2000
            })
              
            let stoTimer = setTimeout(() => {
              clearTimeout(stoTimer)
              stoTimer = null
              
              uni.navigateBack()
            }, 2000)
          },
          complete() {
            uni.hideLoading()
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
              let balance = result.data[0].balance
              that.setScoreInfo({ balance })
            }
          },
          fail(e) {
            console.error(e)
          }
        })
      },
      // 本次抽奖开始
      handleDrawStart () {
        console.log('触发抽奖按钮')
        if (!this.enable || Date.now() < this.startDate) {
          uni.showToast({
            title: '活动暂未开启，请稍后再来',
          	icon: 'none'
          })
          return
        } else if (Date.now() > this.endDate) {
          uni.showToast({
            title: '活动已结束，请继续关注我们的下一次活动',
          	icon: 'none'
          })
          return
        }
        
        if (this.prizeing) return
        this.prizeing = true
        
        // 还有免费数次或者剩余金币足够抽一次
        if (this.freeNum > 0 || this.scoreInfo.balance >= this.goldCoinCost) {
        
          // 更新免费次数或金币余额
          if (this.freeNum > 0) {
            this.freeNum--
          } else if (this.scoreInfo.balance >= this.goldCoinCost) {
            this.scoreInfo.balance -= this.goldCoinCost
          }
          
          this.lotteryDraw()
        } else {
          this.prizeing = false
          uni.showModal({
            title: '金币不足',
            content: '是否前往赚取金币？',
            success: (res) => {
              // 这里需要根据业务需求处理，一般情况下会引导用户前往赚取金币的页面
              console.log('金币不足', res)
            }
          })
        }
      },
      // 抽奖
      lotteryDraw () {
        let that = this
        uniCloud.callFunction({
          name: 'almost-lottery-draw',
          data: {
            action: 'lotteryDraw',
            params: {
              lotteryId: 10000
            }
          },
          success (res) {
            let { result } = res
            
            let prizeId = result.prizeId
            that.prizeList.forEach((item, index) => {
              if (item.prizeId === prizeId) {
                // 中奖下标
                that.prizeIndex = index
              }
            })
            
            that.getFreeNum()
            that.getScoreInfo()
          }
        })
      },
      // 本次抽奖结束
      handleDrawEnd () {
        console.log('旋转结束，执行拿到结果后到逻辑')
        
        // 旋转结束后，开始处理拿到结果后的逻辑
        this.prizeing = false
        let prizeName = this.prizeList[this.prizeIndex].prizeName
        let tipContent = ''
				
				if (prizeName === '谢谢参与') {
          tipContent = '很遗憾，没有中奖，请再接再厉！'
				} else {
          tipContent = `恭喜您，获得 ${prizeName} ！`
        }
        
        uni.showModal({
          content: tipContent,
          showCancel: false
        })
      },
      // 抽奖转盘绘制完成
      handleDrawFinish (res) {
        console.log('抽奖转盘绘制完成', res)
				
        uni.showToast({
          title: res.msg,
					duration: 2000,
					mask: true,
					icon: 'none'
        })
      }
    },
    onShow () {
      this.getPrizeData()
      this.getScoreInfo()
    },
    onUnload () {
      uni.hideLoading()
    }
  }
</script>

<style lang="scss" scoped>
  .almost-lottery {
    flex: 1;
    background-color: #FF893F;
  }
  
  .almost-lottery__head {
    position: relative;
    width: 100%;
    height: 640rpx;
    background: url('/uni_modules/almost-lottery-cloud/static/almost-lottery/pages/top-bg.png') no-repeat center center/cover;
    .action {
      position: relative;
      top: 400rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 480rpx;
      height: 88rpx;
      line-height: 88rpx;
      margin: 0 auto;
      color: #FFFFFF;
      font-size: 32rpx;
      background-color: rgba(255, 136, 61, 1);
      border-radius: 44rpx;
    }
    .action-shadow {
      box-shadow: 0px 14rpx 0px 0px rgba(235, 112, 36, 1);
    }
    .gold {
      width: 44rpx;
      height: 44rpx;
      margin-right: 10rpx;
      background-repeat: no-repeat;
      background-position: center center;
      background-size: contain;
      background-image: url("/uni_modules/almost-lottery-cloud/static/almost-lottery/pages/gold.png");
      
      @media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2) {
        background-image: url("/uni_modules/almost-lottery-cloud/static/almost-lottery/pages/gold@2x.png");
      }
      
      @media (-webkit-min-device-pixel-ratio: 3), (min-device-pixel-ratio: 3) {
        background-image: url("/uni_modules/almost-lottery-cloud/static/almost-lottery/pages/gold@3x.png");
      }
    }
    .num {
      color: #F9FC31;
    }
    .tip {
      position: relative;
      top: 428rpx;
      color: #FFFFFF;
      font-size: 24rpx;
      text-align: center;
    }
  }
  
  .almost-lottery__wheel {
    text-align: center;
    .count {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 40rpx 0;
    }
    .text {
      color: #FFFFFF;
      font-size: 24rpx;
    }
  }
  
  .almost-lottery__rule {
    padding: 0 28rpx;
    color: #FFF8CB;
    .rule-head {
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin: 40rpx 0;
      .line {
        flex: 1;
        height: 1px;
        background-color: #FFF3A5;
      }
      .title {
        width: 280rpx;
        color: #F63857;
        line-height: 70rpx;
        text-align: center;
        margin: 0 20rpx;
        border-radius: 8rpx;
        background-image: linear-gradient(0deg,rgba(255,242,158,1),rgba(255,244,168,1));
      }
    }
    .rule-body {
      color: #FFF8CB;
      font-size: 24rpx;
      padding: 10rpx 0 40rpx;
      .item {
        display: flex;
        margin-bottom: 10rpx;
      }
      .number {
        position: relative;
        top: 4rpx;
        width: 28rpx;
        height: 28rpx;
        line-height: 28rpx;
        text-align: center;
        color: #F63857;
        background: #FFF8CB;
        border-radius: 50%;
        margin-right: 10rpx;
      }
      .text {
        flex: 1;
      }
      .item-rule .text {
        display: flex;
        flex-direction: column;
      }
    }
  }
  
  .almost-action {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 400rpx;
    height: 80rpx;
    border-radius: 10rpx;
    text-align: center;
    background-color: red;
    margin: 0 auto 40rpx;
    .text {
      color: #FFFFFF;
      font-size: 28rpx;
    }
  }
</style>
