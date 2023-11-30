# almost-lottery
*使用 Canvas 绘制的抽奖转盘，提供奇数、缓存等众多配置项，更有抽奖概率、抽奖次数、付费抽奖等功能内置于示例项目中*


> <br />
> 
> 如果用着还行，请支持一下
> - 前往 [GitHub](https://github.com/ialmost/almost-components_uniapp) 给个 Star
> - 前往 [UniApp](https://ext.dcloud.net.cn/plugin?id=1030) 给个五星
> - 使用中遇到问题时，可以添加 **QQ群 20441313**
> 
> <br />


## 基于 uniCloud 开发的云端 Almost-Lottery 抽奖转盘，欢迎尝试体验
- [Almost-Lottery抽奖转盘的云端一体页面](https://ext.dcloud.net.cn/plugin?id=5763)
- [Almost-Lottery抽奖转盘的配置中心](https://ext.dcloud.net.cn/plugin?id=5762)


## 高能预警
- 本插件仅支持 `uni_modules` 模式，强烈推荐使用该模式，**非 `uni_modules` 模式不再维护**
- 在使用本插件之前，强烈建议使用 `HBuilderX` 导入示例项目验证可用性并参照修改

## 功能概要
- [x] 可配置奖品文字 **支持横向/竖向展示**
- [x] 可配置每个奖品区块的背景颜色
- [x] 可配置每个奖品区块的奖品文字颜色
- [x] 可配置奖品区块是否开启描边以及边框的颜色，默认不开启
- [x] 可配置转盘外环和抽奖按钮图
- [x] 可配置每个奖品区块的奖品图片，**当图片是网络地址时，小程序端需要配置白名单，H5端需要允许跨域，奖品文字为竖向时不支持展示奖品图片**
- [x] 奖品列表支持奇数，**奇数时需尽量能被 `360` 除尽**
- [x] 可配置内圈与外圈的间距
- [x] 可配置轮盘旋转或指针旋转
- [x] 可配置画板是否缓存，默认不开启
- [x] 更多配置请查看API说明

## 示例项目附加功能
- [x] 中奖概率，**强烈推荐中奖概率应由后端控制**
- [x] 抽奖次数
- [x] 付费抽奖


## 注意事项

- 编译到小程序端时，请务必勾选ES6转ES5

- `@reset-index="prizeIndex = -1"` 必须默认写入到 `template` 中，不可删除

- 每个奖品区块的奖品图片尺寸不宜过大，图片越大，绘制的过程越慢，尽量将图片尺寸控制在 `100*100` 以内，且图片大小控制在 `40KB` 以内

- 关于中奖概率的配置，请下载示例项目，参照 `pages/index/index.vue` 中的代码进行配置

- 组件本身不涉及任何业务逻辑，与业务相关的代码建议都放在 `pages/index/index.vue` 中


## 代码演示
#### 基础用法
```
// template
// @reset-index="prizeIndex = -1" 必须默认写入到 template 中，不可删除
<almost-lottery
  :prizeList="prizeList"
  :prizeIndex="prizeIndex"
  @reset-index="prizeIndex = -1"
  @draw-before="handleDrawBefore"
  @draw-start="handleDrawStart"
  @draw-end="handleDrawEnd"
  @finish="handleDrawFinish"
  v-if="prizeList.length"
/>

// script
import AlmostLottery from '@/uni_modules/almost-lottery/components/almost-lottery/almost-lottery.vue'
export default {
  components: {
    AlmostLottery
  },
  data () {
    return {
      // 以下是奖品配置数据
      // 奖品数据
      prizeList: [],
      // 中奖下标
      prizeIndex: -1
    }
  },
  methods: {
    // 本次抽奖开始之前
    handleDrawStart (callback) {
      // 这里需要处理你抽奖之前的逻辑
      // 请查看示例项目中的代码
      // 必须调用 callback 并传递一个布尔值，布尔值为 true 时，转盘才会开始旋转
      let flag = true
      
      callback(flag)
    },
    // 本次抽奖开始
    handleDrawStart () {
      // 这里需要处理你的抽奖逻辑，并得出中奖物品的 prizeIndex
      // 请查看示例项目中的代码
    },
    // 本次抽奖结束
    handleDrawEnd () {
      // 完成抽奖后，这里处理你拿到结果后的逻辑
      // 请查看示例项目中的代码
    },
    // 抽奖转盘绘制完成
    handleDrawFinish (res) {
      // 抽奖转盘准备就绪后，这里处理你的逻辑
      // 请查看示例项目中的代码
      // console.log('抽奖转盘绘制完成', res)
    }
  }
}
```

## API
#### Props
参数 | 说明 | 类型 | 默认值
:---|:---|:---|:---
pixelRatio | 移动端设计稿的像素比基准值，**涉及到 `rpx` 的适配问题** | *`Number`* | `2`
canvasId | Canvas的标识，**多画板情况下需要配置不同的标识** | *`String`* | `'almostLottery'`
renderDelay | 转盘的渲染延时，**转盘被包裹在 uni-popup 组件内且开启了动画，请设置成最少 300** | *`Number`* | `0`
lotterySize | 抽奖转盘的整体尺寸，单位 `rpx` | *`Number`* | `600`
actionSize | 抽奖按钮的尺寸，单位 `rpx` | *`Number`* | `200`
canvasMarginOutside | Canvas边缘距离转盘边缘的距离，单位`rpx` | *`Number`* | `90`
prizeIndex | 获奖奖品在奖品列表中的序号，**每次抽奖结束后会自动重置为 `-1`** | *`Number`* | `-1`
prizeList | 奖品列表，支持奇数（尽量能被 `360` 除尽），**为奇数时需要重设 `colors` 参数** | *`Array`* | -
lotteryBg | 转盘外环图片 | `String` | `默认内置的本地图片`
actionBg | 抽奖按钮图片 | `String` | `默认内置的本地图片`
colors | 奖品区块对应的背景颜色，默认 2 个颜色相互交替，**也可以对每个区块设置不同颜色** | *`Array`* | `['#FFFFFF', '#FFBF05']`
prizeNameDrawed | 是否绘制奖品名称 | *`Boolean`* | `true`
stroked | 是否开启奖品区块描边 | *`Boolean`* | `false`
strDirection | 奖品名称展示方向，可选值 `'horizontal'` => 横向 `'vertical'` => 竖向 | *`String`* | `'horizontal'`
strokeColor | 奖品区块边框颜色 | *`String`* | `'#FFBF05'`
rotateType | 旋转的类型，可选值 `'roulette'` => 轮盘旋转 `'pointer'` => 指针旋转 | *`String`* | `'roulette'`
selfRotaty | 是否开启自转，开启后`duration`和`ringCount`参数不生效 | *`Boolean`* | `false`
selfTime | 开启自转时，最少转多少毫秒 | *`Number`* | `1000`
duration | 转盘旋转的动画时长，单位：秒 | *`Number`* | `8`
ringCount | 旋转的圈数 | *`Number`* | `8`
pointerPosition | 点击抽奖按钮指针的位置，可选值 `'edge'` => 指向边界 `'middle'` => 指向中间 | *`String`* | `'edge'`
strFontColors | 奖品文字颜色，默认 2 个颜色相互交替，**也可以对每个区块的文字设置不同颜色，或仅设置一个颜色** | *`Array`* | `['#FFBF05', '#FFFFFF']`
strFontSize | 奖品名称的字号，单位 `rpx` | *`Number`* | `24`
strLineHeight | 奖品名称多行情况下的行高 | *`Number`* | `1.2`
strMaxLen | 奖品名称长度限制，为`0`时不限制，**文字竖向时不生效** | *`Number`* | `12`
strLineLen | 奖品名称在多行情况下第一行文字的长度，**文字竖向时不生效** | *`Number`* | `6`
strMarginOutside | 奖品文字相对轮盘边缘的距离，单位 `rpx` | *`Number`* | `strFontSize 的一半`
imgMarginStr | 奖品图片相对奖品文字的距离，单位 `rpx` | *`Number`* | `60`
imgWidth | 奖品图片的宽度，单位 `rpx` | *`Number`* | `50`
imgHeight | 奖品图片的高度，单位 `rpx` | *`Number`* | `50`
imgDrawed | 是否绘制奖品图片，默认绘制 | *`Boolean`* | `true`
imgCircled | 奖品图片是否裁切为圆形，默认不裁切 | *`Boolean`* | `false`
successMsg | 转盘绘制成功的提示 | *`String`* | `'奖品准备就绪，快来参与抽奖吧'`
failMsg | 转盘绘制失败的提示 | *`String`* | `'奖品仍在准备中，请稍后再来...'`
canvasCached | 是否开启缓存，避免在数据不变的情况下重复绘制，建议在生产环境中开启 | *`Boolean`* | `false`

#### Events
事件名 | 说明 | 回调参数
:---|:---|:---|:---
@reset-index | 每次抽奖结束后重置获奖的序号为 `-1`，**该事件必须默认写入到 `template` 中，不可删除** | -
@draw-before | 转盘旋转之前触发，**该事件必须默认写入到 `template` 中，不可删除** | `callback(Boolean)`
@draw-start | 转盘旋转开始时触发 | -
@draw-end | 转盘旋转结束时触发 | -
@finish | Canvas转盘绘制完成时触发 | `{ ok: 绘制是否成功, data: 转盘的图片, msg: 绘制结果的提示 }`

#### prizeList 数据结构
*请按如下数据字段对你的奖品列表数据结构进行调整*
键名 | 说明 | 类型
:---|:---|:---
prizeId | 奖品对应 `ID` | *`Number`*
prizeName | 奖品名称 | *`String`*
prizeStock | 奖品库存 | *`Number`*
prizeWeight | 奖品权重 | *`Number`*
prizeImage | 奖品图片地址，网络图片仅支持`http`和`https`协议 | *`String`*