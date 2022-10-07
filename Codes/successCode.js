const state = require('./statusCode')
const convention = require('./codeConvention').convention

module.exports.othersMessage = (msg) => {
    return convention(state.success,msg)
}