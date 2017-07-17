/**
 * 对外提供的http接口。
 * /start
 * 开启动作；
 * /close
 * 结束动作
 * 
 * /send
 * /发送具体命令,返回发送成功后的数据；
 */
'use strict';
const SerialUtil = require('./serial_util');
const express = require('express');
const EventEmitter = require('events');

const ev = new EventEmitter();
const serialUtil = new SerialUtil(ev);

let app = express();

app.get("/start",function(req,res){
    console.info("i am in start");
   serialUtil.start(); 
   res.send({
       flag: true,
       msg: ''
   })
})
app.get("/close",(req,res)=>{
   serialUtil.close(); 
   res.send({
       flag: true,
       msg: ''
   })
})
app.get("/send",(req,res)=>{
    let content = req.param('content');

    ev.on('comData',(result)=>{
        ev.removeAllListeners('comData');
        console.info("接受数据为->"+result);
        res.send({
            flag: true,
            msg: '',
            data: result
        })
    });
   serialUtil.send(content); 
   
})
app.get("/",(req,res)=>{
    console.info("成功进入。。。。");
});
app.listen(8001)

