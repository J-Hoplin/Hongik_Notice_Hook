const axios = require('axios')
const Codes = require('../Codes')
const {HongikNotice} = require('../Hook')
const config = require('./config.json')
const embedConfig = require('./embed.json')


class Hooker {
    constructor(type){
        this.type = type
        this.list = config.hook_list
    }

    hexColorCodeDecimal(hex){
        return parseInt(hex,16)
    }

    async init(){
        this.scraper = await HongikNotice(this.type)
    }

    async #embedBuilder({status,msg}){
        if(status === Codes.status.fail){
            return {
                embeds : [
                    {
                        title : `${this.scraper.getTypeName()} 알림`,
                        color : this.hexColorCodeDecimal(embedConfig.colors.warning),
                        fields : [
                            {
                                name : embedConfig.error.title,
                                value : msg
                            }
                        ],
                        footer : {
                            text : embedConfig.footer.text,
                            icon_url : embedConfig.footer.url
                        }
                    }
                ]
            }
        }
        const res =  {
            embeds : 
                msg.map(x => {
                    const obj = {
                        title : `${this.scraper.getTypeName()} - No.${x.no}`,
                        description : `작성자 : ${x.writer} / 작성일 : ${x.createdAt}`,
                        color : this.hexColorCodeDecimal(embedConfig.colors.normal),
                        fields : [
                            {
                                name : `**제목 : ${x.notice.title}**`,
                                value : `[본문 바로가기](${x.notice.url})\n\n`
                            }
                        ],
                        footer : {
                            text : embedConfig.footer.text,
                            icon_url : embedConfig.footer.url
                        }
                    }
                    if(x.atts.length){
                        x.atts.map(({name,link},i) => {
                            obj.fields.push({
                                name : `첨부파일 ${i + 1}`,
                                value : `[${name}](${link})`
                            })
                        })
                    }
                    return obj
                })
        }   
        return res
    }

    async main(){
        try{
            const res = await this.scraper.getNoticeByRange()
            const embed = await this.#embedBuilder(res)
            Promise.all(this.list.map(async (x) => {
                return await axios.post(x,embed)
            }))
        }catch(err){
            console.error(err.message)
        }
    }
}


// const test = (async() => {
//     const p = new Hooker("student")
//     await p.init()
//     await p.main()
// })()


module.exports.NoticeHooker = async(type) => {
    const instance = new Hooker(type)
    await instance.init()
    return instance
}