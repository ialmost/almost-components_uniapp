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
        // 是否由前端控制概率
        isFrontend: true,
        // 权重随机数的最大值
        weightTotal: 10000
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
        // #ifdef MP-ALIPAY
        uni.showLoading({
          title: '奖品准备中...'
        })
        // #endif
        // #ifndef MP-ALIPAY
        uni.showLoading({
          title: '奖品准备中...',
          mask: true
        })
        // #endif
        // 模拟请求奖品列表
        let stoTimer = setTimeout(() => {
          clearTimeout(stoTimer)
          stoTimer = null
          
          // stock 奖品库存
          // weight 中奖概率，数值越大中奖概率越高
          // 如果存在谢谢参与的选项，请把权重值设置为权重随机数的最大值
          this.prizeList = [
            { prizeId: 1, name: '0.1元现金', stock: 10, weight: 10 },
            { prizeId: 2, name: '10元现金', stock: 0, weight: 0 },
            { prizeId: 3, name: '5元话费', stock: 1, weight: 5 },
            { prizeId: 4, name: '50元现金', stock: 0, weight: 0 },
            { prizeId: 5, name: '1卷抽纸', stock: 3, weight: 200 },
            { prizeId: 6, name: '0.02元现金', stock: 8, weight: 900 },
            { prizeId: 7, name: '谢谢参与', stock: 100, weight: 10000 },
            { prizeId: 8, name: '100金币', stock: 0, weight: 500 }
          ]
        }, 500)
      },
      // 本次抽奖开始
      handleActionStart () {
        let list = [...this.prizeList]
        
        // 模拟请求
        let stoTimer = setTimeout(() => {
          clearTimeout(stoTimer)
          stoTimer = null
          
          // 判断是否由前端控制概率
          // 前端控制概率的情况下，用最新的随机权重比对每一个奖项的权重，只有小于或等于才算中奖
          // 后端控制概率的情况下，通常会直接返回奖品Id
          if (this.isFrontend) {
            let weight = Math.floor(Math.random() * this.weightTotal)
            list.forEach((item, index) => {
              if (weight <= item.weight) {
                // 中奖下标
                this.targetIndex = index
              }
            })
          } else {
            let prizeId = Math.floor(Math.random() * list.length)
            list.forEach((item, index) => {
              if (item.prizeId === prizeId) {
                // 中奖下标
                this.targetIndex = index
              }
            })
          }
          
          console.log('抽中奖品 =>', this.prizeList[this.targetIndex].name)
          console.log('奖品库存 =>', this.prizeList[this.targetIndex].stock)
          // 开始执行旋转定位
          this.$refs.raffleWheel.handleStartRotate(this.targetIndex)
        }, 200)
      },
      // 本次抽奖结束
      handleActionEnd () {
        console.log('旋转结束，执行拿到结果后到逻辑')
        let prizeName = this.prizeList[this.targetIndex].name
        let prizeStock = this.prizeList[this.targetIndex].stock
        this.targetName = prizeName === '谢谢参与' ? prizeName : prizeStock ? `恭喜您，获得 ${prizeName}` : '很抱歉，您来晚了，当前奖品已无库存'
      },
      // 抽奖转盘绘制完成
      handleDrawDone () {
        console.log('抽奖转盘绘制完成')
        uni.hideLoading()
        // #ifdef MP-ALIPAY
        uni.showToast({
          title: '奖品准备就绪'
        })
        // #endif
        // #ifndef MP-ALIPAY
        uni.showToast({
          title: '奖品准备就绪',
          duration: 1000
        })
        // #endif
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
    font-size: 30px;
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
    bottom: 40rpx;
    width: 260rpx;
    height: 80rpx;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 10rpx;
    text-align: center;
    background-color: red;
    margin: 0 auto;
  }
  .home-action__text {
    color: #FFFFFF;
    font-size: 24rpx;
  }
</style>
