const fs = require('fs');
const resizeImg = require('resize-img');

resizeImg(fs.readFileSync('shoppingbag.jpg'), {width: 417, height: 404}).then(buf => {
	fs.writeFileSync('shoppingbag-resized.jpg', buf);
});

// the images are 3120x4160, so it makes more sense to resize it to 768x1024, not 1024x768
// however, for some reason the resize function rotates these images before resizing them
// maybe something wrong with the metadata
// my hacky fix is to simply resize to 1024x768, then to rotate it back after resizing
resizeImg(fs.readFileSync('public/camera-pose-estimate/capture1.jpg'), {width: 1024, height: 768}).then(buf => {
	fs.writeFileSync('public/camera-pose-estimate resized/capture1.jpg', buf);
});
resizeImg(fs.readFileSync('public/camera-pose-estimate/capture2.jpg'), {width: 1024, height: 768}).then(buf => {
	fs.writeFileSync('public/camera-pose-estimate resized/capture2.jpg', buf);
});
resizeImg(fs.readFileSync('public/camera-pose-estimate/capture3.jpg'), {width: 1024, height: 768}).then(buf => {
	fs.writeFileSync('public/camera-pose-estimate resized/capture3.jpg', buf);
});
resizeImg(fs.readFileSync('public/camera-pose-estimate/capture4.jpg'), {width: 1024, height: 768}).then(buf => {
	fs.writeFileSync('public/camera-pose-estimate resized/capture4.jpg', buf);
});
