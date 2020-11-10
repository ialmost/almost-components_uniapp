<template>
  <view class="almost-lottery" :style="{ width: canvasWidth + 44 + 'px', height: canvasHeight + 44 + 'px'}">
    <view class="almost-lottery-wrap" :style="{width: canvasWidth + 'px', height: canvasHeight + 'px'}">
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
      <image class="canvas-img" :src="canvasImg" :style="{
         width: canvasWidth + 'px',
         height: canvasHeight + 'px',
         transform: `rotate(${canvasAngle + targetAngle}deg)`,
         transitionDuration: `${transitionDuration}s`
       }"
        v-if="canvasImg"></image>
      <view class="almost-lottery__action" @click="handleActionStart"></view>
      <!-- 为了兼容 app 端 ctx.measureText 所需的标签 -->
      <text class="almost-lottery__measureText">{{ measureText }}</text>
    </view>
  </view>
</template>

<script>
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
      }
    },
    data() {
      return {
        // 画板className
        className: 'almost-lottery__canvas',
        // 画板标识
        canvasId: 'almostLotteryCanvas',
        // 画板导出的图片
        canvasImg: '',
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
        // 解决 app 不支持 measureText 的问题
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
        if (this.isRotate) return
        this.isRotate = true
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
          let rewardName = this.strLimit(this.prizeList[i][this.strKey])

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
          if (this.prizeList[i].imgSrc) {
            ctx.drawImage(this.prizeList[i].imgSrc, -(this.imageWidth / 2), canvasW / 10, this.imageWidth, this.imageHeight)
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
                this.handlePrizeImg(res.apFilePath)
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
                this.handlePrizeImg(res.tempFilePath)
              }
            }, this)
            // #endif
          }, 500)
        })
      },
      // 处理导出的图片
      handlePrizeImg(imgPath) {
        this.canvasImg = imgPath
        this.$emit('finish')
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
      }
    },
    mounted() {
      this.$nextTick(() => {
        let stoTimer = setTimeout(() => {
          clearTimeout(stoTimer)
          stoTimer = null

          this.onCreateCanvas()
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
    position: relative;
    left: 0;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

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

    @media (-webkit-min-device-pixel-ratio: 3),
    (min-device-pixel-ratio: 3) {
      background-image: url($lotteryBgUrl + "3x.png");
    }
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
    top: calc(50% - 62px);
    left: calc(50% - 58px);
    width: 114px;
    height: 114px;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: contain;
    background-image: url($actionBgUrl + ".png");

    @media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2) {
      background-image: url($actionBgUrl + "2x.png");
    }

    @media (-webkit-min-device-pixel-ratio: 3),
    (min-device-pixel-ratio: 3) {
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
    transition: transform cubic-bezier(.34, .12, .05, .95);
  }
</style>
