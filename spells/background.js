const socket_namespace = 'https://localhost/spells';

var socket = io.connect(socket_namespace, {secure: true});

socket.on('command', function (message) {
	console.log(message);
	chrome.tabs.query({}, function(tabs) {
		for (var i=0; i<tabs.length; ++i) {
			chrome.tabs.sendMessage(tabs[i].id, message);
		}
	});
});
