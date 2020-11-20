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