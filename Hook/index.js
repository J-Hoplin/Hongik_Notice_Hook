const axios = require('axios')
const cheerio = require('cheerio')
const Codes = require('../Codes')
const url = require('url')

class HongikNoticeUpdateBroker{
    constructor(type){
        this.type = type
    }

    async init (){
        this.savedLatest = (await this.getLatestNoticeNumber()).msg
    }
    
    async getURLByPage (pageNumber, type = this.type){
        /**
         * Filte url based on instance type
         * 
         * Return axios http text data via request
         * 
         * return exception
         * 
         * - If type not supported
         * - Internet connection lost or unable to reach
         * 
         */
        const noticeEndPoints = {
            normal : `https://www.hongik.ac.kr/front/boardlist.do?currentPage=${pageNumber}&menuGubun=1&siteGubun=1&bbsConfigFK=2&searchField=ALL&searchValue=&searchLowItem=ALL`,
            student : `https://www.hongik.ac.kr/front/boardlist.do?currentPage=${pageNumber}&menuGubun=1&siteGubun=1&bbsConfigFK=3&searchField=ALL&searchValue=&searchLowItem=ALL`,
            sejongCampus : `https://www.hongik.ac.kr/front/boardlist.do?currentPage=${pageNumber}&menuGubun=1&siteGubun=1&bbsConfigFK=10&searchField=ALL&searchValue=&searchLowItem=ALL`
        }
        // Check if type supported
        if(!Object.keys(noticeEndPoints).includes(type)){
            const err = new Error()
            err.others = "Key not found"
            throw err   
        }
        let html
        try{
            // Parse first page of notice
            html = await axios.get(noticeEndPoints[type])
        }catch(err){
            return err.others
            ? Codes.error.othersError(err.others)
            : Codes.error.requestError
        }
        return html.data
    }

    async getNoticeByRange (endRange = this.savedLatest,baseOnInstanceSaved=true){
        /**
         *
         * endRange : End range of searching
         * basedOnInstanceSaved : If usage of this method call is for new notices after savedPoint
         * - should be false if not using endRnange as this.savedLatest
         * 
         * Get unupdated informations compare with save-point notice number
         * 
         * notice number with savepoint will be ignored
         * 
         */

        const viewLatestNoticeNumber = (await this.getLatestNoticeNumber()).msg
        /**
         * Hongik univ's notice page's pagenation count : 10
         * 
         * formula : (new updated notice number) - (saved notice number)
         */
        if(baseOnInstanceSaved){
            /* for code safe */
            endRange = this.savedLatest
        }
        //TODO : Delete Debug line
        endRange = 3585
        const callCounter = viewLatestNoticeNumber - endRange
        const paginationChecker = parseInt(callCounter / 10) + 1
        let notices = new Array()
        for(let i = 1; i <= paginationChecker;i++){
            const page = this.#getNoticesExceptPinned(await this.getURLByPage(i)).msg
            .filter(x => {
                return parseInt(x.no) > endRange
            })
            notices = notices.concat([...page])
        }
        // Update latest notice number
        this.savedLatest = viewLatestNoticeNumber
        return Codes.success.othersMessage(notices)
    }

    async getLatestNoticeNumber () {
        /**
         * 
         * get latest notices' notice number
         * 
         */
        try{
            let html = await this.getURLByPage(1)
            const firstPage = this.#getNoticesExceptPinned(html).msg
            // Get latest notice number 
            const firstPageNumber = firstPage.reduce((acc,cur,_) => {
                return parseInt(cur.no) > acc ? cur.no : acc
            },0)
            return Codes.success.othersMessage(firstPageNumber)
        }catch(err){
            console.log(err.message)
            return err.others
            ? Codes.error.othersError(err.message)
            : Codes.error.parsingError
        }
    }

    //private method
    #getNoticesExceptPinned (html){
        /**
         * 
         * Get notices except pinned notice
         * 
         */
        // Load html string as cheerio object
        const $ = cheerio.load(html)
        const $elements = $('body > div > div > div:nth-child(3) > div > table > tbody').children('tr')
        const $filterNotices = $elements
        .filter((i,elm) => {
            // Get notice number
            const noticeNumber = $(elm).children('td').first().text()
            return noticeNumber
        })
        .map((i,elm) => {
            const tds = $(elm)
            .children('td')
            .map((i,elm) => {
                const elementext = $(elm).text().trim()
                // 게시물 글 자체에 접근하는 링크 추출
                if(i === 1){
                    const link = $(elm).children('div').first().children('a').attr('href')
                    return {
                        title: elementext,
                        url: `https://www.hongik.ac.kr${link}`
                    }
                }
                // 첨부파일이 있는 경우, 첨부파일 목록들 추출
                else if(i === 3){
                    const atts = $(elm)
                    .children('a')
                    .map((i,elm) => {
                        const link = $(elm).attr('href')
                        const { fileName } = url.parse(link,true).query
                        return {
                            name : fileName,
                            link : `https://www.hongik.ac.kr${link}`
                        }
                    })
                    .toArray()
                    return new Array(atts)
                }
                // 이외 경우에는 텍스트 value 추출
                else{
                    return elementext
                }
            })
            .toArray()
            /**
             * tds field info
             * 
             * 0 : notice number
             * 1 : notice title and url
             * 2 : notice writer
             * 3 : notice attatchments url
             * 4 : notice created date
             * 5 : view count (will not in use)
             */
            //console.log(tds)
            return {
                "no" : tds[0],
                "notice" : tds[1],
                "writer" : tds[2],
                "atts" : tds[3],
                "createdAt" : tds[4]
            }
        })
        .toArray()
        return Codes.success.othersMessage($filterNotices)
    }
}

module.exports.HongikNotice = async (type) => {
    const instance = new HongikNoticeUpdateBroker(type)
    await instance.init()
    return instance
}