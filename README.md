# kuaishou-live-barrage


`Nodejs` 快手直播 弹幕、礼物抓取，websocket协议解密 （无需登录）



### 快手直播官网 - https://live.kuaishou.com/


## 食用方法

```js
yarn 
yarn start

// yarn start 启动一个websocket服务，使用ws来连接，需要房间ID为查询参数
// 举个🌰  ws://localhost:8888/?id=tianci666
```



## 过程

1 逆向web端源码找到protobuf.json

2 请求网页获取`liveStreamId`、`cookie`

3 注册`cookie`中的`did`

4 请求快手接口获取wss链接

5 连接 定时发送心跳



如果能帮得上你麻烦点个 ❤ star ❤ 再走吧，感谢

## 获取ws链接会触发快手风控 暂时无解

## License

The MIT License

