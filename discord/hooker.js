const axios = require('axios')
const Codes = require('../Codes')
const {HongikNotice} = require('../Hook')
const config = require('./config.json')
const embedConfig = require('./embed.json')


class Hooker {
    constructor(type){
        this.type = type
        if(!Object.keys(config).includes(this.type)){
            throw new Error("Type not supported")
        }
        this.name = config[type].name
        this.list = config[type].list
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
                        title : `${this.name} 알림`,
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
                        title : `${this.name} - No.${x.no}`,
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
            console.log(embed)
            await axios.post("",embed)
        }catch(err){
            console.error(err.message)
        }
    }
}


const test = (async() => {
    const p = new Hooker("student")
    await p.init()
    await p.main()
})()


module.exports.hooker = async(type,name) => {
    const instance = new Hooker(type,name)
    await instance.init()
    return instance
}