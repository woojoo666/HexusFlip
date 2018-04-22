const socket_namespace = 'https://localhost/spells';

var socket = io.connect(socket_namespace, {secure: true});
