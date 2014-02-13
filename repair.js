// 获取所有car
var phantom = require('phantom');
var async   = require('async');
var iRequest = require('request');
var mongoose = require('mongoose');
var fs       = require('fs');

var logWriteAble = fs.createWriteStream("./log.txt");


var defaultConfig = {
		'homepage' : 'http://www.iche360.cn/'
	}
function fire(carsIds) {
	console.log("1")
	// 设置request 修改默认 userAgent
	var defaultsOptions = {
		headers : {
			'User-Agent' : 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36'
		}
	}
	console.log("2")
	var iRequestObj = iRequest.defaults(defaultsOptions);
	var Schema = mongoose.Schema;
	var RepairCarSchema = new Schema({
		pid: {type: Number, index: true},
		type: {type: Number},
		km: {type:Number},
		parts: [],
		prices: []
	})
	console.log("3")
	var RepairCarModel = mongoose.model('RepairCar', RepairCarSchema);
	console.log("4")
	async.waterfall([
			function(callback) {
				console.log("5")
				phantom.create("--web-security=no", "--ignore-ssl-errors=yes", 
					{port:22345}, function(ph) {
						console.log("phantom bridge initiated");
						callback(null, ph);
					})
			},
			function(ph, callback) {
				console.log("6")
				ph.createPage(function(page) {
					console.log("page created");
					callback(null, page);
				})
			},
			function(page, callback) {
				var types = [1,2,3,4,5]
				var kms = [50,60,70,80,90,100,110,120,130,140,150];
				var repairCars = [];
				carsIds.forEach(function(id) {
					types.forEach(function(type) {
						kms.forEach(function(km) {
							repairCars.push({
								id:id,
								type:type,
								km:km
							})
						})
					})
				})
				async.eachSeries(repairCars, function(repairCar, repairCb) {
					page.open(defaultConfig.homepage+'/Taocan-buy_products-gongli-'+repairCar.km+'-year_id-'+repairCar.id+'-sec_type-'+repairCar.type+'.html', function(status) {
						if (status == "success") {
							page.evaluate(function() {
								var parts = [],
									prices = [];
								$('.order-list tr').each(function(index) {
									if (index != 0){
										var curTds = $(this).find('td');
										parts.push($.trim(curTds.first().text()));
										prices.push($.trim(curTds.eq(1).text()));
									}
								})
								var result = {'parts':parts,'prices':prices};
								return result;
							},function(result) {
								console.log(result);
								result.km = repairCar.km;
								result.type = repairCar.type;
								result.pid = repairCar.id;
								var repairCarEntity = new RepairCarModel(result);
								repairCarEntity.save(function(err) {
									if (err) {
										console.log(pid+'save failed');
									}
									repairCb();
								})
							})
						}
					})
				}, function(err) {
					page.close();
					callback(null);
				})
			}
		],
		function(err) {
			if (err) {
				console.log(err);
				throw err;
			}
			console.log('爬取完毕!')
		}
	)
}

exports.fire = fire;
