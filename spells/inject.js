$(document).ready(function() { //document.body.addEventListener('body',fn) doesn't work because body is already loaded by the time its called
    function injectExtensionScript(path) {
        var script = document.createElement('script');
        script.src = chrome.runtime.getURL(path);
        script.type = 'text/javascript';
        document.body.appendChild(script);
    }

    injectExtensionScript('jquery-2.1.0.min.js');

    if(/soundcloud/.test(window.location.href)) {
        injectExtensionScript('soundcloud.js');
    }
});
