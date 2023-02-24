const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('../src/utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('../src/utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port  = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0;
io.on('connection', (socket) =>{
    console.log('New Web Socket Connection ')

    socket.on('join', (options, callback) => {
        const {error,user} = addUser({id:socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has Joined!`))

        callback()
    })

    socket.on('sendMessage', (message, callback)=>{

        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not Allowed')
        }

        io.to('kumar').emit('message',generateMessage(message))
        callback()
    })  

    socket.on('sendLocation', (coords, callback)=>{
        io.emit('locationMessage',generateLocationMessage(`https://www.google.com/maps/?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () =>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has Left!`))
        }
        
    })

    
    
})

server.listen(port, () =>{
    console.log(`server is up on ${port}!` )
})



// git init 
// git add . 
// git commit -m " Tracking user joining and leaving " 
// git push -u origin master

