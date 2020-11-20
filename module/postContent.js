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