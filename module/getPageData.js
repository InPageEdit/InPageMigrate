module.exports = async (url, page) => {
  const jsonp = require('./jsonp')
  var data = await jsonp(url, {
    format: 'json',
    action: 'parse',
    page,
    prop: 'templates'
  })
  return data
}