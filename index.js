const getPageData = require("./module/getPageData")
const init = require("./module/init")

!(async () => {

  // 所需的常量
  const { wgArticleId, wgPageName, wgAction, wgRelevantPageIsProbablyEditable } = mw.config.get()

  // 如果不符合条件则直接结束
  if (!window.InPageMigrateFrom) {
    console.info('[InPageMigrate]', 'Please set API via window.InPageMigrateFrom')
    return
  }
  if (wgAction !== 'view') return // 不是浏览状态
  if (!wgRelevantPageIsProbablyEditable) return // 不可编辑
  if (wgArticleId !== 0) return // 页面存在

  // 走
  init()

})()