<?php
/**
 * Allows authentification to pusher using Pusher-PHP api.
 * 
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */
require 'lib/pusher-php/lib/Pusher.php';
require 'config.php';

$pusher = new Pusher(PUSHER_AUTHKEY, PUSHER_SECRET, PUSHER_APPID);

$sid = session_id();
echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $sid, array('name' => $sid));

// Without presence
// echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
?>