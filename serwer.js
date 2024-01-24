const http = require('http')
const fs = require('node:fs/promises')
const events = require('events');
const eventEmitter = new events.EventEmitter()
const {generateFile} = require('./app')
 
const getFiles = async () => {
    const indexHtml = await fs.readFile('./index.html')
    const indexJs = await fs.readFile('./dist/index.bundle.js')
    return [
        indexHtml,
        indexJs,
    ]
}

http.createServer( async (req, res) => {
    [indexHtml, indexJs] = await getFiles()
    if (req.url.includes('link')) {
        eventEmitter.on('ready', async (fileName) => {
            const excelFile = await fs.readFile(`./TransferMarket${fileName}.xlsx`)
            eventEmitter.on('data', () => {
                res.writeHead(200, {'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
                res.write(excelFile)
                res.end() 
                fs.unlink(`./TransferMarket${fileName}.xlsx`)
            })
        })
        generateFile(req.url, eventEmitter)
        return
    }
    switch(req.url) {
        case '/':
            res.writeHead(200, {'Content-Type':'text/html'})
            res.write(indexHtml)
            res.end()
            break
        case '/Js':
            res.writeHead(200, {'Content-Type':'text/javascript'})
            res.write(indexJs)
            res.end()
            break
        case '/download':
            eventEmitter.emit('data')
            break
        default:
            res.writeHead(404)
            res.write('Nie!')
            res.end()
    }
}).listen(8080)