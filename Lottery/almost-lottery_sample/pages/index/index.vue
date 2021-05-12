<template>
  <view class="home">
    <!-- title -->
    <view class="home-title">
      <text class="home-title__text">almost-lottery</text>
    </view>
    <!-- lottery -->
    <view class="home-lottery">
      <almost-lottery
        :prize-list="prizeList"
        :ring-count="2"
        :duration="1"
        :font-size="10"
        :canvas-width="canvasData.width"
        :canvas-height="canvasData.height"
        :prize-index="prizeIndex"
        @reset-index="prizeIndex = -1"
        @draw-start="handleDrawStart"
        @draw-end="handleDrawEnd"
        @finish="handleDrawFinish"
        v-if="prizeList.length"
      />
      <text class="almost-lottery__tip" v-else>奖品准备中...</text>
    </view>
    <!-- result -->
    <view class="home-result">
      <text class="home-result__text">{{ targetName }}</text>
    </view>
    <!-- action -->
    <view class="home-action" @tap="handleInitCanvas">
      <text class="home-action__text">重新生成-测试用</text>
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
        // canvas 宽高
        canvasData: {
          width: 240,
          height: 240
        },
        // 奖品数据
        prizeList: [],
        // 中奖下标
        prizeIndex: -1,
        // 是否正在抽奖中
        prizeing: false,
        // 中奖类目名称
        targetName: '',
				// 奖品是否设有库存
				onStock: true,
        // 是否由前端控制概率，默认不开启
        onFrontend: false,
        // 权重随机数的最大值
        weightTotal: 0,
        // 权重数组
        weightArr: []
      }
    },
    methods: {
      // 重新生成
      handleInitCanvas () {
				clearCacheFile()
				
				this.targetName = ''
        this.prizeList = []
        this.getPrizeList()
				
      },
      // 获取奖品列表
      async getPrizeList () {
        uni.showLoading({
          title: '奖品准备中...'
        })
				
        let res = await this.requestPrizeList()
				console.log('获取奖品列表', res)
				
				if (res.ok) {
					let data = res.data
					if (data.length) {
						// stock 奖品库存
						// weight 中奖概率，数值越大中奖概率越高
						this.prizeList = data
						
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
			// 模拟请求奖品列表接口
			requestPrizeList () {
				return new Promise((resolve, reject) => {
					let requestTimer = setTimeout(() => {
						clearTimeout(requestTimer)
						requestTimer = null
						
						resolve({
							ok: true,
							data: [
								{ prizeId: 1, name: '0.1元现金', stock: 10, weight: 0, prizeImage: '/static/git.png' },
								{ prizeId: 2, name: '10元现金', stock: 0, weight: 0, prizeImage: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/56f085e0-bcfe-11ea-b244-a9f5e5565f30.png' },
								{ prizeId: 3, name: '5元话费', stock: 1, weight: 0 },
								{ prizeId: 4, name: '50元现金', stock: 0, weight: 0 },
								{ prizeId: 5, name: '1卷抽纸', stock: 3, weight: 0 },
								{ prizeId: 6, name: '0.2元现金', stock: 8, weight: 0 },
								{ prizeId: 7, name: '谢谢参与', stock: 100, weight: 0 },
								{ prizeId: 8, name: '100金币', stock: 100, weight: 0 }
							]
						})
					}, 2000)
				})
			},
      // 本次抽奖开始
      handleDrawStart () {
        if (this.prizeing) return
        this.prizeing = true
        
        this.targetName = ''
        
        let list = [...this.prizeList]
        
        // 判断是否由前端控制概率
        // 前端控制概率的情况下，需要拿到最接近随机权重且大于随机权重的值
        // 后端控制概率的情况下，通常会直接返回 prizeId
        if (this.onFrontend) {
        	if (!this.weightTotal) {
        		console.warn('###当前已开启前端控制中奖概率，但是奖品数据列表中的 weight 参数似乎配置不正确###')
        		return
        	}
          console.warn('###当前处于前端控制中奖概率，安全起见，强烈建议由后端控制###')
          console.log('当前权重总和为 =>', this.weightTotal)
          
          // 注意这里使用了 Math.ceil，如果某个权重的值为 0，则始终无法中奖
          let weight = Math.ceil(Math.random() * this.weightTotal)
          console.log('本次权重随机数 =>', weight)
          
          // 生成大于等于随机权重的数组
          let tempMaxArrs = []
          list.forEach((item) => {
            if (item.weight >= weight) {
              tempMaxArrs.push(item.weight)
            }
          })
          
          // 如果大于随机权重的数组有值，先对这个数组排序然后取值
          // 反之新建一个临时的包含所有权重的已排序数组，然后取值
          if (tempMaxArrs.length) {
            tempMaxArrs.sort((a, b) => a - b)
            this.prizeIndex = this.weightArr.indexOf(tempMaxArrs[0])
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
        } else {
          // 模拟请求获取中奖信息
          let stoTimer = setTimeout(() => {
            clearTimeout(stoTimer)
            stoTimer = null
            
            console.warn('###当前处于模拟的随机中奖概率，实际场景中，中奖概率应由后端控制###')
            // 这里随机产生的 prizeId 是模拟后端返回的 prizeId
            let prizeId = Math.floor(Math.random() * list.length + 1)
            
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
        }
      },
      // 本次抽奖结束
      handleDrawEnd () {
        this.prizeing = false
        
        // 旋转结束后，可以执行拿到结果后的逻辑
        let prizeName = this.prizeList[this.prizeIndex].name
				
				if (this.onStock) {
					let prizeStock = this.prizeList[this.prizeIndex].stock
					this.targetName = prizeName === '谢谢参与' ? prizeName : prizeStock ? `恭喜您，获得 ${prizeName}` : '很抱歉，您来晚了，当前奖品已无库存'
				}
				
        this.targetName = prizeName === '谢谢参与' ? prizeName : `恭喜您，获得 ${prizeName}`
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
  .home-lottery {
    text-align: center;
  }
  .almost-lottery__tip {
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
