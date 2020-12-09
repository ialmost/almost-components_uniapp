<template>
  <view class="almost-lottery" :style="{ width: canvasWidth + 40 + 'px', height: canvasHeight + 40 + 'px'}">
    <view class="almost-lottery__wrap" :style="{width: canvasWidth + canvasMarginTotal + 'px', height: canvasHeight + canvasMarginTotal + 'px'}">
      <!-- #ifdef MP-ALIPAY -->
      <canvas :class="className" :id="canvasId" :width="canvasWidth" :height="canvasHeight" :style="{
         width: canvasWidth + 'px',
         height: canvasHeight + 'px'
       }" />
      <!-- #endif -->
      <!-- #ifndef MP-ALIPAY -->
      <canvas :class="className" :canvas-id="canvasId" :width="canvasWidth" :height="canvasHeight" :style="{
         width: canvasWidth + 'px',
         height: canvasHeight + 'px'
       }" />
      <!-- #endif -->
      <image class="canvas-img" :src="lotteryImg" :style="{
         width: canvasWidth + canvasMarginTotal + 'px',
         height: canvasHeight + canvasMarginTotal + 'px',
         transform: `rotate(${canvasAngle + targetAngle}deg)`,
         transitionDuration: `${transitionDuration}s`
       }"
        v-if="lotteryImg"></image>
      <view class="almost-lottery__action" :style="{
         width: actionSize + 'px',
         height: actionSize + 'px'
       }" @click="handleActionStart"></view>
      <!-- 为了兼容 app 端 ctx.measureText 所需的标签 -->
      <text class="almost-lottery__measureText">{{ measureText }}</text>
    </view>
  </view>
</template>

