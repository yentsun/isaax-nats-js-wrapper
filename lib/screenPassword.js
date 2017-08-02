module.exports = function (level, msg, meta) {
  if (meta && meta.password) meta.password = `*******(${meta.password.length})`
  return meta
}
