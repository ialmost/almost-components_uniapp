/**
 * 下载图片文件，并返回临时路径
 * @return {String}  图片临时路径
 * @param {String} fileUrl - 图片网络地址
*/
export const downImgFile = (fileUrl) => {
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
