const getPageData = require('./getPageData')
const resolvePage = require('./resolvePage')

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