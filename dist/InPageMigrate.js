/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./module/getContent.js":
/*!******************************!*\
  !*** ./module/getContent.js ***!
  \******************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = async (url, page) => {
  const jsonp = __webpack_require__(/*! ./jsonp */ "./module/jsonp.js")
  var data = await jsonp(url, {
    format: 'json',
    action: 'parse',
    page,
    prop: 'wikitext'
  })
  console.info('PageData', page, data)
  return data
}

/***/ }),

/***/ "./module/getPageData.js":
/*!*******************************!*\
  !*** ./module/getPageData.js ***!
  \*******************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = async (url, page) => {
  const jsonp = __webpack_require__(/*! ./jsonp */ "./module/jsonp.js")
  var data = await jsonp(url, {
    format: 'json',
    action: 'parse',
    page,
    prop: 'templates'
  })
  return data
}

/***/ }),

/***/ "./module/init.js":
/*!************************!*\
  !*** ./module/init.js ***!
  \************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 4:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const getPageData = __webpack_require__(/*! ./getPageData */ "./module/getPageData.js")
const resolvePage = __webpack_require__(/*! ./resolvePage */ "./module/resolvePage.js")

module.exports = () => {

  // 所需的常量
  const fromUrl = window.InPageMigrateFrom
  const { wgPageName } = mw.config.get()

  // 获取 dom
  var $mwContent = $('#mw-content-text')

  // 构建 jQuery 对象
  var $form = $('<div>', { class: 'InPageMigrate ipm-all' })
  $form.appendTo($mwContent)

  var $pageName = $('<input>', { class: 'ipm-pageName', value: wgPageName }),
    $startBtn = $('<button>', { class: 'ipm-startBtn', text: '获取信息' }),
    $postButton = $('<button>', { class: 'ipm-startBtn', text: '确认迁移', disabled: true }),
    $detailArea = $('<section>', { class: 'ipm-detailArea', text: '操作日志' }),
    $progressArea = $('<ul>', { class: 'ipm-progressArea' })

  $form.append(
    $('<h3>', { text: '快速迁移页面' }),
    $('<p>', { text: '您正在从 API 接口为 ' + fromUrl + ' 的 wiki 迁移内容。' }),
    $('<label>', { style: 'display: block' }).append(
      '迁移：',
      $pageName,
      ' → ',
      $('<i>', { text: wgPageName })
    ),
    $('<div>', { class: 'ipm-container' }).append(
      $('<div>', { class: 'ipm-buttonArea' }).append(
        $startBtn,
        $postButton,
      ),
      $detailArea.append(
        $progressArea
      )
    )
  )

  // @function pushProgress
  function pushProgress(str) {
    var now = new Date()
    $progressArea.prepend(
      $('<li>').append(
        `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}] `,
        str
      )
    )
  }

  // 获取信息
  $startBtn.click(async function () {
    // 初始化
    $startBtn.attr('disabled', 'disabled')
    $postButton.attr('disabled', 'disabled')
    $form.data('pageList', [])
    pushProgress('【等待】正在获取源页面(' + $pageName.val() + ')的基础信息……')

    // 获取信息
    const pageData = await getPageData(fromUrl, $pageName.val())

    // 遇到错误
    if (pageData.error || !pageData.parse) {
      pushProgress('【错误】遇到以下问题：' + JSON.stringify(pageData))
      $startBtn.attr('disabled', false).text('重试')
      return
    }

    var { parse } = pageData

    // 获取所需页面列表
    $form.data('pageList', [$pageName.val()])
    $.each(parse.templates, (_, item) => {
      var pageList = $form.data('pageList')
      if (item.exists === '') pageList.push(item['*'])
      $form.data('pageList', pageList)
    })

    // 缓存所需页面
    var neededPages = $form.data('pageList')

    // 展示所需页面
    pushProgress('【信息】成功获取页面信息，需要迁移以下页面：' + neededPages.join('、') + ' (共计' + neededPages.length + '个页面)')
    pushProgress('【确认】请确认是否开始迁移……')

    $startBtn.attr('disabled', false)
    $postButton.attr('disabled', false)
  })

  $postButton.click(function () {
    var neededPages = $form.data('pageList')
    if (!neededPages) {
      pushProgress('【错误】找不到需要的页面列表，请重新获取页面信息。')
      return
    }

    async function loopResolve(i) {
      var from = neededPages[i],
        to = neededPages[i]
      if (i === 0) to = wgPageName
      pushProgress(`【信息】正在从 ${from} 迁移页面到 ${to} (${i + 1}/${neededPages.length})`)
      await resolvePage(fromUrl, from, to, pushProgress)
      if (i < (neededPages.length - 1)) {
        loopResolve(i + 1)
      } else {
        pushProgress('【完成】页面迁移已完成，请刷新页面后检查。')
        pushProgress(
          $('<a>', { href: mw.util.getUrl(wgPageName, { action: 'purge' }), text: '立即刷新' })
        )
      }
    }

    loopResolve(0)

  })
}

