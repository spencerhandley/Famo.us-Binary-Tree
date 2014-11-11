// load css
require('./styles');

// Load polyfills
require('famous-polyfills');

// import dependencies
var Engine = require('famous/core/Engine');
var Modifier = require('famous/core/Modifier');
var StateModifier = require('famous/modifiers/StateModifier');
var Transform = require('famous/core/Transform');
var Easing = require('famous/transitions/Easing');
var Surface = require('famous/core/Surface');
var InputSurface = require('famous/surfaces/InputSurface');
var ImageSurface = require('famous/surfaces/ImageSurface');

// create the main context


var mainContext = Engine.createContext();

var input = new InputSurface({
	size:[200,40]
});

var rightMod = new StateModifier({
  transform: Transform.translate(210, 0, 0)
});

var addBtn = new Surface({
	size:[110,40],
	content: "Add Number",
	properties: {
		backgroundColor: 'grey',
		color: 'white',
		padding: '10px',
		fontFamily: 'sans-serif'
	}
});

mainContext.add(input);
mainContext.add(rightMod).add(addBtn);

var newNode = function(x, y, content, node){
	var length = 0;

	var stateModifier = new StateModifier({
		size: [50, 50],
	    origin: [0.5, 0.5],
	    align: [0.5, 0.1],
	    transform: Transform.scale(0, 0, 1),
	    opacity: 0
	});

	var positionModifier = new StateModifier({
		align: [0.5, 0.5],
		origin: [0.5, 0.5]

	});
	var connectorStateModifier = new StateModifier({
	    origin: [0.5, 0],
	    align: [0.5, 0.1],
	    transform: Transform.scale(0, 0, 1)
	});
	
	if (node.side === "left"){
		var angle = Math.atan(node.childDist/60);
	} else if (node.side === "right"){
		var angle = Math.atan(node.childDist/60) * -1;
	} else {
		angle = 0;
	}
	
	if(node.parent !== null){
		length = Math.sqrt(Math.pow(node.parent.childDist,2) + Math.pow(100,2));
		var connectorAlignModifier = new StateModifier({
			transform: Transform.translate(node.parent.x, node.parent.y, 0)
		});
	}

	var connectorRotateModifier = new StateModifier({
		size: [4, length],
		transform: Transform.rotateZ(angle)
	});

	node.stateModifier = stateModifier;
	node.positionModifier = positionModifier;
	mainContext
	.add(stateModifier)
	.add(positionModifier)
	.add(node.renderedNode);
	mainContext
	.add(connectorStateModifier)
	.add(connectorAlignModifier)
	.add(connectorRotateModifier)
	.add(node.connector);

	addNodeTransition(node.x, node.y, stateModifier, positionModifier, connectorStateModifier);
}
var addNodeTransition = function(x, y, stateModifier, positionModifier, connectorStateModifier){

	stateModifier.setTransform(
	    Transform.scale(1, 1, 1),
	    { duration : 2000, curve: Easing.inOutElastic}
	);
	connectorStateModifier.setTransform(
		Transform.scale(1,1,1),
	    { duration : 2000, curve: Easing.inOutElastic}

	);
	stateModifier.setOpacity(1, {
	    duration: 2000, curve: Easing.inOutElastic
	});

	positionModifier.setTransform(
		Transform.translate(x,y,0),
		{ duration : 2000, curve: Easing.inOutElastic }
	);
};

var moveNodeTransition = function(x, node) {
	// console.log(x,y,node)
	// var positionModifier = new StateModifier({
	// 	transform: Transform.translate(node.x, node.y,0)
	// // });
	// var positionModifier = node.positionModifier;
	// positionModifier.setTransform(
	// 	Transform.translate(x,node.y,0),
	// 	{duration: 2000, curve: Easing.inOutElastic}
	// );
};



var Tree = function(x,y,value, depth, childDist, parent, side){
	this.renderedNode = new Surface({
		content: value,
		properties: {
			backgroundColor: 'white',
			borderRadius: '100px',
			border: '1px solid black',
			textAlign: 'center',
			padding: '15px'
		}
	});
	this.connector = new Surface({
		properties: {
			backgroundColor: 'black',
			zIndex: -1
		}
	});
	this.value = value;
	this.left = null;
	this.right = null;
	this.depth = depth;
	this.side = side || null;
	this.parent = parent || null;
	this.childDist = childDist;
	this.x = x;
	this.y = y;
}

var nodeVals = [];
// for (var i = 0; i < 100; i++) {
// 	nodeVals.push(i)
// };

Tree.prototype = {
	insert: function(val){
		var levels = 1;
		var xPos = 0;
		var spacing = 100;
		var levelSpacing = 100;
		var recurse = function(node){
			if(val < node.value){
				if(node.left === null){
					childDist = 200/levels;
					xPos = (node.x - node.childDist);
					yPos = levels*levelSpacing;
					node.left = new Tree(xPos, yPos, val, levels, childDist, node, "left");
					newNode(xPos, yPos, val, node.left);
					levels = 0;
					xPos = 0;
					return;
				} else {
					levels++;
					setTimeout(function(){recurse(node.left)}, 100);
					return;
				}
			} else if (val > node.value) {
				if(node.right === null) {
					childDist = 200/levels;
					xPos = (node.x + node.childDist);
					yPos = levels*levelSpacing;
					node.right = new Tree(xPos, yPos, val, levels, childDist, node, "right");
					newNode(xPos, yPos, val, node.right);
					levels = 0;
					xPos = 0;
					return;
				} else {
					levels++;
					setTimeout(function(){recurse(node.right)}, 100);
					return;	
				}
			} else {
				return;
			}
		}
		recurse(this);
	},
	move: function(x){
		moveNodeTransition(x, this);
		// moveNodeTransition.call(this, x, y);
	},
	rebalance: function(){
		  // var arrayHolder = []
		  // var recurse = function(node){
		  //   arrayHolder.push(node)
		  //   if(node.left !== undefined){
		  //     recurse(node.left)
		  //   }
		  //   if(node.right !== undefined){
		  //     recurse(node.right)
		  //   }
		  // }
		  // recurse(this)
		  // var sortedArray = arrayHolder.sort(function(a,b){
		  // 	return a.value > b.value
		  // })
		  // console.log(sortedArray)
		  // // expand upon sort function to fix 1,11,2 problem
		  // // var topNode = sortedArray[Math.floor(sortedArray.length/2)]
		  // var recurse2 = function(array){
		  //   if(array.length !== 0){
		  //     var parent = makeBinarySearchTree(array[Math.floor(array.length / 2)])
		  //     parent.left = recurse2(array.slice(0, parent-1))
		  //     parent.right = recurse2(array.slice(parent+1,array.length-1))
		  //   }
		  //   return parent
		  // }
		  // return recurse2(sortedArray);
		// };
	}
};

var tree = new Tree(0,0,50,0,300);
newNode(0, 0, 50, tree);

// for (var i = 0; i < nodeVals.length; i++) {
// 	tree.insert(nodeVals[Math.floor(nodeVals.length/2)]);
// };

addBtn.on('click',function(){
	if(nodeVals.indexOf(input.getValue()) === -1){
		tree.insert(input.getValue());
		nodeVals.push(num)
	}
});

setInterval(function(){
	var num = Math.floor(Math.random()*100)
	if(nodeVals.indexOf(num) === -1){
		tree.insert(num);
		nodeVals.push(num)
	}
},100);












