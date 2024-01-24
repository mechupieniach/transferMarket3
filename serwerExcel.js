const http = require('http')
const xl = require('excel4node')

http.createServer(async (req, res) => {
    const playerId = req.url.match(/[0-9]{1,8}/g)

    const fetchData = async () => {
        const response = await fetch(`https://www.transfermarkt.com/ceapi/marketValueDevelopment/graph/${playerId}`)
        const data = await response.json()
        return data
    }
    const data = await fetchData()

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const getDate = (date) => {
        const day = date.match(/[0-9]{1,2}/)[0]
        const month = months.findIndex(month => month === date.match(/[a-zA-Z]{3}/)[0])
        const year = date.match(/[0-9]{4}/)[0]
        const trueDate = new Date(year,month,day)
        return trueDate
    }

    const getValue = (value) => {
        if (value === '-') return '-'
        const price = +value.match(/\d+\.\d+/)
        if (value.includes('m')) {
            return price * 1000000
        }
        if (value.includes('k')) {
            return price * 1000
        }
        return price
    }

    const getName = (url) => {
        const name = url.match(/[a-z]+-[a-z]+/)[0].split('-')
        name.forEach((word, index) => {
            name[index] = word.replace(/./, word[0].toUpperCase())
        })
        return name.join(' ')
    }

    const playerName = getName(data.details_url)

    const playerData = data.list.map((element) => ({
        date: getDate(element.datum_mw),
        value: getValue(element.mw)
        })
    )

    const workbook = new xl.Workbook()

    const sheet = workbook.addWorksheet(playerName)

    sheet.cell(1,1).string('Date')
    sheet.cell(1,2).string('Price')

    for (let i = 0; i < playerData.length; i++) {
        sheet.cell(i + 2, 1).date(playerData[i].date)
        sheet.cell(i + 2, 2)[typeof(playerData[i].value)](playerData[i].value)
    }

    const fileName = playerName.replace(' ','')
    workbook.write(`TransferMarket${fileName}.xlsx`, res)
}).listen(8888)