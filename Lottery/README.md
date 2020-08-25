# almost-lottery
*使用 Canvas 绘制的抽奖转盘*

> <br />
> 
> 如果用着还行，请支持一下
> - 前往 [GitHub](https://github.com/ialmost/almost-components_uniapp) 给个 Star
> - 前往 [UniApp](https://ext.dcloud.net.cn/plugin?id=1030) 给个五星
> <br />
> 

## 兼容情况
平台兼容 | 页面兼容
:---|:---
APP、小程序、H5 | vue


## 功能概要
- [x] 可配置奖品文字
- [x] 可配置每个奖品区块的背景颜色
- [x] 可配置本地奖品图片，*不支持远程图片*
- [x] 奖品列表支持奇数，*奇数时需尽量能被 `360` 除尽*
- [x] 组件内 `SCSS` 样式中可替换转盘的外环背景图及点击抽奖按钮图，分别是 `$lotteryBgUrl` 和 `$actionBgUrl`，*如需替换，需要适配高清设备*
- [x] 可配置中奖概率，**请下载示例项目并查看 `index.vue` 文件**


## 注意事项

- 编译到小程序端时，请务必勾选ES6转ES5

- `@reset-index="prizeIndex = -1"` 必须默认写入到 `template` 中，不可删除

- 奖品图片仅支持配置本地图片，远程图片会存在跨域、需提前下载等问题，且小程序端还需要配置白名单，为了各端统一，所以暂时不支持远程图片

- 抽奖组件本身不会涉及任何业务逻辑

- 关于中奖概率的业务逻辑在示例项目的 `pages/index/index.vue` 文件中，仅供参考


## 引入
```
// template
<almost-lottery
  :prize-list="prizeList"
  :prize-index="prizeIndex"
  @reset-index="prizeIndex = -1"
  @draw-start="handleDrawStart"
  v-if="prizeList.length"
/>

// script
import AlmostLottery from '@/components/almost-lottery/almost-lottery.vue'
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
        { prizeId: 1, name: '0.1元现金', stock: 10, weight: 1, imgSrc: '/static/lottery-prize/git.png' },
        { prizeId: 2, name: '10元现金', stock: 0, weight: 0 },
        { prizeId: 3, name: '5元话费', stock: 1, weight: 0 },
        { prizeId: 4, name: '50元现金', stock: 0, weight: 0 },
        { prizeId: 5, name: '1卷抽纸', stock: 3, weight: 3 },
        { prizeId: 6, name: '0.20元现金', stock: 8, weight: 2 },
        { prizeId: 7, name: '谢谢参与', stock: 100, weight: 10000 },
        { prizeId: 8, name: '100金币', stock: 100, weight: 1000 }
      ]
    }
  },
  methods: {
    // 本次抽奖开始
    handleDrawStart () {
      // 这里需要处理你的中奖逻辑，并得出 prizeIndex
      // 可查看示例项目中的代码
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
font-color | 奖品名称的颜色 | *`String`* | `#C30B29`
font-size | 奖品名称的字号 | *`Number`* | `12`
line-height | 奖品名称多行情况下的行高 | *`Number`* | `16`
str-key | 奖品名称所对应的 `key` ，比如 `{ name: "almost-lottery" }`，`strKey` 就是 `name` | *`String`* | `name`
str-max-len | 奖品名称长度限制 | *`Number`* | `12`
str-line-len | 奖品名称在多行情况下第一行文字的长度 | *`Number`* | `6`

#### Events
事件名 | 说明 | 回调参数
:---|:---|:---
reset-index | 每次抽奖结束后重置获奖的序号为 `-1`，**该事件必须默认写入到 `template` 中，不可删除** | -
draw-start | 转盘旋转开始时触发 | -
draw-end | 转盘旋转结束时触发 | -
finish | Canvas转盘绘制完成时触发 | -