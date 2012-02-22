<?php


$pusherApiKey = '9d4eb6ada84f3af3c77f';
$pusherChannel = 'wallogram';
$pusherAppId = '10827';
$pusherSecretKey = 'mmimim';

require('Pusher.php');

$pusher = new Pusher($key, $secret, $app_id);
$pusher->trigger($pusherChannel, $_REQUEST['event'],
	$_REQUEST['data']);
?>