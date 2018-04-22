console.log("hello soundcloud");

setTimeout(() => {
	console.log($('.playButton').first());
	$('.playButton').first()[0].click()

	window.addEventListener('message', function(request, sender, sendResponse) {
		var message = request.data;
		if (message.target != 'soundcloud') return;

		if (message.command == 'play/pause') $('.playControls__play').first()[0].click()
		if (message.command == 'prev') $('.playControls__prev').first()[0].click();
		if (message.command == 'next') $('.playControls__next').first()[0].click();
	})
}, 2000);
