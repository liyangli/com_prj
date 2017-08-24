/**
 * 对应串口读取工具；进行获取相关串口数据；
 * 主要对外提供的方法为：
 * 1、开启；
 * 2、发送、发送后返回的数据
 * 3、关闭；
 */
'use strict';
const SerialPort = require('serialport');
let dir = "";
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
              console.info(port);
              if(manufacturer=='Prolific'){
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
        let commands = {'8800000088':{
            respLen: 513*2
        },'8A008A':{
            respLen: 512*2
        }};
        this.serialPort.on('data',(data)=>{
            //处理步骤：
            /**
             * 1、接收到的数据查看是否通过指定命令方式获取到的；
             * 2、指定命令包含对应字节个数，进行判断接收到的数据是否接收完。没有接收完成继续执行；否则截取前端数据；
             * 3、判断首次接收到的数据是否E0.如果为E0自动退出，表明失败了。
             */
            const content = data.toString('hex');
            if(reviceContent == "" && content.toLocaleLowerCase().indexOf("e0") == 0){
                //表明为刚开始接收数据。如果为E0表明出错了。直接退出
                console.info("reviceContent-->"+reviceContent);
                self.ev.emit('comData',"E0");
                reviceContent += content.substr(2);
            }else{
                //表明正式获取的数据。需要直接设置上去；
                reviceContent += content;
            }
            Object.keys(commands).forEach((key)=>{
                let keyLowCase = key.toLocaleLowerCase();
                
                if(reviceContent.indexOf(keyLowCase) == 0){
                    //表明通过这种方式进行匹配上了；看对应长度是否够。不够就继续。够了就触发通知事件
                    try{
                        //判断指令是否重复设定了
                        let reviceDeal = reviceContent;
                        let reviceDealAft = reviceContent.substr(key.length);
                        if(reviceDealAft.indexOf(keyLowCase) == 0){
                            //表明为第二次还是原先值。需要进行把数据给截取掉然后进行计算长度是否正常；
                            reviceDeal = reviceDealAft;
                        }
                        
                        const comandVal = commands[key];
                        const respLen = comandVal.respLen;
                        //判断长度够不够。够了就自动截取内容并且把循环接收的数据给清除掉；
                        let reviceLen = reviceDeal.length;
                        console.info(`reviceLen->${reviceLen};respLen+key.length-->${respLen+key.length};ken->${key.length}`);
                        if(reviceLen >= (respLen+key.length)){
                            let comData = reviceDeal.substring(key.length,respLen+key.length);
                            console.info("len-->"+comData.length);
                            self.ev.emit('comData',comData);

                            reviceContent = reviceDeal.substr(respLen+key.length);
                        }else if(reviceLen == (key.length + 2) && reviceDeal.substr(key.length)== 'e0'){
                            self.ev.emit('comData','e0');
                            reviceContent = "";
                        }
                    }catch(e){
                        console.error(e);
                    }
                }
            });
        });
    }

    /**
     * 串口开启动作；
     */
    start(cb){
        const self = this;
        // console.info(this.serialPort);
        try {
            this.serialPort.open((err)=>{
            
            if(err){
                console.info(err);
                cb(false,err,{});
                return;
            }
            console.info("open success......");
            self._reviceContent();
            cb(true,"",{});
        });
        } catch (error) {
            console.info(error);
            cb(false,error,{});
        }
        
    }

/**
 * 进行发送数据；
 * @param {*} params 
 */
    send(content,cb){
        try {
            //开始进行事件绑定。如果含有问题进行抛出对应问题；

            dir = content;
            this.serialPort.write(new Buffer(content,'hex'),(err,results)=>{
            //需要进行等待接收完毕然后进行返回数据；
            if(err){
                console.error(err);
                cb(false,err,{});
                return;
            }
            
        });
        } catch (error) {
            cb(false,error,{});
        }
        
    }

/**
 * 关闭对应串口
 */
    close(cb){
        try {
            this.serialPort.close((err)=>{
            if(err){
                console.error("关闭时出现错误，错误信息为->"+err);
                cb(false,err,{});
            }else{
                console.info("已经正常关闭；");
                cb(true,"",{});
            }
        });
        } catch (error) {
             cb(false,error,{});
        }
        
    }
}

module.exports = SerialUtil;
