const getPageData = require('./getPageData')

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
    $progressArea = $('<pre>', { class: 'ipm-progressArea' })

  $form.append(
    $('<h2>', { text: '快速迁移页面' }),
    $('<p>', { text: '您正在从 API 接口为 ' + fromUrl + ' 的 wiki 迁移内容。' }),
    $('<label>', { style: 'display: block' }).append(
      '请指定目标页面名称',
      $pageName
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
    $progressArea.append(
      $('<li>', { html: str })
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
    $form.data('pageList', [wgPageName])
    $.each(parse.templates, (_, item) => {
      var pageList = $form.data('pageList')
      if (item.exists === '') pageList.push(item['*'])
      $form.data('pageList', pageList)
    })

    // 缓存所需页面
    var neededPages = $form.data('pageList')

    // 展示所需页面
    pushProgress('【信息】成功获取页面信息，需要迁移以下页面：' + neededPages.join('、') + ' (共计' + neededPages.length + '个页面)')
    pushProgress('【指示】请确认是否开始迁移……')

    $startBtn.attr('disabled', false)
    $postButton.attr('disabled', false)
  })

  $postButton.click(function () {
    var neededPages = $form.data('pageList')
    if (!neededPages) {
      pushProgress('【错误】找不到需要页面列表，请重新获取页面信息。')
      return
    }
    pushProgress('【信息】施工中！！！')
  })
}