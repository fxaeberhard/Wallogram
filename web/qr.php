<?php

/*
 * Wallogram
 * http://wallogram.red-agent.com
 *
 * Copyright (c) Francois-Xavier Aeberhard <fx@red-agent.com>
 * Licensed under the MIT License
 */
?><?php

header('Content-type: image/gif');
// Fetch GET params
$mode = isset($_GET["mode"]) ? strip_tags($_GET["mode"]) : "big";
$url = isset($_GET["url"]) ? strip_tags($_GET["url"]) : "default";

// Get size depending on mode
$size = ($mode && $mode == "small") ? "36" : "200";
// Get chart data. Limit data length if mode is small
$chl = ($mode && $mode == "small") ? substr($url, 0, 33) : $url;
// Assemble chart image URL
$imgUrl = "http://chart.apis.google.com/chart?chs=" . $size . "x" . $size . "&cht=qr&chld=Q&chl=" . $chl;

// Load, transform and write transparent QR code image
$im = imagecreatefrompng($imgUrl);
imagetruecolortopalette($im, false, 2);
$white = imagecolorclosest($im, 255, 255, 255);
imagecolortransparent($im, $white);
imagegif($im);
imagedestroy($im);
?>