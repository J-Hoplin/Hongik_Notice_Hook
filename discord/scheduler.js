const scheduler = require('node-schedule')
const { NoticeHooker } = require('./hooker')
const config = require('./config.json')

const main = async() => {
    const lists = ["normal","student","sejongCampus","events"]
    const now = new Date()
    console.log(`[ Observing - ${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ]`)
    Promise.all(lists.map(async (x) => {
        const instance = await NoticeHooker(x)
        return instance.main()
    })).then(() => console.log())
}

const schedule = async() => {
    try{
        const scheduleExpression = scheduler.scheduleJob(config.request_period,async() => {
            await main()
        })
    }catch(err){
        console.error(err)
    }
}

schedule()