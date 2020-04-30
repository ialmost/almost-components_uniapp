<template>
  <view class="home">
    <view class="home-title">
      <text class="home-title__text">raffle-wheel</text>
    </view>
    <view class="home-wheel">
      <raffle-wheel
        ref="raffleWheel"
        :prizeList="prizeList"
        strKey="name"
        :canvas-width="canvasData.width"
        :canvas-height="canvasData.height"
        @actionStart="handleActionStart"
        @actionEnd="handleActionEnd"
        @done="handleDrawDone"
        v-if="prizeList.length"
      />
      <text class="raffle-wheel__tip" v-else>奖品准备中...</text>
    </view>
    <view class="home-result">
      <text class="home-result__text">{{ targetName }}</text>
    </view>
    <view class="home-action" @tap="handleInitCanvas">
      <text class="home-action__text">重新生成-测试用</text>
    </view>
  </view>
</template>

<script>
  import RaffleWheel from '@/components/raffle-wheel/raffle-wheel.vue'
  export default {
    name: 'Home',
    components: {
      RaffleWheel
    },
    data () {
      return {
        // canvas 宽高
        canvasData: {
          width: 240,
          height: 240
        },
        // 奖品数据
        prizeList: [],
        // 中奖下标
        targetIndex: 0,
        // 中奖类目名称
        targetName: '',
        canvasImg: ''
      }
    },
    methods: {
      // 重新生成
      handleInitCanvas () {
        this.prizeList = []
        this.getPrizeList()
      },
      // 获取奖品列表
      getPrizeList () {
        uni.showLoading({
          title: '奖品准备中...',
          mask: true
        })
        // 模拟请求奖品列表
        let stoTimer = setTimeout(() => {
          clearTimeout(stoTimer)
          stoTimer = null
          
          this.prizeList = [
            { name: '0.1元现金奖', count: 10 },
            { name: '10元现金奖', count: 0 },
            { name: '5元话费', count: 1 },
            { name: '50元现金奖', count: 0 },
            { name: '1卷抽纸', count: 3 },
            { name: '0.02元现金奖', count: 8 },
            { name: '50金币', count: 4 },
            { name: '100金币', count: 0 }
          ]
        }, 500)
      },
      // 本次抽奖开始
      handleActionStart () {
        // 模拟请求
        let stoTimer = setTimeout(() => {
          clearTimeout(stoTimer)
          stoTimer = null
          
          // 随机一个下标获奖
          this.targetIndex = Math.floor(Math.random() * this.prizeList.length)
          console.log('中奖商品 =>', this.prizeList[this.targetIndex].name)
          console.log('商品数量 =>', this.prizeList[this.targetIndex].count)
          // 开始执行旋转定位
          this.$refs.raffleWheel.handleStartRotate(this.targetIndex)
        }, 200)
      },
      // 本次抽奖结束
      handleActionEnd () {
        console.log('旋转结束，执行拿到结果后到逻辑')
        this.targetName = '恭喜您，获得 ' + this.prizeList[this.targetIndex].name
      },
      // 抽奖转盘绘制完成
      handleDrawDone () {
        console.log('抽奖转盘绘制完成')
        uni.showToast({
          title: '奖品准备就绪',
          duration: 1000
        })
      }
    },
    onLoad () {
      // 模拟请求奖品数据
      this.getPrizeList()
    },
    onUnload () {
      uni.hideLoading()
    }
  }
</script>

<style lang="scss" scoped>
  $wheelBgUrl: '~static/raffle-wheel/raffle-wheel__bg';
  .home {
    padding: 50px 0;
  }
  .home-title {
    text-align: center;
    margin-bottom: 50px;
  }
  .home-title__text {
    color: #000;
    font-size: 40px;
    font-weight: bold;
  }
  .home-result {
    text-align: center;
    margin-top: 50px;
  }
  .home-result__text {
    color: #000;
    font-size: 20px;
    font-weight: bold;
  }
  .home-wheel {
    text-align: center;
  }
  .raffle-wheel__tip {
    font-size: 24rpx;
  }
  .home-action {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 60rpx;
    width: 260rpx;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 10rpx;
    text-align: center;
    background-color: red;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .home-action__text {
    color: #FFFFFF;
    font-size: 24rpx;
  }
</style>
