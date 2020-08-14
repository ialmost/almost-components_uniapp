# raffle-wheel
uni-app 使用的 Canvas 抽奖转盘

[uni-app 插件地址](https://ext.dcloud.net.cn/plugin?id=1030)


## 使用说明

#### 编译到小程序端时，请务必勾选ES6转ES5

#### 抽奖组件本身不会涉及任何业务逻辑

#### 关于中奖概率的逻辑在示例项目的pages/index/index.vue文件中，仅供参考

#### 引入组件
```
<script>
  import RaffleWheel from '@/components/raffle-wheel/raffle-wheel.vue'
  export default {
    components: {
      RaffleWheel
    }
  }
</script>
```

#### 参数
参数名 | 参数类型 | 参数说明 | 是否必须
:---:|:---:|---|:---:
ref | String | 抽奖组件实例 | 是
canvasWidth | Number | canvas 宽度，单位 `px`，默认为 `240` | 否
canvasHeight | Number | canvas 高度，单位 `px`，默认为 `240` | 否
prizeList | Array | 奖品列表，必须是偶数 | 是
colors | Array | 奖品区块对应的背景颜色，仅支持 2 个颜色相互交替，默认为 `['#FFF', '#FFE9AA']`  | 否
duration | Number | 转盘旋转的动画时长，单位：秒，默认为 `8` | 否
ringCount | Number | 旋转的圈数，默认为 `8` | 否
fontColor | String | 奖品文字的颜色，默认为 `#C30B29` | 否
fontSize | Number | 奖品文字的大小，默认为 `12` | 否
lineHeight | Number | 奖品文字多行情况下的行高，默认为 `20` | 否
strKey | String | 奖品名称所对应的 `key` 的名字，比如 `{ name: "uni-app" }`，`strKey` 就是 `name` | 是
strMaxLength | Number | 奖品文字总长度限制，默认为 `12` | 否
strLineLength | Number | 奖品文字多行情况下第一行文字的长度，默认为`6` | 否
