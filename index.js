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

class RespBean {
    constructor(flag,msg,data){
    this.flag= flag;
    this.msg = msg;
    this.data = data;
    }
}

const cb = function(req,res){
    let callback = req.param("callback");
    let returnMsg = "";
    if(callback){
        returnMsg = "/**/ typeof "+callback+" === 'function' && "+callback+"(";
    }
    return function(flag,msg,data){
        const respBean = new RespBean(flag,msg,data);
        returnMsg += JSON.stringify(respBean);
        if(callback){
            returnMsg += ")";
        }
        res.send(returnMsg);
    }; 
}

app.get("/start",function(req,res){
   serialUtil.start(cb(req,res)); 

   
})
app.get("/close",(req,res)=>{
   serialUtil.close(cb(req,res));
})
app.get("/send",(req,res)=>{
    let content = req.param('content');
    let callback = cb(req,res);
    ev.on('comData',(result)=>{
        ev.removeAllListeners('comData');
        console.info("接受数据为->"+result);
        res.send(callback(true,"",result));
    });
   serialUtil.send(content,callback); 
   
})
app.get("/",(req,res)=>{
    console.info("成功进入。。。。");
});
app.listen(8001)

