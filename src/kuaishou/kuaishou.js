const protobuf = require('protobufjs')
const WebSocket = require('ws')
const got = require('got')
const { misc2dic, gotHeaders } = require('./registerJson/index')

const protobufJson = require('./protobuf/k.json')
const pbRoot = protobuf.Root.fromJSON(protobufJson)

function rand(m, n) {
	return Math.ceil(Math.random() * (n - m + 1) + m - 1)
}

class KuaishouClient {
	constructor(roomId, socket) {
		this.roomId = roomId
		this.baseUrl = 'https://live.kuaishou.com/u/'
		this.timer = null
		this.ws = null
		this.socket = socket
		this.start()
	}

	async start() {
		// 获取 liveStreamId
		const { liveStreamId, cookie, cookieObj, pageId } = await this.getLiveStreamId()

		// 报错
		if (!liveStreamId) {
			console.log(`Error:[kuaishou-${this.roomId}] 获取直播流ID错误`)
			return
		}

		// 注册did
		const registerRes = await this.registerDid(cookieObj.did)

		// 报错
		if (registerRes?.result !== 1) {
			console.log(`Error:[kuaishou-${this.roomId}] 注册did失败`)
			return
		}

		// 获取wss链接
		const response = await this.getWebsocketUrl(cookie, liveStreamId)
		const { token, webSocketUrls } = response.data.webSocketInfo

		console.log(token, webSocketUrls)

		this.url = webSocketUrls[0]

		const ws = (this.ws = new WebSocket(this.url))
		ws.on('open', () => {
			const params = this.enterRoom({
				token,
				liveStreamId,
				pageId: pageId
			})
			ws.send(params)
		})

		ws.on('message', (e) => {
			const msg = this.decodeMessage(e)
			msg && this.socket && this.socket.sendText(JSON.stringify(msg))
			console.log(msg)
		})

		this.timer = setInterval(() => {
			ws.send(this.heartbeat())
		}, 20000)
	}

	// 关闭直播间
	close() {
		this.timer && clearInterval(this.timer)
		this.ws && this.ws.close()
	}

	decodeMessage(msg) {
		const { payloadType, payload } = this.typeDecode('SocketMessage', msg)
		switch (payloadType) {
			case 200:
				return this.typeDecode('CSWebEnterRoom', payload)
			case 1:
				return this.typeDecode('CSWebHeartbeat', payload)
			case 202:
				return this.typeDecode('CSWebUserExit', payload)
			case 202:
				return this.typeDecode('CSWebUserExit', payload)
			case 101:
				return this.typeDecode('SCWebHeartbeatAck', payload)
			case 103:
				return this.typeDecode('SCWebError', payload)
			case 105:
				return this.typeDecode('SCInfo', payload)
			case 300:
				return this.typeDecode('SCWebEnterRoomAck', payload)
			case 310:
				return this.typeDecode('SCWebFeedPush', payload)
			case 330:
				return this.typeDecode('SCWebCurrentRedPackFeed', payload)
			case 340:
				return this.typeDecode('SCWebLiveWatchingUsers', payload)
			case 370:
				return this.typeDecode('SCWebGuessOpened', payload)
			case 371:
				return this.typeDecode('SCWebGuessClosed', payload)
			case 412:
				return this.typeDecode('SCWebRideChanged', payload)
			case 441:
				return this.typeDecode('SCWebBetChanged', payload)
			case 442:
				return this.typeDecode('SCWebBetClosed', payload)
			case 645:
				return this.typeDecode('SCWebLiveSpecialAccountConfigState', payload)
			case 758:
				return this.typeDecode('SCLiveWarningMaskStatusChangedAudience', payload)
			default:
				return ''
		}
	}

	enterRoom(params) {
		const CSWebEnterRoom = this.typeEncode('CSWebEnterRoom', params)
		const SocketMessage = this.typeEncode('SocketMessage', {
			payloadType: 200,
			payload: CSWebEnterRoom
		})
		return SocketMessage
	}

	heartbeat() {
		const params = {
			timestamp: new Date().getTime()
		}
		const heartbeatBuf = this.typeEncode('CSWebHeartbeat', params)
		const SocketMessage = this.typeEncode('SocketMessage', {
			payloadType: 1,
			payload: heartbeatBuf
		})
		return SocketMessage
	}

	typeEncode(type, payload) {
		const msgType = pbRoot.lookupType(`kuaishou.${type}`)
		const payloadCreate = msgType.create(payload)
		const msg = msgType.encode(payloadCreate).finish()
		return msg
	}

	typeDecode(type, payload) {
		const msgType = pbRoot.lookupType(`kuaishou.${type}`)
		const msg = msgType.decode(payload)

		if (type === 'SocketMessage') {
			return msg
		}

		var object = msgType.toObject(msg, {
			longs: String,
			enums: String,
			bytes: String
		})
		return object
	}

	// 获取pageId
	getPageId() {
		let pageId = ''
		const charset = 'bjectSymhasOwnProp-0123456789ABCDEFGHIJKLMNQRTUVWXYZ_dfgiklquvxz'
		for (let i = 0; i < 16; i++) {
			pageId += charset[rand(0, 63)]
		}
		return (pageId += `_${new Date().getTime()}`)
	}

	// get liveStreamId
	async getLiveStreamId() {
		let liveStreamId

		const res = await got.get(this.baseUrl + this.roomId)
		const setCookies = res.headers['set-cookie']

		let reg = new RegExp(/\"liveStreamId\"\:(.*?)\,/, 'g')

		try {
			liveStreamId = res.body
				.match(reg)[0]
				.replace(/(\')|(\")|(\,)/g, '')
				.split(':')[1]
		} catch (e) {
			console.log(`Error:[kuaishou-${this.roomId}] 获取直播流ID错误`)
		}

		let cookie = ''
		let cookieObj = {}

		setCookies.forEach((c, i) => {
			cookie += `${i === 0 ? '' : ';'} ${c.split(';')[0]}`
			const objSplit = c.split(';')[0].split('=')
			cookieObj[objSplit[0]] = objSplit[1]
		})

		return {
			liveStreamId,
			cookie,
			cookieObj,
			pageId: this.getPageId()
		}
	}

	async registerDid(did) {
		return await got
			.post('https://log-sdk.ksapisrv.com/rest/wd/common/log/collect/misc2?v=3.9.49&kpn=KS_GAME_LIVE_PC', {
				headers: gotHeaders,
				json: {
					...misc2dic(did)
				}
			})
			.json()
	}

	async getWebsocketUrl(cookie, liveStreamId) {
		return await got
			.post('https://live.kuaishou.com/live_graphql', {
				headers: {
					Cookie: cookie,
					...gotHeaders
				},
				json: {
					operationName: 'WebSocketInfoQuery',
					variables: {
						liveStreamId
					},
					query: 'query WebSocketInfoQuery($liveStreamId: String) {\n  webSocketInfo(liveStreamId: $liveStreamId) {\n    token\n    webSocketUrls\n    __typename\n  }\n}\n'
				}
			})
			.json()
	}
}

module.exports = KuaishouClient

// const client = new KuaishouClient('Achen888')
