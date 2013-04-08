<?php
//pmxdr host server-side logic

ob_start("ob_gzhandler");

$version = "0.0.6";

header("Content-Type: text/html; charset=UTF-8");
header("ETag: ".$version);
//Uncomment to cache for almost forever
//header('Expires: Sat, 31 Dec 2107 23:59:58 GMT');

?><!doctype html><script type="text/javascript"><?php include('pmxdr-host.js')?></script>