<script>
	import { pathToBase64 } from '@/almost-utils/image-tools.js'
	import { getStore, setStore, clearStore, downloadFile } from '@/almost-utils/almost-utils.js'
  export default {
    name: 'AlmostLottery',
    props: {
      // canvas 宽度
      canvasWidth: {
        type: Number,
        default: 240
      },
      // canvas 高度
      canvasHeight: {
        type: Number,
        default: 240
      },
      // 奖品列表
      prizeList: {
        type: Array,
        required: true,
        validator: (value) => {
          return value.length > 1
        }
      },
      // 中奖奖品在列表中的下标
      prizeIndex: {
        type: Number,
        required: true
      },
      // 奖品区块对应背景颜色
      colors: {
        type: Array,
        default: () => [
          '#FFFFFF',
          '#FFE9AA'
        ]
      },
      // 旋转动画时间 单位s
      duration: {
        type: Number,
        default: 8
      },
      // 旋转的圈数
      ringCount: {
        type: Number,
        default: 8
      },
      // 指针位置
      pointerPosition: {
        type: String,
        default: 'edge',
        validator: (value) => {
          return value === 'edge' || value === 'middle'
        }
      },
      // 字体颜色
      fontColor: {
        type: String,
        default: '#C30B29'
      },
      // 文字的大小
      fontSize: {
        type: Number,
        default: 12
      },
      // 奖品文字多行情况下的行高
      lineHeight: {
        type: Number,
        default: 16
      },
      // 奖品名称所对应的 key 值
      strKey: {
        type: String,
        default: 'name'
      },
      // 奖品文字总长度限制
      strMaxLen: {
        type: Number,
        default: 12
      },
      // 奖品文字多行情况下第一行文字长度
      strLineLen: {
        type: Number,
        default: 6
      },
      // 奖品图片的宽
      imageWidth: {
        type: Number,
        default: 30
      },
      // 奖品图片的高
      imageHeight: {
        type: Number,
        default: 30
      },
			// 转盘绘制成功的提示
			successMsg: {
				type: String,
				default: '奖品准备就绪，快来参与抽奖吧'
			},
			// 转盘绘制失败的提示
			failMsg: {
				type: String,
				default: '奖品仍在准备中，请稍后再来...'
			},
			// 是否开启画板的缓存
			canvasCached: {
				type: Boolean,
				default: true
			},
			// 内圈与外圈的间距
			canvasMargin: {
        type: Number,
        default: 5
      }
    },
    data() {
      return {
        // 画板className
        className: 'almost-lottery__canvas',
        // 画板标识
        canvasId: 'almostLotteryCanvas',
        // 画板导出的图片
        lotteryImg: '',
        // 旋转到奖品目标需要的角度
        targetAngle: 0,
        // 旋转动画时间 单位 s
        transitionDuration: 0,
        // 是否正在旋转
        isRotate: false,
        // 当前停留在那个奖品的序号
        stayIndex: 0,
        // 当前中奖奖品的序号
        targetIndex: 0,
				// 是否存在可用的缓存转盘图
				isCacheImg: false,
				oldLotteryImg: '',
        // 解决 app 不支持 measureText 的问题
				// app 已在 2.9.3 的版本中提供了对 measureText 的支持，将在后续版本逐渐稳定后移除相关兼容代码
        measureText: ''
      }
    },
    computed: {
      // 根据奖品列表计算 canvas 旋转角度
      canvasAngle() {
        let prizeCount = this.prizeList.length
        let prizeClip = 360 / prizeCount
        let result = 0

        let diffNum = 90 / prizeClip
        if (this.pointerPosition === 'edge') {
          result = -(prizeClip * diffNum)
        } else {
          result = -(prizeClip * diffNum + prizeClip / 2)
        }
        return result
      },
      // 外圆的半径
      outsideRadius() {
        return this.canvasWidth / 2
      },
      // 内圆的半径
      insideRadius() {
        return 20
      },
      // 字体的半径
      textRadius() {
        return this.fontSize / 2
      },
      // 根据画板的宽度计算奖品文字与中心点的距离
      textDistance() {
        const textZeroY = Math.round(this.outsideRadius - (this.insideRadius / 2))
        return textZeroY - this.textRadius
      },
      // 设备像素密度
      pixelRatio() {
        return uni.getSystemInfoSync().pixelRatio
      },
			// 内圈与外圈的距离
			canvasMarginTotal () {
				let diffNum = 5
				let margin = this.canvasMargin * 2
				if (this.canvasWidth > 240) {
					return -(this.canvasWidth / 240 * 2) - margin
				} else if (this.canvasWidth < 240) {
					return diffNum + (this.canvasWidth / 240 * 2) - margin
				} else {
					return diffNum - margin
				}
			},
			// 抽奖按钮的宽高
			actionSize () {
				return this.canvasWidth / 2.4
			}
    },
    watch: {
      // 监听获奖序号的变动
      prizeIndex(newVal, oldVal) {
        if (newVal > -1) {
          this.targetIndex = newVal
          this.onRotateStart()
        } else {
          console.info('旋转结束，prizeIndex 已重置')
        }
      }
    },
    methods: {
      // 开始旋转
      onRotateStart() {
        if (this.isRotate) return
        this.isRotate = true
        // 奖品总数
        let prizeCount = this.prizeList.length
        let baseAngle = 360 / prizeCount
        let angles = 0
        if (this.targetAngle === 0) {
          // 第一次旋转
          // 因为第一个奖品是从0°开始的，即水平向右方向
          // 第一次旋转角度 = 270度 - (停留的序号-目标序号) * 每个奖品区间角度 - 每个奖品区间角度的一半 - canvas自身旋转的度数
          angles = (270 - (this.targetIndex - this.stayIndex) * baseAngle - baseAngle / 2) - this.canvasAngle
        } else {
          // 后续旋转
          // 后续继续旋转 就只需要计算停留的位置与目标位置的角度
          angles = -(this.targetIndex - this.stayIndex) * baseAngle
        }
        // 更新目前序号
        this.stayIndex = this.targetIndex
        // 转 8 圈，圈数越多，转的越快
        this.targetAngle += angles + 360 * this.ringCount

        // 计算转盘结束的时间，预加一些延迟确保转盘停止后触发结束事件
        let endTime = this.transitionDuration * 1000 + 100
        let endTimer = setTimeout(() => {
          clearTimeout(endTimer)
          endTimer = null

          this.isRotate = false
          this.$emit('draw-end')
        }, endTime)

        let resetPrizeTimer = setTimeout(() => {
          clearTimeout(resetPrizeTimer)
          resetPrizeTimer = null

          // 每次抽奖结束后都要重置父级附件的 prizeIndex
          this.$emit('reset-index')
        }, endTime + 50)
      },
      // 点击 开始抽奖 按钮
      handleActionStart() {
        this.$emit('draw-start')
      },
      // 渲染转盘
      async onCreateCanvas() {
        // 获取 canvas 画布
        const canvasId = this.canvasId
        const ctx = uni.createCanvasContext(canvasId, this)

        // canvas 的宽高
        let canvasW = this.canvasWidth
        let canvasH = this.canvasHeight

        // 根据奖品个数计算 角度
        let prizeCount = this.prizeList.length
        let baseAngle = Math.PI * 2 / prizeCount

        // 设置描边颜色
        ctx.setStrokeStyle('#FFBE04')

        // 设置字体和字号
        // #ifndef MP
        let fontFamily =
          '-apple-system, BlinkMacSystemFont, \'PingFang SC\', \'Helvetica Neue\', STHeiti, \'Microsoft Yahei\', Tahoma, Simsun, sans-serif'
        ctx.font = `${this.fontSize}px ${fontFamily}`
        // #endif
        // #ifdef MP
        ctx.setFontSize(this.fontSize)
        // #endif

        // 注意，开始画的位置是从0°角的位置开始画的。也就是水平向右的方向。
        // 画具体内容
        for (let i = 0; i < prizeCount; i++) {
					let prizeItem = this.prizeList[i]
          // 当前角度
          let angle = i * baseAngle

          // 保存当前画布的状态
          ctx.save()

          // 开始画内容
          ctx.beginPath()

          // 开始画圆弧
          // x => 圆弧对应的圆心横坐标 x
          // y => 圆弧对应的圆心横坐标 y
          // radius => 圆弧的半径大小
          // startAngle => 圆弧开始的角度，单位是弧度
          // endAngle => 圆弧结束的角度，单位是弧度
          // anticlockwise(可选) => 绘制方向，true 为逆时针，false 为顺时针
          ctx.arc(canvasW * 0.5, canvasH * 0.5, this.outsideRadius, angle, angle + baseAngle, false)
          ctx.arc(canvasW * 0.5, canvasH * 0.5, this.insideRadius, angle + baseAngle, angle, true)

          // 开始链接线条
          ctx.stroke()
          // 每个奖品区块背景填充颜色
          if (this.colors.length === 2) {
            ctx.setFillStyle(this.colors[i % 2])
          } else {
            ctx.setFillStyle(this.colors[i])
          }
          // 填充颜色
          ctx.fill()

          // 开始绘制奖品内容
          // 重新映射画布上的 (0,0) 位置
          let translateX = canvasW * 0.5 + Math.cos(angle + baseAngle / 2) * this.textDistance
          let translateY = canvasH * 0.5 + Math.sin(angle + baseAngle / 2) * this.textDistance
          ctx.translate(translateX, translateY)

          // 绘制奖品名称
          ctx.setFillStyle(this.fontColor)
          let rewardName = this.strLimit(prizeItem[this.strKey])

          // rotate方法旋转当前的绘图，因为文字是和当前扇形中心线垂直的
          ctx.rotate(angle + (baseAngle / 2) + (Math.PI / 2))

          // 设置文本位置并处理换行
          // 是否需要换行
          let isLineBreak = rewardName.length > this.strLineLen
          let textOffsetX = this.fontSize === 12 ? 0 : this.textRadius
          if (isLineBreak) {
            // 获得多行文本数组
            rewardName = rewardName.substring(0, this.strLineLen) + ',' + rewardName.substring(this.strLineLen)
            let rewardNames = rewardName.split(',')

            // 循环文本数组，计算每一行的文本宽度
            for (let j = 0; j < rewardNames.length; j++) {
              if (ctx.measureText && ctx.measureText(rewardNames[j]).width) {
                // 文本的宽度信息
                let tempStrSize = ctx.measureText(rewardNames[j])
                ctx.fillText(rewardNames[j], -(tempStrSize.width / 2 + textOffsetX), j * this.lineHeight)
              } else {
                this.measureText = rewardNames[j]

                // 等待页面重新渲染
                await this.$nextTick()

                let textWidth = await this.getTextWidth()

                ctx.fillText(rewardNames[j], -(textWidth / 2 + textOffsetX), j * this.lineHeight)
                // console.log(rewardNames[j], textWidth, i)
              }
            }
          } else {
            if (ctx.measureText && ctx.measureText(rewardName).width) {
              // 文本的宽度信息
              let tempStrSize = ctx.measureText(rewardName)
              ctx.fillText(rewardName, -(tempStrSize.width / 2 + textOffsetX), 0)
            } else {
              this.measureText = rewardName

              // 等待页面重新渲染
              await this.$nextTick()

              let textWidth = await this.getTextWidth()
              ctx.fillText(rewardName, -(textWidth / 2 + textOffsetX), 0)
            }
          }

          // 绘制奖品图片
          if (prizeItem.prizeImage) {
						// App-Android平台 系统 webview 更新到 Chrome84+ 后 canvas 组件绘制本地图像 uni.canvasToTempFilePath 会报错
						// 统一将图片处理成 base64
						// https://ask.dcloud.net.cn/question/103303
						let reg = /^(https|http)/g
						// 处理远程图片
						if (reg.test(prizeItem.prizeImage)) {
							console.warn('###当前数据列表中的奖品图片为网络图片，开始下载图片...###')
							let res = await downloadFile(prizeItem.prizeImage)
							console.log('处理远程图片', res)
							if (res.ok) {
								let tempFilePath = res.tempFilePath
								// #ifndef MP
								prizeItem.prizeImage = await pathToBase64(tempFilePath)
								// #endif
								// #ifdef MP
								prizeItem.prizeImage = tempFilePath
								// #endif
							}
						} else {
							// #ifndef MP
							prizeItem.prizeImage = await pathToBase64(prizeItem.prizeImage)
							// #endif
						}
						
            ctx.drawImage(prizeItem.prizeImage, -(this.imageWidth / 2), canvasW / 10, this.imageWidth, this.imageHeight)
          }

          ctx.restore()
        }

        // 保存绘图并导出图片
        ctx.draw(true, () => {
          let drawTimer = setTimeout(() => {
            clearTimeout(drawTimer)
            drawTimer = null

            // #ifdef MP-ALIPAY
            ctx.toTempFilePath({
              destWidth: this.canvasWidth * this.pixelRatio,
              destHeight: this.canvasHeight * this.pixelRatio,
              success: (res) => {
                // console.log(res.apFilePath)
                this.handlePrizeImg({
									ok: true,
									data: res.apFilePath,
									msg: '画布导出生成图片成功'
								})
              },
							fail: (err) => {
                this.handlePrizeImg({
									ok: false,
									data: err,
									msg: '画布导出生成图片失败'
								})
							}
            })
            // #endif
            // #ifndef MP-ALIPAY
            uni.canvasToTempFilePath({
              destWidth: this.canvasWidth * this.pixelRatio,
              destHeight: this.canvasHeight * this.pixelRatio,
              canvasId: this.canvasId,
              success: (res) => {
                // 在 H5 平台下，tempFilePath 为 base64
                // console.log(res.tempFilePath)
                this.handlePrizeImg({
									ok: true,
									data: res.tempFilePath,
									msg: '画布导出生成图片成功'
								})
              },
							fail: (err) => {
                this.handlePrizeImg({
									ok: false,
									data: err,
									msg: '画布导出生成图片失败'
								})
							}
            }, this)
            // #endif
          }, 500)
        })
      },
      // 处理导出的图片
      handlePrizeImg(res) {
				if (res.ok) {
					let data = res.data
					
					if (!this.canvasCached) {
						this.lotteryImg = data
						this.handlePrizeImgSuc(res)
						return
					}
					
					// #ifndef H5
					if (this.isCacheImg) {
						uni.getSavedFileList({
							success: (sucRes) => {
								let fileList = sucRes.fileList
								// console.log('getSavedFileList Cached', fileList)
								
								let cached = false
								for (let i = 0; i < fileList.length; i++) {
									let item = fileList[i]
									if (item.filePath === data) {
										cached = true
										this.lotteryImg = data
										
										console.info('经查，本地缓存中存在转盘图可用，本次将不再绘制转盘')
										this.handlePrizeImgSuc(res)
										break
									}
								}
								
								if (!cached) {
									console.info('经查，本地缓存中存在转盘图不可用，需要重新初始化转盘绘制')
									this.initCanvasDraw()
								}
							},
							fail: (err) => {
								this.initCanvasDraw()
							}
						})
					} else {
						uni.saveFile({
							tempFilePath: data,
							success: (sucRes) => {
								let filePath = sucRes.savedFilePath
								// console.log('saveFile', filePath)
								setStore('lotteryImg', filePath)
								this.lotteryImg = filePath
								this.handlePrizeImgSuc({
									ok: true,
									data: filePath,
									msg: '画布导出生成图片成功'
								})
							},
							fail: (err) => {
								this.handlePrizeImg({
									ok: false,
									data: err,
									msg: '画布导出生成图片失败'
								})
							}
						})
					}
					// #endif
					// #ifdef H5
					console.info('当前为 H5 端，直接使用导出的/缓存中的 base64 图')
					setStore('lotteryImg', data)
					this.lotteryImg = data
					this.handlePrizeImgSuc(res)
					// #endif
				} else {
					console.error('处理导出的图片失败', res)
					uni.hideLoading()
					// #ifdef H5
					console.error('###当前为 H5 端，下载网络图片需要后端配置允许跨域###')
					// #endif
					// #ifdef MP
					console.error('###当前为小程序端，下载网络图片需要配置域名白名单###')
					// #endif
				}
      },
			// 处理图片完成
			handlePrizeImgSuc (res) {
				uni.hideLoading()
				this.$emit('finish', {
					ok: res.ok,
					data: res.data,
					msg: res.ok ? this.successMsg : this.failMsg
				})
			},
      // 兼容 app 端不支持 ctx.measureText
      // 已知问题：初始绘制时，低端安卓机 平均耗时 2s
      getTextWidth() {
        return new Promise((resolve, reject) => {
          uni.createSelectorQuery().in(this).select('.almost-lottery__measureText').fields({
            size: true,
          }, (res) => {
            resolve(res.width)
          }).exec()
        })
      },
      // 处理文字溢出
      strLimit(value) {
        let maxLength = this.strMaxLen
        if (!value || !maxLength) return value
        return value.length > maxLength ? value.slice(0, maxLength - 1) + '...' : value
      },
			// 检查本地缓存中是否存在转盘图
			checkCacheImg () {
				console.log('检查本地缓存中是否存在转盘图')
				// 检查是否已有缓存的转盘图
				// 检查是否与本次奖品数据相同
				this.oldLotteryImg = getStore('lotteryImg')
				let oldPrizeList = getStore('prizeList')
				let newPrizeList = JSON.stringify(this.prizeList)
				if (this.oldLotteryImg) {
					if (oldPrizeList === newPrizeList) {
						console.log(`经查，本地缓存中存在转盘图 => ${this.oldLotteryImg}`)
						this.isCacheImg = true
						
						console.log('需要继续判断这张缓存图是否可用')
						this.handlePrizeImg({
							ok: true,
							data: this.oldLotteryImg,
							msg: '画布导出生成图片成功'
						})
						return
					}
				}
				
				console.log('经查，本地缓存中不存在转盘图')
				this.initCanvasDraw()
			},
      // 初始化绘制
      initCanvasDraw () {
				console.log('开始初始化转盘绘制')
				this.isCacheImg = false
				this.lotteryImg = ''
				clearStore('lotteryImg')
        setStore('prizeList', this.prizeList)
        this.onCreateCanvas()
      }
    },
    mounted() {
      this.$nextTick(() => {
        let stoTimer = setTimeout(() => {
          clearTimeout(stoTimer)
          stoTimer = null
					
					if (this.canvasCached) {
						this.checkCacheImg()
					} else {
						this.onCreateCanvas()
					}
          this.transitionDuration = this.duration
        }, 50)
      })
    }
  }
