# almost-lottery
*使用 Canvas 绘制的抽奖转盘*


> <br />
> 
> 如果用着还行，请支持一下
> - 前往 [GitHub](https://github.com/ialmost/almost-components_uniapp) 给个 Star
> - 前往 [UniApp](https://ext.dcloud.net.cn/plugin?id=1030) 给个五星
> 
> <br />


## 高能预警
- 本插件已支持 `uni_modules` 模式，强烈推荐使用该模式，非 `uni_modules` 模式不再维护
- 在使用本插件之前，强烈建议使用 `HBuilderX` 导入示例项目验证可用性并参照修改

## 功能概要
- [x] 可配置奖品文字
- [x] 可配置每个奖品区块的背景颜色
- [x] 可配置每个奖品区块的奖品图片，**当图片是网络地址时，小程序端需要配置白名单，H5端需要允许跨域**
- [x] 奖品列表支持奇数，**奇数时需尽量能被 `360` 除尽**
- [x] 组件内 `SCSS` 样式中可替换转盘的外环背景图及点击抽奖按钮图，分别是 `$lotteryBgUrl` 和 `$actionBgUrl`，**如需替换，需要适配高清设备**
- [x] 可配置中奖概率，**强烈推荐中奖概率应由后端控制**
- [x] 可配置画板是否缓存
- [x] 可配置内圈与外圈的间距


## 注意事项

- 编译到小程序端时，请务必勾选ES6转ES5

- `@reset-index="prizeIndex = -1"` 必须默认写入到 `template` 中，不可删除

- 每个奖品区块的奖品图片尺寸不宜过大，图片越大，绘制的过程越慢，尽量将图片尺寸控制在 `300*300` 以内

- 关于中奖概率的配置，请下载示例项目，参照 `pages/index/index.vue` 中的代码进行配置

- 组件本身不涉及任何业务逻辑，与业务相关的代码建议都放在 `pages/index/index.vue` 中


## 代码演示
#### 基础用法
```
// template
// @reset-index="prizeIndex = -1" 必须默认写入到 template 中，不可删除
<almost-lottery
  :prize-list="prizeList"
  :prize-index="prizeIndex"
  @reset-index="prizeIndex = -1"
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
      // 获奖奖品序号，每次抽奖结束后需要重置为 -1
      prizeIndex: -1,
      // 奖品数据
      prizeList: [
        { prizeId: 1, name: '0.1元现金', stock: 10, weight: 1, prizeImage: '/static/git.png' },
        { prizeId: 2, name: '10元现金', stock: 0, weight: 0, prizeImage: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/56f085e0-bcfe-11ea-b244-a9f5e5565f30.png' },
        { prizeId: 3, name: '5元话费', stock: 1, weight: 0 },
        { prizeId: 4, name: '50元现金', stock: 0, weight: 0 },
        { prizeId: 5, name: '1卷抽纸', stock: 3, weight: 3 },
        { prizeId: 6, name: '0.20元现金', stock: 8, weight: 2 },
        { prizeId: 7, name: '谢谢参与', stock: 100, weight: 10000 },
        { prizeId: 8, name: '100金币', stock: 100, weight: 1000 }
      ],
      // 中奖下标
      prizeIndex: -1,
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
    // 本次抽奖开始
    handleDrawStart () {
      // 这里需要处理你的中奖逻辑，并得出 prizeIndex
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
canvas-width | Canvas 的宽度 | *`Number`* | `240`
canvas-height | Canvas 的高度 | *`Number`* | `240`
prize-index | 获奖奖品在奖品列表中的序号，**每次抽奖结束后会自动重置为 `-1`** | *`Number`* | `-1`
prize-list | 奖品列表，支持奇数（尽量能被 `360` 除尽），**为奇数时需要重设 `colors` 参数** | *`Array`* | -
colors | 奖品区块对应的背景颜色，默认 2 个颜色相互交替，**也可以对每个区块设置不同颜色** | *`Array`* | `['#FFFFFF', '#FFE9AA']`
duration | 转盘旋转的动画时长，单位：秒 | *`Number`* | `8`
ring-count | 旋转的圈数 | *`Number`* | `8`
pointer-position | 点击抽奖按钮指针的位置，可选值 `'edge'` => 指向边界 `'middle'` => 指向中间 | *`String`* | `'edge'`
font-color | 奖品名称的颜色 | *`String`* | `'#C30B29'`
font-size | 奖品名称的字号 | *`Number`* | `12`
line-height | 奖品名称多行情况下的行高 | *`Number`* | `16`
str-key | 奖品名称所对应的键名 `key` ，比如 `{ name: '88元现金' }`，`str-key` 就是 `'name'` | *`String`* | `'name'`
str-max-len | 奖品名称长度限制 | *`Number`* | `12`
str-line-len | 奖品名称在多行情况下第一行文字的长度 | *`Number`* | `6`
strMarginOutside | 奖品文字距离边缘的距离 | *`Number`* | `font-size` 的一半
image-width | 奖品图片的宽度 | *`Number`* | `30`
image-height | 奖品图片的高度 | *`Number`* | `30`
successMsg | 转盘绘制成功的提示 | *`String`* | `'奖品准备就绪，快来参与抽奖吧'`
failMsg | 转盘绘制失败的提示 | *`String`* | `'奖品仍在准备中，请稍后再来...'`
canvasCached | 是否开启缓存，避免在数据不变的情况下重复绘制 | *`Boolean`* | `true`
canvasMargin | 内圈与外圈的间距 | *`Number`* | `5`

#### Events
事件名 | 说明 | 回调参数
:---|:---|:---
reset-index | 每次抽奖结束后重置获奖的序号为 `-1`，**该事件必须默认写入到 `template` 中，不可删除** | -
draw-start | 转盘旋转开始时触发 | -
draw-end | 转盘旋转结束时触发 | -
finish | Canvas转盘绘制完成时触发 | ok: 绘制是否成功, data: 转盘的图片, msg: 绘制结果的提示

#### prizeList 数据结构
键名 | 说明 | 类型
:---|:---|:---
prizeId | 奖品对应 `ID` | *`Number`*
name | 奖品名称 | *`String`*
stock | 奖品库存 | *`Number`*
weight | 奖品权重 | *`Number`*
prizeImage | 奖品图片地址 | *`String`*