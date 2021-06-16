<template>
  <view class="almost-lottery">
    <!-- head -->
    <view class="almost-lottery__head">
      <view :class="['action', isApple && 'action-shadow']">
        <text class="gold"></text>
        <text class="content">金币余额：<text class="num">{{ goldCoin }}</text></text>
      </view>
      <view class="tip"><text class="tip-content">每次抽奖消耗 {{ goldNum }} 金币，不限次数</text></view>
    </view>
    <!-- action -->
    <view class="almost-action" @tap="handleInitCanvas" v-if="isDev">
      <text class="text">重新生成画板-开发模式使用</text>
    </view>
    <!-- lottery -->
    <view class="almost-lottery__wheel">
      <almost-lottery
        :canvasId="canvasConfig.canvasId"
        :canvasWidth="canvasConfig.width"
        :canvasHeight="canvasConfig.height"
        :ringCount="2"
        :duration="1"
        :prizeList="prizeList"
        :prizeIndex="prizeIndex"
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
            <text>每人每天拥有{{ freeNumDay }}次抽奖机会，每次消耗{{ goldNum }}金币。</text>
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
  import AlmostLottery from '@/uni_modules/almost-lottery/components/almost-lottery/almost-lottery.vue'
	import { clearCacheFile } from '@/uni_modules/almost-lottery/utils/almost-utils.js'
  export default {
    name: 'Home',
    components: {
      AlmostLottery
    },
    data () {
      return {
        // 开启调试模式
        isDev: true,
        
        // 以下是画板配置相关数据
        // canvas id、宽、高
        canvasConfig: {
          canvasId: 'almostLotteryCanvas',
          width: 280,
          height: 280
        },
        
        // 以下是转盘 UI 配置
        // 转盘外环图
        lotteryBg: 'https://raw.githubusercontent.com/ialmost/almost-components_uniapp/dev/Lottery/almost-lottery_sample/static/lottery-bg.png',
        // 抽奖按钮图
        actionBg: 'https://raw.githubusercontent.com/ialmost/almost-components_uniapp/dev/Lottery/almost-lottery_sample/static/action-bg.png',
        
        // 以下是奖品配置数据
        // 奖品数据
        prizeList: [],
				// 奖品是否设有库存
				onStock: true,
        // 中奖下标
        prizeIndex: -1,
        
        // 是否正在抽奖中，避免重复触发
        prizeing: false,
        
        // 以下为中奖概率有关数据
        // 是否由前端控制概率，默认不开启，强烈建议由后端控制
        onFrontend: false,
        // 权重随机数的最大值
        weightTotal: 0,
        // 权重数组
        weightArr: [],
        
        // 以下为业务需求有关示例数据
        // 金币余额
        goldCoin: 600,
        // 当日免费抽奖次数余额
        freeNum: 3,
        // 每次消耗的金币数
        goldNum: 20,
        // 每天免费抽奖次数
        freeNumDay: 3
      }
    },
    computed: {
      isApple () {
        return uni.getSystemInfoSync().platform === 'ios'
      }
    },
    methods: {
      // 重新生成
      handleInitCanvas () {
				clearCacheFile()
				
        this.prizeList = []
        this.getPrizeList()
				
      },
      // 获取奖品列表
      async getPrizeList () {
        uni.showLoading({
          title: '奖品准备中...'
        })
				
        // 等待接口返回的数据进一步处理
        let res = await this.requestApiGetPrizeList()
				console.log('获取奖品列表', res)
				
				if (res.ok) {
					let data = res.data
					if (data.length) {
						this.prizeList = data
            console.log('已获取到奖品列表数据，开始绘制抽奖转盘')
						
						// 如果开启了前端控制概率
						// 计算出权重的总和并生成权重数组
						if (this.onFrontend) {
						  this.prizeList.forEach((item) => this.weightTotal += item.weight)
						  this.weightArr = this.prizeList.map((item) => item.weight)
						}
					}
				} else {
					uni.hideLoading()
					uni.showToast({
						title: '获取奖品失败'
					})
				}
      },
			// 模拟请求 获取奖品列表 接口，
      // 注意这里返回的是一个 Promise
			requestApiGetPrizeList () {
				return new Promise((resolve, reject) => {
					let requestTimer = setTimeout(() => {
						clearTimeout(requestTimer)
						requestTimer = null
						
            // stock 奖品库存
						// weight 中奖概率，数值越大中奖概率越高，权重一样时随机中奖
						resolve({
							ok: true,
							data: [
								{ prizeId: 1, name: '0.1元现金', stock: 10, weight: 1, prizeImage: '/static/git.png' },
								{ prizeId: 2, name: '10元现金', stock: 0, weight: 0, prizeImage: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/56f085e0-bcfe-11ea-b244-a9f5e5565f30.png' },
								{ prizeId: 3, name: '5元话费', stock: 1, weight: 0 },
								{ prizeId: 4, name: '50元现金', stock: 0, weight: 0 },
								{ prizeId: 5, name: '1卷抽纸', stock: 3, weight: 0 },
								{ prizeId: 6, name: '0.2元现金', stock: 8, weight: 0 },
								{ prizeId: 7, name: '谢谢参与', stock: 100, weight: 10000 },
								{ prizeId: 8, name: '100金币', stock: 100, weight: 10000 }
							]
						})
					}, 2000)
				})
			},
      // 本次抽奖开始
      handleDrawStart () {
        console.log('触发抽奖按钮')
        if (this.prizeing) return
        this.prizeing = true
        
        // 还有免费数次或者剩余金币足够抽一次
        if (this.freeNum > 0 || this.goldCoin >= this.goldNum) {
          this.tryLotteryDraw()
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
      // 尝试发起抽奖
      tryLotteryDraw () {
        console.log('旋转开始，获取中奖下标......')
        // 判断是否由前端控制概率
        if (this.onFrontend) {
          this.localGetPrizeIndex()
        } else {
          this.remoteGetPrizeIndex()
        }
      },
      // 本地获取中奖下标
      localGetPrizeIndex () {
        console.warn('###当前处于前端控制中奖概率，安全起见，强烈建议由后端控制###')
        // 前端控制概率的情况下，需要拿到最接近随机权重且大于随机权重的值
        // 后端控制概率的情况下，通常会直接返回 prizeId
        if (!this.weightTotal) {
        	console.warn('###当前已开启前端控制中奖概率，但是奖品数据列表中的 weight 参数似乎配置不正确###')
        	return
        }
        console.log('当前权重总和为 =>', this.weightTotal)
        
        // 注意这里使用了 Math.ceil，如果某个权重的值为 0，则始终无法中奖
        let weight = Math.ceil(Math.random() * this.weightTotal)
        console.log('本次权重随机数 =>', weight)
        
        let list = [...this.prizeList]
        
        // 生成大于等于随机权重的数组
        let tempMaxArrs = []
        list.forEach((item) => {
          if (item.weight >= weight) {
            tempMaxArrs.push(item.weight)
          }
        })
        
        // 如果大于随机权重的数组有值，先对这个数组排序然后取值
        // 反之新建一个临时的包含所有权重的已排序数组，然后取值
        let tempMaxArrsLen = tempMaxArrs.length
        if (tempMaxArrsLen) {
          tempMaxArrs.sort((a, b) => a - b)
          // 取值时，如果存在多个值，分两种情况
          if (tempMaxArrsLen > 1) {
            // 值不相等的情况下取最接近的值，也就是第1个值
            let sumWeight = tempMaxArrs.reduce((a, b) => a + b)
            if ((sumWeight / tempMaxArrsLen) !== tempMaxArrs[0]) {
              this.prizeIndex = this.weightArr.indexOf(tempMaxArrs[0])
            } else {
              // 值相等时，随机取值，当然这里你可以自己决定是否随机取值
              let sameWeight = tempMaxArrs[0]
              let sameWeightArr = []
              let sameWeightItem = {}
              this.weightArr.forEach((item, index) => {
                if (item === sameWeight) {
                  sameWeightArr.push({
                    weight: item,
                    index
                  })
                }
              })
              console.log('sameWeightArr', sameWeightArr)
              sameWeightItem = sameWeightArr[Math.floor(Math.random() * sameWeightArr.length)]
              console.log('sameWeightItem', sameWeightItem)
              this.prizeIndex = sameWeightItem.index
            }
          } else {
            this.prizeIndex = this.weightArr.indexOf(tempMaxArrs[0])
          }
        } else {
          let tempWeightArr = [...this.weightArr]
          tempWeightArr.sort((a, b) => a - b)
          this.prizeIndex = this.weightArr.indexOf(tempWeightArr[tempWeightArr.length - 1])
        }
                
        console.log('本次抽中奖品 =>', this.prizeList[this.prizeIndex].name)
        
        // 如果奖品设有库存
        if (this.onStock) {
          console.log('本次奖品库存 =>', this.prizeList[this.prizeIndex].stock)
        }
      },
      // 远程请求接口获取中奖下标
      remoteGetPrizeIndex () {
        console.warn('###当前处于模拟的请求接口，并返回了中奖信息###')
        // 模拟请求接口获取中奖信息
        let stoTimer = setTimeout(() => {
          clearTimeout(stoTimer)
          stoTimer = null
          
          let list = [...this.prizeList]
          
          // 这里随机产生的 prizeId 是模拟后端返回的 prizeId
          let prizeId = Math.floor(Math.random() * list.length + 1)
          
          // 拿到后端返回的 prizeId 后，开始循环比对得出那个中奖的数据
          for (let i = 0; i < list.length; i++) {
            let item = list[i]
            if (item.prizeId === prizeId) {
              // 中奖下标
              this.prizeIndex = i
              break
            }
          }
          
          console.log('本次抽中奖品 =>', this.prizeList[this.prizeIndex].name)
          
          // 如果奖品设有库存
          if (this.onStock) {
          	console.log('本次奖品库存 =>', this.prizeList[this.prizeIndex].stock)
          }
        }, 500)
      },
      // 本次抽奖结束
      handleDrawEnd () {
        console.log('旋转结束，执行拿到结果后到逻辑')
        
        // 更新免费次数和金币余额
        if (this.freeNum > 0) {
          this.freeNum--
        } else {
          if (this.goldCoin >= this.goldNum) this.goldCoin -= this.goldNum
        }
        
        // 旋转结束后，开始处理拿到结果后的逻辑
        this.prizeing = false
        let prizeName = this.prizeList[this.prizeIndex].name
        let tipContent = ''
				
				if (prizeName === '谢谢参与') {
          tipContent = '很遗憾，没有中奖，请再接再厉！'
				} else {
          // 如果奖品设有库存
          if (this.onStock) {
            let prizeStock = this.prizeList[this.prizeIndex].stock
            tipContent = prizeStock ? `恭喜您，获得 ${prizeName}` : '很抱歉，您来晚了，当前奖品已无库存'
          } else {
            tipContent = `恭喜您，获得${prizeName}！`
          }
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
					duration: 3000,
					mask: true,
					icon: 'none'
        })
      }
    },
    onLoad () {
      // 请求奖品数据
      this.getPrizeList()
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
    background: url('~static/images/lottery/top-bg.png') no-repeat center center/cover;
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
      background-image: url("~static/images/lottery/gold.png");
      
      @media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2) {
        background-image: url("~static/images/lottery/gold@2x.png");
      }
      
      @media (-webkit-min-device-pixel-ratio: 3), (min-device-pixel-ratio: 3) {
        background-image: url("~static/images/lottery/gold@3x.png");
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
