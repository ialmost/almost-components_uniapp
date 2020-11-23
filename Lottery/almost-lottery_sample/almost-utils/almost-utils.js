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
        // #ifdef MP-ALIPAY
        if (res.errMsg === 'downloadFile:ok') {
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
        // #endif
				// #ifndef MP-ALIPAY
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
				// #endif
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

/**
 * 清理应用已缓存的文件
*/
export const clearCacheFile = () => {
	// #ifndef H5
	uni.getSavedFileList({
		success: (res) => {
			let fileList = res.fileList
			if (fileList.length) {
				for (let i = 0; i < fileList.length; i++) {
					uni.removeSavedFile({
						filePath: fileList[i].filePath,
						complete: () => {
							console.log('清除缓存已完成')
						}
					})
				}
			}
		},
		fail: (err) => {
			console.log('getSavedFileList Fail')
		}
	})
	// #endif
	// #ifdef H5
	clearStore()
	// #endif
}
