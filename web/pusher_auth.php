<?php
/**
 * Allows authentification to pusher using Pusher-PHP api.
 * 
 * @author Francois-Xavier Aeberhard <fx@red-agent.com>
 */

require 'lib/Pusher-PHP/lib/Pusher.php';
require 'config.php';

$pusher = new Pusher(PUSHERAPP_AUTHKEY, PUSHERAPP_SECRET, PUSHERAPP_APPID);
echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);

?>