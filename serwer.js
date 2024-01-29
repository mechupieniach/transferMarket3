const http = require('http')
const fs = require('node:fs/promises')
const fs2 = require('fs')
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

        const readyHandler = async (fileName) => {
            const excelFile = await fs.readFile(`./TransferMarket${fileName}.xlsx`)
            eventEmitter.once('data', async () => { 
                res.writeHead(200, {'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})
                res.write(excelFile)
                res.end() 
                fs.unlink(`./TransferMarket${fileName}.xlsx`)
            })
        };

        // const readyHandler = async (fileName) => {

        //     eventEmitter.once('data', () => {
        //         const filePath = `./TransferMarket${fileName}.xlsx`
        //         const fileStream = fs2.createReadStream(filePath)
        //         res.writeHead(200, {
        //             'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        //             'Content-Disposition': `attachment; filename=${fileName}.xlsx`
        //         });
    
        //         fileStream.pipe(res, { end: true });
    
        //         fileStream.on('end', () => {
        //             fs.unlink(filePath); // Usuń plik po zakończeniu strumieniowania
        //         });
        //     })
        // }

        eventEmitter.once('ready', readyHandler)
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
            res.end()
            break
        default:
            res.writeHead(404)
            res.write('Nie!')
            res.end()
    }
}).listen(8080)