</script>

<style lang="scss" scoped>
  $lotteryBgUrl: '~static/almost-lottery/almost-lottery__bg';
  $actionBgUrl: '~static/almost-lottery/almost-lottery__action';

  .almost-lottery {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: contain;
    background-image: url($lotteryBgUrl + ".png");

    @media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2) {
      background-image: url($lotteryBgUrl + "2x.png");
    }

    @media (-webkit-min-device-pixel-ratio: 3), (min-device-pixel-ratio: 3) {
      background-image: url($lotteryBgUrl + "3x.png");
    }
  }
	
	.almost-lottery__wrap {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
	}

  .almost-lottery__canvas {
    position: absolute;
    left: -9999px;
    opacity: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .almost-lottery__action {
    position: absolute;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: contain;
    background-image: url($actionBgUrl + ".png");

    @media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2) {
      background-image: url($actionBgUrl + "2x.png");
    }

    @media (-webkit-min-device-pixel-ratio: 3), (min-device-pixel-ratio: 3) {
      background-image: url($actionBgUrl + "3x.png");
    }
  }

  .almost-lottery__measureText {
    position: absolute;
    left: 0;
    top: 0;
    white-space: nowrap;
    font-size: 12px;
    opacity: 0;
  }

  .canvas-img {
		display: block;
    transition: transform cubic-bezier(.34, .12, .05, .95);
  }
</style>
