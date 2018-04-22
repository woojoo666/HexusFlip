const cv = require('opencv4nodejs');

const matchFunc = cv.matchBruteForceHamming;

const img2 = cv.imread('shoppingbag-resized.jpg');

const perspectiveTransform = (homography, points2d) => {
	out = [];
	for (let p = 0; p < points2d.length; p++) {
		point = points2d[p];
		point.push(1);
		outp = [0, 0, 0];
		for (var r = 0; r < 3; r++) {
			for (var c = 0; c < 3; c++) {
				outp[r] += homography[r][c]*point[c];
			}
		}
		out.push([outp[0]/outp[2], outp[1]/outp[2]]);
	}
	return out;
}

// if draw is true, it will save an image of the feature matches and border detection
const estimateCameraPose = ( img1url, draw ) => {

	const img1 = cv.imread(img1url);

	var detector = new cv.ORBDetector();

	// detect keypoints
	const keyPoints1 = detector.detect(img1);
	const keyPoints2 = detector.detect(img2);

	// compute feature descriptors
	const descriptors1 = detector.compute(img1, keyPoints1);
	const descriptors2 = detector.compute(img2, keyPoints2);

	// match the feature descriptors
	const matches = matchFunc(descriptors1, descriptors2);

	// only keep good matches
	const bestN = 40;
	const bestMatches = matches.sort(
		(match1, match2) => match1.distance - match2.distance
	).slice(0, bestN);

	// note: I believe the first descriptor is the "query image" and second is the "train image"
	matchedPoints1 = [];
	matchedPoints2 = [];
	for( let i = 0; i < bestMatches.length; i++ ){
		//-- Get the keypoints from the good matches
		matchedPoints1.push( keyPoints1[ bestMatches[i].queryIdx ].point );
		matchedPoints2.push( keyPoints2[ bestMatches[i].trainIdx ].point );
	}

	const homography = cv.findHomography(matchedPoints1, matchedPoints2).homography;

	// convert homography matrix to a js matrix
	var homographyMatrix = [];
	for (var r = 0; r < homography.rows; r++) {
		var row = [];
		for (var c = 0; c < homography.cols; c++) {
			row.push(homography.at(r,c));
		}
		homographyMatrix.push(row);
	}

	const srcCenter = [img1.cols/2, img1.rows/2];
	const dstCenter = perspectiveTransform(homographyMatrix, [srcCenter])[0];

	const srcNorth = [img1.cols/2, 0];
	const dstNorth = perspectiveTransform(homographyMatrix, [srcNorth])[0];

	if (draw) {
		drawMatches(
			img1,
			img2,
			keyPoints1,
			keyPoints2,
			bestMatches,
			homographyMatrix
		);
	}

	return { center: { x: dstCenter[0], y: dstCenter[1] }, north: { x : dstNorth[0], y: dstNorth[1] } };
};

const drawMatches = function (img1, img2, keyPoints1, keyPoints2, bestMatches, homographyMatrix) {

	const orbMatchesImg = cv.drawMatches(
		img1,
		img2,
		keyPoints1,
		keyPoints2,
		bestMatches
	);

	const srcCorners = [
			[0, 0],
			[img1.cols, 0],
			[img1.cols, img1.rows],
			[0, img1.rows]
		];
	const dstCoords = perspectiveTransform(homographyMatrix, srcCorners);
	const xOffset = img1.cols; // because the query image is on the left side, drawings on the right side need to be offset
	const dstPoints = dstCoords.map(coord => new cv.Point(coord[0]+xOffset, coord[1]));
	const borderLine = { thickness: 2, color: new cv.Vec(0,255,255) };

	orbMatchesImg.drawLine(dstPoints[0], dstPoints[1], borderLine);
	orbMatchesImg.drawLine(dstPoints[1], dstPoints[2], borderLine);
	orbMatchesImg.drawLine(dstPoints[2], dstPoints[3], borderLine);
	orbMatchesImg.drawLine(dstPoints[3], dstPoints[0], borderLine);

	const srcCenter = [img1.cols/2, img1.rows/2];
	const dstCenter = perspectiveTransform(homographyMatrix, [srcCenter])[0];
	const centerLine = { thickness: 5, color: new cv.Vec(255,255,0) };

	//draw vector from origin towards border center, which is the camera pose estimate (assuming no tilt)
	orbMatchesImg.drawLine(new cv.Point(img2.cols/2+xOffset, img2.rows/2),
		new cv.Point(dstCenter[0]+xOffset, dstCenter[1]), centerLine);
	orbMatchesImg.drawLine(new cv.Point(dstCenter[0]+xOffset-50, dstCenter[1]-50),
		new cv.Point(dstCenter[0]+xOffset+50, dstCenter[1]+50), borderLine);
	orbMatchesImg.drawLine(new cv.Point(dstCenter[0]+xOffset-50, dstCenter[1]+50),
		new cv.Point(dstCenter[0]+xOffset+50, dstCenter[1]-50), borderLine);

	cv.imwrite('vision-matches.png', orbMatchesImg);
}

module.exports = {
	estimateCameraPose
}