/***/ }),

/***/ "./module/jsonp.js":
/*!*************************!*\
  !*** ./module/jsonp.js ***!
  \*************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = async (url, data = {}) => {
  if (!url) return false
  return $.ajax({
    dataType: 'jsonp',
    url,
    data
  })
}

/***/ }),

/***/ "./module/pageExist.js":
/*!*****************************!*\
  !*** ./module/pageExist.js ***!
  \*****************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = async (page) => {
  var data = await $.get(mw.config.get('wgScriptPath') + '/api.php', {
    format: 'json',
    action: 'parse',
    prop: '',
    page
  })

  if (data.error || !data.parse || data.parse.pageid === 0) return false
  return true
}

/***/ }),

/***/ "./module/postContent.js":
/*!*******************************!*\
  !*** ./module/postContent.js ***!
  \*******************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module */
/*! CommonJS bailout: module.exports is used directly at 1:0-14 */
/***/ ((module) => {

module.exports = (title, text) => {
  return $.post(mw.config.get('wgScriptPath') + '/api.php', {
    format: 'json',
    action: 'edit',
    token: mw.user.tokens.get('editToken'),
    title,
    text,
    summary: '[InPageMigrate] 自动导入页面'
  })
}

/***/ }),

/***/ "./module/resolvePage.js":
/*!*******************************!*\
  !*** ./module/resolvePage.js ***!
  \*******************************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: module, __webpack_require__ */
/*! CommonJS bailout: module.exports is used directly at 5:0-14 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const getContent = __webpack_require__(/*! ./getContent */ "./module/getContent.js")
const pageExist = __webpack_require__(/*! ./pageExist */ "./module/pageExist.js")
const postContent = __webpack_require__(/*! ./postContent */ "./module/postContent.js")

module.exports = async (url, from, to, pushProgress) => {

  var $def = $.Deferred()

  var exist = await pageExist(to)

  if (exist) {
    var $yes = $('<a>', { class: 'ipm-existPageYes', text: '是', href: 'javascript:;' }),
      $no = $('<a>', { class: 'ipm-existPageYes', text: '否', href: 'javascript:;' }),
      $confirmBtn = $('<span>').append($yes, '/', $no)

    $yes.click(function () {
      $confirmBtn.hide()
      doEdit()
    })

    $no.click(function () {
      $confirmBtn.hide()
      pushProgress('【信息】已跳过页面 ' + to)
      $def.resolve()
    })

    pushProgress(
      $('<span>').append(
        '【警告】页面 <strong>' + to + '</strong> 已存在于本 wiki，是否覆盖？',
        $confirmBtn
      )
    )
  } else {
    doEdit()
  }

  async function doEdit() {

    var pageContent = await getContent(url, from)

    var wikitext = pageContent.parse.wikitext

    var ret = await postContent(to, wikitext['*'])

    if (ret.error || ret.errors) {
      pushProgress('【错误】保存页面 ' + to + '时出错。')
      $def.resolve()
    }
    pushProgress('【成功】已从 ' + from + ' 保存内容到 ' + to)
    $def.resolve()
  }

  return $def

}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
(() => {
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! unknown exports (runtime-defined) */
/*! runtime requirements: __webpack_require__ */
const init = __webpack_require__(/*! ./module/init */ "./module/init.js")

!(async () => {

  await mw.loader.using(['mediawiki.api', 'mediawiki.util', 'mediawiki.user'])

  // 所需的常量
  const { wgArticleId, wgAction, wgRelevantPageIsProbablyEditable } = mw.config.get()

  // 如果不符合条件则直接结束
  if (!window.InPageMigrateFrom) {
    console.info('[InPageMigrate]', 'Please set API via window.InPageMigrateFrom')
    return
  }
  if (mw.user.isAnon()) return // 未登录
  if (wgAction !== 'view') return // 不是浏览状态
  if (!wgRelevantPageIsProbablyEditable) return // 不可编辑
  if (wgArticleId !== 0) return // 页面存在

  // 走
  init()

})()
})();

/******/ })()
;
//# sourceMappingURL=InPageMigrate.js.map