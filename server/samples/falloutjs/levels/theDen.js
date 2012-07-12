var Level		= require('../../../lib/cassidie/components/level.js');
var Hobo 		= require('../characters/hobo.js');
var Knight 		= require('../characters/knight.js');
var Rat 		= require('../characters/rat.js');
var Farmer 		= require('../characters/farmer.js');

module.exports = Level.extend({

	initialize: function(data) {
		this._super(data);

		var hobo1 = new Hobo('Jack', 20, 10, 'ne');
		var hobo2 = new Hobo('John', 31, 19, 'se');
		var hobo3 = new Hobo('Bob', 19, 35, 'sw');

		var knight = new Knight('Lte. Robson', 29, 6, 'sw');

		var rat1 = new Rat(8, 29, 'sw');
		var rat2 = new Rat(15, 30, 'nw');
		var rat3 = new Rat(9, 30, 'ne');
		var rat4 = new Rat(13, 29, 'se');

		var farmer = new Farmer('Alice', 11, 10, 'ne');

		this.attachCharacter(hobo1);
		this.attachCharacter(hobo2);
		this.attachCharacter(hobo3);
		this.attachCharacter(knight);
		this.attachCharacter(rat1);
		this.attachCharacter(rat2);
		this.attachCharacter(rat3);
		this.attachCharacter(rat4);
		this.attachCharacter(farmer);
	}
});