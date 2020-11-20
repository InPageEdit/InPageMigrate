const getContent = require('./getContent')
const pageExist = require('./pageExist')
const postContent = require('./postContent')

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