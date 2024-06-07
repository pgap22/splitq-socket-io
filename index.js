import express from "express"
import { Server } from "socket.io";
import {createServer} from "http"
import cors from "cors"
import { logTime } from "./logTime.js";
import { prisma } from "./prisma.js";

const app = express()
const server = createServer(app)
app.use(cors())

const io = new Server(server, {cors:{
    origin: "*"
}})

app.get("/", (req,res)=>{
    return res.send("splitq socket io")
})


server.listen("4000", ()=>{
    console.log("Server socket io Running")
})

io.on('connection', (socket) => {
    logTime("Connected:"+ socket.handshake.address)

    socket.on("get_balance", async (id)=>{
        try {
            socket.join(id)
            logTime("ROOM: "+id + " " + socket.handshake.address)
            const { balance } = await prisma.users.findFirst({
                where: {
                    id
                },
                select: {
                    balance: true
                }
            })
            io.to(id).emit("current_balance",{
                balance
            })
        } catch (error) {
            console.log(error)
        }
    })

    socket.on("user_data", (id)=>{
        logTime("ROOM: "+id + " " + socket.handshake.address)
        socket.join(id)
    })
    socket.on("recharge", (data)=>{
        socket.to(data.room).emit("recive_recharge", data.recharge)
        socket.to(data.room).emit("add_balance", data)
    })
    socket.on('error', function (err) {
        console.log(err);
    });
});
