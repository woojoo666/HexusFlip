const cv = require('opencv4nodejs');

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

const img1 = cv.imread('public/straw-hats-cropped.jpg');
const img2 = cv.imread('public/straw-hats.jpg');

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
cv.imshowWait('ORB matches', orbMatchesImg);

