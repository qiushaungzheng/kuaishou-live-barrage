function rand(m, n) {
	return Math.ceil(Math.random() * (n - m + 1) + m - 1)
}

const misc2dic = (did) => {
	return {
		common: {
			identity_package: { device_id: did, global_id: '' },
			app_package: { language: 'zh-CN', platform: 10, container: 'WEB', product_name: 'KS_GAME_LIVE_PC' },
			device_package: {
				os_version: 'NT 6.1',
				model: 'Windows',
				ua: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
			},
			need_encrypt: 'false',
			network_package: { type: 3 },
			h5_extra_attr:
				'{"sdk_name":"webLogger","sdk_version":"3.9.49","sdk_bundle":"log.common.js","app_version_name":"","host_product":"","resolution":"1600x900","screen_with":1600,"screen_height":900,"device_pixel_ratio":1,"domain":"https://live.kuaishou.com"}',
			global_attr: '{}'
		},
		logs: [
			{
				client_timestamp: new Date().getTime(),
				client_increment_id: rand(1000, 9999),
				session_id: '1eb20f88-51ac-4ecf-8dc3-ace5aefcae4f',
				time_zone: 'GMT+08:00',
				event_package: {
					task_event: {
						type: 1,
						status: 0,
						operation_type: 1,
						operation_direction: 0,
						session_id: '1eb20f88-51ac-4ecf-8dc3-ace5aefcae4f',
						url_package: {
							page: 'GAME_DETAL_PAGE',
							identity: '5316c78e-f0b6-4be2-a076-c8f9d11ebc0a',
							page_type: 2,
							params: '{"game_id":1001,"game_name":"王者荣耀"}'
						},
						element_package: {}
					}
				}
			}
		]
	}
}
const gotHeaders = {
	accept: "*/*",
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
	accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
	connection: 'keep-alive',
	// Host: ' live.kuaishou.com',
	'sec-ch-ua': `Google Chrome;v=107, Chromium;v=107, Not=A?Brand;v=24`,
	// Referer: 'https://live.kuaishou.com',
	'sec-ch-ua-platform': 'macOS',
	'Sec-Fetch-Dest': 'document',
	'Sec-Fetch-Mode': 'navigate',
	'Sec-Fetch-Site': 'same-origin',
	'Sec-Fetch-User': '?1'
}
module.exports = {
	misc2dic,
	gotHeaders
}
