const cv = require('opencv4nodejs');
const fs = require('fs');

const matchRatio = 0.6; // for David Lowe's ratio test

const matchFeatures = ({ img1, img2, detector, matchFunc }) => {
  // detect keypoints
  const keyPoints1 = detector.detect(img1);
  const keyPoints2 = detector.detect(img2);

  // compute feature descriptors
  const descriptors1 = detector.compute(img1, keyPoints1);
  const descriptors2 = detector.compute(img2, keyPoints2);

  // match the feature descriptors
  const matches = matchFunc(descriptors1, descriptors2, 2);

  // David Lowe ratio test
  var bestMatches = [];
  for (var i = 0; i < matches.length; i++) {
    m = matches[i];
    if (m.length == 2 && m[0].distance < m[1].distance * matchRatio) {
      bestMatches.push(m[0])
    }
  }
  // only keep good matches
  // const bestN = 40;
  // const bestMatches = matches.sort(
  //   (match1, match2) => match1.distance - match2.distance
  // ).slice(0, bestN);

  return cv.drawMatches(
    img1,
    img2,
    keyPoints1,
    keyPoints2,
    bestMatches
  );
};

const img1 = cv.imread('public/alpha_0.525 beta_16.124 gamma_-13.307 - flipped.jpg');
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
  matchFunc: cv.matchKnnBruteForce
});
cv.imshowWait('ORB matches', orbMatchesImg);

