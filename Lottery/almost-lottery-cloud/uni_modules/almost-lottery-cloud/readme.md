# Almost-Lottery抽奖转盘的云端一体页面
*基于Almost-Lottery抽奖转盘的云端一体页面，并结合配套的Almost-Lottery抽奖转盘的配置中心，实现前后端完美衔接*


> <br />
> 
> 如果用着还行，请支持一下
> - 前往 [GitHub](https://github.com/ialmost/almost-components_uniapp) 给个 Star
> - 前往 [UniApp](https://ext.dcloud.net.cn/plugin?id=1030) 给个五星
> - 使用中遇到问题时，可以添加 **QQ群 20441313**
> 
> <br />


## 配套项目
- [Almost-Lottery抽奖转盘的配置中心](https://ext.dcloud.net.cn/plugin?id=5762)


## 安装指引

1. 使用`HBuilderX 3.1.22+`，因为要使用到`uni_modules`

2. 使用已有`uniCloud`项目或新建项目：`打开HBuilderX` -> `文件` -> `新建` -> `项目` -> `uni-app` 选择 `Hello uniCloud`模板，键入一个名字，确定

3. 鼠标右键选择`关联云服务空间`和`运行云服务空间初始化向导`

3. 在插件市场打开本插件页面，在右侧点击`使用 HBuilderX 导入插件`，选择 `uniCloud` 项目点击确定

4. 等待下载安装完毕。由于本插件依赖一些uni-ui插件，下载完成后会显示合并插件页面，自行选择即可

5. 找到`/uni_modules/almost-lottery-cloud/uniCloud/cloudfunctions/almost-passport`，右键上传部署

6. 找到`/uni_modules/almost-lottery-cloud/uniCloud/database/db_init.json`，右键初始化数据库

7. 找到`/uniCloud/cloudfunctions`，右键上传所有部署

8. 找到`/uniCloud/database/db_init.json`，右键初始化数据库

9. 在`pages.json`中添加页面路径
```json
//此结构与uniCloud admin中的pages.json结构一致
"pages": [
  {
    "path": "uni_modules/almost-lottery-cloud/pages/lottery",
    "style": {
      "app-plus": {
        "scrollIndicator": "none"
      }
    }
  }
]
```

10. 前往 [Almost-Lottery抽奖转盘的配置中心](https://ext.dcloud.net.cn/plugin?id=5762) 安装配套的 `Admin` 插件
