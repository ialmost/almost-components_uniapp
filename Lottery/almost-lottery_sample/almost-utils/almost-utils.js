/**
 * 存储 localStorage 数据
 * @param {String} name - 缓存数据的标识
 * @param {any} content - 缓存的数据内容
 */
export const setStore = (name, content) => {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
	uni.setStorageSync(name, content)
}

/**
 * 获取 localStorage 数据
 * @param {String} name - 缓存数据的标识
 */
export const getStore = (name) => {
  if (!name) return
  return uni.getStorageSync(name)
}

/**
 * 清除 localStorage 数据
 * @param {String} name - 缓存数据的标识
 */
export const clearStore = (name) => {
  if (name) {
		uni.removeStorageSync(name)
  } else {
    console.log('清理本地全部缓存')
    uni.clearStorageSync()
  }
}

/**
 * 下载文件，并返回临时路径
 * @return {String}  临时路径
 * @param {String} fileUrl - 网络地址
*/
export const downloadFile = (fileUrl) => {
  return new Promise((resolve) => {
    uni.downloadFile({
      url: fileUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve({
            ok: true,
            tempFilePath: res.tempFilePath
          })
        } else {
          resolve({
            ok: false,
            msg: '图片下载失败'
          })
        }
      },
      fail: (err) => {
        resolve({
          ok: false,
          msg: `图片下载失败，${err}`
        })
      }
    })
  })
}
