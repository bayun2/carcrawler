var cf = require("./car");
var argv = require("optimist").usage('Usage: $0 -t [string]')
							  .demand('t')
							  .describe('t', '汽车Id,值为cf启动抓取所有汽车')
							  .argv;

if (argv.t == "cf") {
	console.log('抓取车类型列表开始');
	cf.fire();
}

