const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port  = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0;
io.on('connection', (socket) =>{
    console.log('New Web Socket Connection ')

    
    socket.emit('message', 'Welcome !')
    socket.broadcast.emit('message', 'A new user has Joined !')

    socket.on('sendMessage', (message, callback)=>{

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not Allowed')
        }

        io.emit('message',message)
        callback()
    })  

    socket.on('sendLocation', (coords, callback)=>{
        io.emit('message',`https://www.google.com/maps/?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect', () =>{
        io.emit('message','A user has Left !')
    })

    
    
})

server.listen(port, () =>{
    console.log(`server is up on ${port}!` )
})



// git init 
// git add . 
// git commit -m " Rendering messages in ui " 
// git push -u origin master

