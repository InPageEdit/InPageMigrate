module.exports = async (url, page) => {
  const jsonp = require('./jsonp')
  var data = await jsonp(url, {
    format: 'json',
    action: 'parse',
    page,
    prop: 'wikitext'
  })
  console.info('PageData', page, data)
  return data
}