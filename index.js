const ws = require('nodejs-websocket')
const kuaishouClient = require('./src/kuaishou/kuaishou')

function handleUrl(url) {
	var obj = {}
	var arrNew = url.split('?')[1].split('&')
	for (let i = 0; i < arrNew.length; i++) {
		var key = arrNew[i].split('=')[0]
		var value = arrNew[i].split('=')[1]
		//在对象中添加属性
		obj[key] = value
	}
	return obj
}

const server = ws.createServer(function (socket) {
	// 读取字符串消息，事件名称为:text
	const { id: roomId } = handleUrl(socket.path)

	socket.on('text', function (str) {
		console.log(str)
	})

	socket.on('error', (e) => {
		console.log('error', e)
	})
	socket.on('close', (e) => {
		console.log('close server')
	})

	if (!roomId) {
		socket.sendText(`params error ,no roomId`)
		socket.close()
	} else {
		new kuaishouClient(roomId, socket)
	}
})

server.listen(8888, () => {
	console.log('start webSocket server...')
})
