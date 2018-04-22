const cv = require('opencv4nodejs');

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

var homographyMatrix;

const matchFeatures = ({ img1, img2, detector, matchFunc }) => {
  // detect keypoints
  const keyPoints1 = detector.detect(img1);
  const keyPoints2 = detector.detect(img2);

  // compute feature descriptors
  const descriptors1 = detector.compute(img1, keyPoints1);
  const descriptors2 = detector.compute(img2, keyPoints2);

  // match the feature descriptors
  const matches = matchFunc(descriptors1, descriptors2);

  // only keep good matches
  const bestN = 12;
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

  console.log(homography);

  // convert homography matrix to a js matrix
  var mat = [];
  for (var r = 0; r < homography.rows; r++) {
    var row = [];
    for (var c = 0; c < homography.cols; c++) {
      row.push(homography.at(r,c));
    }
    mat.push(row);
  }
  //print homography matrix
  console.log("["+mat.map(r => "["+r.join(",")+"]").join(",\n")+"]");
  homographyMatrix = mat;

  // const srcCorners = new cv.Mat([
  //     [0, 0],
  //     [img1.cols, 0],
  //     [img1.cols, img1.rows],
  //     [0, img1.rows]
  //   ], cv.CV_32F);
  //const dstCoordinates = srcCorners.perspectiveTransform(homography)
  //console.log(dstCoordinates);

  return cv.drawMatches(
    img1,
    img2,
    keyPoints1,
    keyPoints2,
    bestMatches
  );
};

const img1 = cv.imread('s1.jpg');
const img2 = cv.imread('s0.jpg');

// check if opencv compiled with extra modules and nonfree
if (cv.xmodules.xfeatures2d) {
  const siftMatchesImg = matchFeatures({
    img1,
    img2,
    detector: new cv.SIFTDetector({ nFeatures: 2000 }),
    matchFunc: cv.matchFlannBased
  });
  cv.imshowWait('SIFT matches', siftMatchesImg);
} else {
  console.log('skipping SIFT matches');
}

const orbMatchesImg = matchFeatures({
  img1,
  img2,
  detector: new cv.ORBDetector(),
  matchFunc: cv.matchBruteForceHamming
});

const srcCorners = [
    [0, 0],
    [img1.cols, 0],
    [img1.cols, img1.rows],
    [0, img1.rows]
  ];
const dstCoords = perspectiveTransform(homographyMatrix, srcCorners);
const xOffset = img1.cols; // because the query image is on the left side, drawings on the right side need to be offset
const dstPoints = dstCoords.map(coord => new cv.Point(coord[0]+xOffset, coord[1]));
const yellow = new cv.Vec(0,255,255);

orbMatchesImg.drawLine(dstPoints[0], dstPoints[1], yellow);
orbMatchesImg.drawLine(dstPoints[1], dstPoints[2], yellow);
orbMatchesImg.drawLine(dstPoints[2], dstPoints[3], yellow);
orbMatchesImg.drawLine(dstPoints[3], dstPoints[0], yellow);

cv.imshowWait('ORB matches', orbMatchesImg);

