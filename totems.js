var totems = [
	{ target: 'soundcloud', x: 0, y:  0},
	{ target: 'youtube', x: 300, y: 0 },
	{ target: 'alarm', x: 150, y: 400 },
];

function subtract(v1, v2) {
	return { x: v1.x - v2.x,   y: v1.y - v2.y };
}

function length(v) {
	return Math.sqrt((v.x*v.x)+(v.y*v.y));
}

function dotProduct(v1, v2) {
	return (v1.x*v2.x)+(v1.y*v2.y);
}

function cosTheta(v1, v2) {
	return dotProduct(v1,v2)/(length(v1)*length(v2));
}

function getActiveTotem (cameraPose) {
	for (var i = 0; i < totems.length; i++) {
		var totem = totems[i];
		if (cosTheta(subtract(totem, cameraPose.center), subtract(cameraPose.north, cameraPose.center)) > 0.9) {
			return totem;
		}
	}
	return null;
}

module.exports = {
	totems,
	getActiveTotem
}
