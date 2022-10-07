const state = require('./statusCode')
const convention = require('./codeConvention').convention

// others
module.exports.othersError = (msg) => {
    return convention(state.fail,msg)
}

// axios request error
module.exports.requestError = convention(state.fail,"Something went wrong while making request")

// cheerio parsing error
module.exports.parsingError = convention(state.fail,"Something went wrong while paring data")

