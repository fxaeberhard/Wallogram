<?php
require 'config.php';

// get post vars
$channel_name = $_POST["channel_name"];
$socket_id = $_POST["socket_id"];

// channel data
$secret = PUSHER_SECRET; // you will find this in your pusher access tokens
$string_to_sign = $socket_id . ':' . $channel_name;

// create HMAC SHA256 signature
$signature = hash_hmac( 'sha256', $string_to_sign, $secret, false );
$channel_data = hash_hmac( 'sha256', json_encode(array("user_id" => session_id())), $secret, false );

// print json decoded auth signature
echo json_encode(array('auth' => $signature, "channel_data" => $channel_data));

?>