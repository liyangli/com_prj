/**
 * 对应串口读取工具；进行获取相关串口数据；
 * 主要对外提供的方法为：
 * 1、开启；
 * 2、发送、发送后返回的数据
 * 3、关闭；
 */
'use strict';
const SerialPort = require('serialport');
class SerialUtil{
    
    /**
     * 类构造。进行初始化serialPort对象
     */
    constructor(ev){

        //进行获取指定的service对象
        SerialPort.list((err,ports)=>{
            if(err){
                console.error("读取串口出现错了，错误信息为->"+err);
                return;
            }
            const self = this;
            ports.forEach(function(port) {
              let manufacturer = port.manufacturer;
              if(manufacturer=='FTDI'){
                  //进行设定对应数据。这个里面才是真正的串口对象
                  self.serialPort = new SerialPort(port.comName,{
                    baudRate: 9600,
                    dataBits: 8,
                    parity: 'none',
                    stopBits:1,
                    autoOpen: false
                  });
              }  
            }, this);

            this.ev = ev;
        });
        
    }
    
    /**
     * 数据接收处理；
     */
    _reviceContent(){
        let reviceContent = "";
        const self = this;
        let handler;
        let timeout = 2* 1000;
        let i = 0;
        this.serialPort.on('data',(data)=>{
            reviceContent += data.toString('hex');
            if(handler){
                clearTimeout(handler);
            }
            //此处等待2s。如果2s数据没有返回就认为是处理完成了；
            handler = setTimeout(function(){
                console.info(reviceContent);
                 self.ev.emit('comData',reviceContent);
                reviceContent = "";
                handler = "";
            },timeout);
        });
    }

    /**
     * 串口开启动作；
     */
    start(){
        const self = this;
        console.info(this.serialPort);
        this.serialPort.open((err)=>{
            
            if(err){
                console.info(err);
                return;
            }
            console.info("open success......");
            self._reviceContent();
        });
    }

/**
 * 进行发送数据；
 * @param {*} params 
 */
    send(content){
        console.info("send content ->"+content);
        this.serialPort.write(new Buffer(content,'hex'),(err,results)=>{
            //需要进行等待接收完毕然后进行返回数据；
            if(err){
                console.error(err);
                return;
            }
            
        });
    }

/**
 * 关闭对应串口
 */
    close(){
        this.serialPort.close((err)=>{
            if(err){
                console.error("关闭时出现错误，错误信息为->"+err);
            }else{
                console.info("已经正常关闭；");
            }
        });
    }
}

module.exports = SerialUtil;