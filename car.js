// 获取所有car
var phantom = require('phantom');
var async   = require('async');
var iRequest = require('request');
var mongoose = require('mongoose');
var fs       = require('fs');
var repair = require("./repair");

var logWriteAble = fs.createWriteStream("./log.txt");


var defaultConfig = {
		'homepage' : 'http://www.iche360.cn/',
		'selectInfoPath' : '/index.php?m=Products&a=ajax_carlist&pid='
	}
function fire() {
	// 设置request 修改默认 userAgent
	var defaultsOptions = {
		headers : {
			'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36'
		}
	}
	var iRequestObj = iRequest.defaults(defaultsOptions);
	var Schema = mongoose.Schema;
	mongoose.connect('mongodb://localhost/car');
	var CarSchema = new Schema({
		pid: {type: Number, index: true},
		snippet: {type: String},
		sonid: []
	})
	var CarModel = mongoose.model('Car', CarSchema);
	
	async.waterfall([
			function(callback) {
				phantom.create("--web-security=no", "--ignore-ssl-errors=yes", 
					{port:12345}, function(ph) {
						console.log("phantom bridge initiated");
						callback(null, ph);
					})
			},
			function(ph, callback) {
				ph.createPage(function(page) {
					console.log("page created");
					callback(null, page, ph);
				})
			},
			function(page, ph, callback) {
				page.open('http://www.iche360.cn/Taocan-index.html', function(status) {
					if (status == "success") {
						var carsIds = []; 
						page.evaluate(function() { // 首字母
							var forEach = Array.prototype.forEach;
							var select1Ids = [];							
							forEach.call(document.querySelectorAll('#Select1 option'), function(option) {
								var val = option.value;
								if (!isNaN(val) && val != 0) {
									select1Ids.push(val);
								}
							})	
							return select1Ids;
						}, function(select1Ids) {
							logWriteAble.write('首字母'+'\n')
							logWriteAble.write(select1Ids.join())
							console.log('首字母爬取完毕'+'\n')
							async.waterfall([
								function(innerCb) { // 品牌
									var pids = [];
									async.eachSeries(select1Ids, function (pid, inInCb) {
									    if (isNaN(pid) || pid == 0) return false;
										iRequestObj(defaultConfig.homepage + defaultConfig.selectInfoPath + pid, 
											function(error, response, body) {
												//console.log("res1:"+response+"\n")
												//console.log("body1:"+body+"\n")
												var sonid = [];
												if (body) {
													body.replace(/<option value=\"(\d+)\">(.*?)<\/option>/g, function(all, id, snippet) {
														if (!isNaN(id) && id != 0) {
															pids = pids.concat(id);
															sonid.push(id);
														}	
													})	
													var carEntity = new CarModel({'pid':pid,'snippet':body,'sonid':sonid});
													carEntity.save(function(err) {
														if (err) {
															console.log(pid+'save failed');
														}
													})
													inInCb();
												}
											}
										)
									}, function (err) {
										logWriteAble.write('品牌'+'\n')
										logWriteAble.write(pids.join())
										console.log('品牌爬取完毕'+'\n')
										innerCb(null, pids);
									});
								},
								function(pids, innerCb) { // 厂商
									var innerPids = [];
									async.eachSeries(pids, function (pid, inInCb) {
									    if (isNaN(pid) || pid == 0) return false;
										iRequestObj(defaultConfig.homepage + defaultConfig.selectInfoPath + pid, 
											function(error, response, body) {
												//console.log("res1:"+response+"\n")
												//console.log("body1:"+body+"\n")
												var sonid = [];
												if (body) {
													body.replace(/<option value=\"(\d+)\">(.*?)<\/option>/g, function(all, id, snippet) {
														if (!isNaN(id) && id != 0) {
															innerPids = innerPids.concat(id);
															sonid.push(id);
														}	
													})	
													var carEntity = new CarModel({'pid':pid,'snippet':body,'sonid':sonid});
													carEntity.save(function(err) {
														if (err) {
															console.log(pid+'save failed');
														}
													})
													inInCb();
												}
											}
										)
									}, function (err) {
										logWriteAble.write('厂商'+'\n')
										logWriteAble.write(innerPids.join())
										console.log('厂商爬取完毕'+'\n')
										innerCb(null, innerPids);
									});
								},
								function(pids, innerCb) { // 车型
									var innerPids = [];
									async.eachSeries(pids, function (pid, inInCb) {
									    if (isNaN(pid) || pid == 0) return false;
										iRequestObj(defaultConfig.homepage + defaultConfig.selectInfoPath + pid, 
											function(error, response, body) {
												//console.log("res1:"+response+"\n")
												//console.log("body1:"+body+"\n")
												var sonid = [];
												if (body) {
													body.replace(/<option value=\"(\d+)\">(.*?)<\/option>/g, function(all, id, snippet) {
														if (!isNaN(id) && id != 0) {
															innerPids = innerPids.concat(id);
															sonid.push(id);
														}	
													})	
													var carEntity = new CarModel({'pid':pid,'snippet':body,'sonid':sonid});
													carEntity.save(function(err) {
														if (err) {
															console.log(pid+'save failed');
														}
													})
													inInCb();
												}
											}
										)
									}, function (err) {
										logWriteAble.write('车型'+'\n')
										logWriteAble.write(innerPids.join())
										console.log('车型爬取完毕'+'\n')
										innerCb(null, innerPids);
									});
								},
								function(pids, innerCb) { // 排量
									var innerPids = [];
									async.eachSeries(pids, function (pid, inInCb) {
									    if (isNaN(pid) || pid == 0) return false;
										iRequestObj(defaultConfig.homepage + defaultConfig.selectInfoPath + pid, 
											function(error, response, body) {
												//console.log("res1:"+response+"\n")
												//console.log("body1:"+body+"\n")
												var sonid = [];
												if (body) {
													body.replace(/<option value=\"(\d+)\">(.*?)<\/option>/g, function(all, id, snippet) {
														if (!isNaN(id) && id != 0) {
															innerPids = innerPids.concat(id);
															sonid.push(id);
														}	
													})	
													var carEntity = new CarModel({'pid':pid,'snippet':body,'sonid':sonid});
													carEntity.save(function(err) {
														if (err) {
															console.log(pid+'save failed');
														}
													})
													inInCb();
												}
											}
										)
									}, function (err) {
										logWriteAble.write('排量'+'\n')
										logWriteAble.write(innerPids.join())
										console.log('排量爬取完毕'+'\n')
										innerCb(null, innerPids);
									});
								},
								function(pids, innerCb) { // 年份
									async.eachSeries(pids, function (pid, inInCb) {
									    if (isNaN(pid) || pid == 0) return false;
										iRequestObj(defaultConfig.homepage + defaultConfig.selectInfoPath + pid, 
											function(error, response, body) {
												//console.log("res1:"+response+"\n")
												//console.log("body1:"+body+"\n")
												var sonid = [];
												if (body) {
													body.replace(/<option value=\"(\d+)\">(.*?)<\/option>/g, function(all, id, snippet) {
														if (!isNaN(id) && id != 0) {
															carsIds = carsIds.concat(id)
															sonid.push(id);
														}	
													})	
													var carEntity = new CarModel({'pid':pid,'snippet':body,'sonid':sonid});
													carEntity.save(function(err) {
														if (err) {
															console.log(pid+'save failed');
														}
													})
													inInCb();
												}
											}
										)
									}, function (err) {
										console.log('年份爬取完毕'+'\n');
										page.close();
										ph.exit();
										innerCb(null, carsIds, ph);
									});
								}
							], function(err, carsIds) { // 年份
								//console.log(carsIds);	
								callback(null, carsIds);
							})
							
						})
					}
				})
			}
		],
		function(err, carsIds) {
			if (err) {
				console.log(err);
				throw err;
			}		
			console.log('抓取车类型列表结束');
			console.log('抓取保养策略');
			repair.fire(carsIds);
		}
	)
}

exports.fire = fire;
