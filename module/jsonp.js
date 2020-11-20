module.exports = async (url, data = {}) => {
  if (!url) return false
  return $.ajax({
    dataType: 'jsonp',
    url,
    data
  })
}