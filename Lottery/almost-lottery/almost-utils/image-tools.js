// 图像转换工具，可用于图像和base64的转换
// https://ext.dcloud.net.cn/plugin?id=123

const getLocalFilePath = (path) => {
  if (
    path.indexOf('_www') === 0 ||
    path.indexOf('_doc') === 0 ||
    path.indexOf('_documents') === 0 ||
    path.indexOf('_downloads') === 0
  ) return path

  if (path.indexOf('/storage/emulated/0/') === 0) return path
	
  if (path.indexOf('/storage/sdcard0/') === 0) return path

  if (path.indexOf('/var/mobile/') === 0) return path

  if (path.indexOf('file://') === 0) return path

  if (path.indexOf('/') === 0) {
		// ios 无法获取本地路径
    let localFilePath = plus.os.name === 'iOS' ? path : plus.io.convertLocalFileSystemURL(path)
    if (localFilePath !== path) {
      return localFilePath
    } else {
      path = path.substring(1)
    }
  }
	
  return '_www/' + path
}

export const pathToBase64 = (path) => {
	return new Promise((resolve, reject) => {
		if (typeof window === 'object' && 'document' in window) {
			if (typeof FileReader === 'function') {
				let xhr = new XMLHttpRequest()
				xhr.open('GET', path, true)
				xhr.responseType = 'blob'
				xhr.onload = function() {
					if (this.status === 200) {
						let fileReader = new FileReader()
						fileReader.onload = function(e) {
							resolve(e.target.result)
						}
						fileReader.onerror = reject
						fileReader.readAsDataURL(this.response)
					}
				}
				xhr.onerror = reject
				xhr.send()
				return
			}
			let canvas = document.createElement('canvas')
			let c2x = canvas.getContext('2d')
			let img = new Image
			img.onload = function() {
				canvas.width = img.width
				canvas.height = img.height
				c2x.drawImage(img, 0, 0)
				resolve(canvas.toDataURL())
				canvas.height = canvas.width = 0
			}
			img.onerror = reject
			img.src = path
			return
		}
		
		if (typeof plus === 'object') {
			let tempPath = getLocalFilePath(path)
			plus.io.resolveLocalFileSystemURL(tempPath, (entry) => {
				entry.file((file) => {
					let fileReader = new plus.io.FileReader()
					fileReader.onload = function(data) {
						resolve(data.target.result)
					}
					fileReader.onerror = function(error) {
						console.log(error)
						reject(error)
					}
					fileReader.readAsDataURL(file)
				}, (error) => {
					reject(error)
				})
			}, (error) => {
				reject(error)
			})
			return
		}
		
		if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
			wx.getFileSystemManager().readFile({
				filePath: path,
				encoding: 'base64',
				success: (res) => {
					resolve('data:image/png;base64,' + res.data)
				},
				fail: (error) => {
					reject(error)
				}
			})
			return
		}
		reject(new Error('not support'))
	})
}

export const base64ToPath = (base64) => {
	return new Promise((resolve, reject) => {
		if (typeof window === 'object' && 'document' in window) {
			base64 = base64.split(',')
			let type = base64[0].match(/:(.*?);/)[1]
			let str = atob(base64[1])
			let n = str.length
			let array = new Uint8Array(n)
			while (n--) {
				array[n] = str.charCodeAt(n)
			}
			return resolve((window.URL || window.webkitURL).createObjectURL(new Blob([array], {
				type: type
			})))
		}
		let extName = base64.match(/data\:\S+\/(\S+);/)
		if (extName) {
			extName = extName[1]
		} else {
			reject(new Error('base64 error'))
		}
		let fileName = Date.now() + '.' + extName
		if (typeof plus === 'object') {
			let bitmap = new plus.nativeObj.Bitmap('bitmap' + Date.now())
			bitmap.loadBase64Data(base64, () => {
				let filePath = '_doc/uniapp_temp/' + fileName
				bitmap.save(filePath, {}, () => {
					bitmap.clear()
					resolve(filePath)
				}, (error) => {
					bitmap.clear()
					reject(error)
				})
			}, (error) => {
				bitmap.clear()
				reject(error)
			})
			return
		}
		if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
			let filePath = wx.env.USER_DATA_PATH + '/' + fileName
			wx.getFileSystemManager().writeFile({
				filePath: filePath,
				data: base64.replace(/^data:\S+\/\S+;base64,/, ''),
				encoding: 'base64',
				success: () => {
					resolve(filePath)
				},
				fail: (error) => {
					reject(error)
				}
			})
			return
		}
		reject(new Error('not support'))
	})
}
