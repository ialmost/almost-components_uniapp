# almost-lottery
Canvas 抽奖转盘，支持APP、小程序、H5
[uni-app 插件市场](https://ext.dcloud.net.cn/plugin?id=1030)


## 注意事项

- 编译到小程序端时，请务必勾选ES6转ES5

- 抽奖组件本身不会涉及任何业务逻辑

- 关于中奖概率的业务逻辑在示例项目的pages/index/index.vue文件中，仅供参考

### 引入
```
// template
<almost-lottery :ref="refName" :prize-list="prizeList" />

// script
import AlmostLottery from '@/components/almost-lottery/almost-lottery.vue'
export default {
  components: {
    AlmostLottery
  },
  data () {
    return {
      // 组件实例名称
      refName: 'almostLottery',
      // 奖品数据
      prizeList: [
        { prizeId: 1, name: '0.1元现金' },
        { prizeId: 2, name: '10元现金' },
        { prizeId: 3, name: '5元话费' },
        { prizeId: 4, name: '50元现金' },
        { prizeId: 5, name: '1卷抽纸' },
        { prizeId: 6, name: '0.02元现金' },
        { prizeId: 7, name: '谢谢参与' },
        { prizeId: 8, name: '100金币' }
      ]
    }
  },
  methods: {
    // 请直接下载示例项目查看
  }
}
```

### API
#### Props
参数 | 说明 | 类型 | 默认值
:---|:---|:---|:---
ref | 抽奖组件实例的名称，对应 `data` 中的 `refName` | *`String`* | -
canvas-width | Canvas 的宽度 | *`Number`* | `240`
canvas-height | Canvas 的高度 | *`Number`* | `240`
prize-list | 奖品数据，**数组长度必须是偶数** | *`Array`* | -
colors | 奖品区块对应的背景颜色，**仅支持 2 个颜色相互交替** | *`Array`* | `['#FFFFFF', '#FFE9AA']`
duration | 转盘旋转的动画时长，单位：秒 | *`Number`* | `8`
ring-count | 旋转的圈数 | *`Number`* | `8`
font-color | 奖品文字的颜色 | *`String`* | `#C30B29`
font-size | 奖品文字的字号 | *`Number`* | `12`
line-height | 奖品文字多行情况下的行高 | *`Number`* | `20`
str-key | 奖品名称所对应的 `key` ，比如 `{ name: "almost-lottery" }`，`strKey` 就是 `name` | *`String`* | `name`
strMaxLength | 奖品文字总长度限制 | *`Number`* | `12`
strLineLength | 奖品文字在多行情况下第一行文字的长度 | *`Number`* | `6`

#### Events
事件名 | 说明 | 回调参数
:---|:---|:---
draw-start | 转盘旋转开始时触发 | -
draw-end | 转盘旋转结束时触发 | -
finish | Canvas转盘绘制完成时触发 | -