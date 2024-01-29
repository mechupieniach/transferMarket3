const events = require('events');
const eventEmitter = new events.EventEmitter()
const root = document.getElementById('root')
const form = document.createElement('form')
const input = document.createElement('input') 

const submitButton = document.createElement('button')
const downloadButton = document.createElement('button')
submitButton.type = 'submit'
input.placeholder = 'wpisz link'
submitButton.innerHTML = 'submit'
downloadButton.innerHTML = 'download'
form.appendChild(input)
form.appendChild(submitButton)
root?.appendChild(form)
root?.appendChild(downloadButton)
downloadButton.setAttribute("hidden", "hidden")

input.addEventListener('change', (event: Event ) => {
    const inputElement = event.target as HTMLInputElement
    form.action = `link=${inputElement.value}`
} )

form.onsubmit = () => {
    alert('File is ready to download!')
    downloadButton.removeAttribute('hidden')
    downloadButton.onclick = download
}

const download = async () => {
    if (downloadButton) downloadButton.setAttribute("hidden","hidden")
    const response = await fetch('http://localhost:8080/download')
    
    return response
}

