# com_prj
Nodejs开启串口，获取相关数据；
主要提供方法：
/start
开启串口
返回数据格式：
{
  flag: true,
  msg: ''
}

/close
关闭串口
返回数据格式：
{
   flag: true,
   msg: ''
}

/send?content=8A008B
发送命令，获取数据；
返回数据格式：
{
  flag: true,
  msg: '',
  data: '8E0000008A'
}
