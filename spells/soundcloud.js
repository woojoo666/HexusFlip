console.log("hello soundcloud");

setTimeout(() => {
	console.log($('.playButton').first());
	$('.playButton').first()[0].click()
}, 2000);
