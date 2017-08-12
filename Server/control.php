<?php

// Set header
header('content-type:application:json;charset=utf8');  
header('Access-Control-Allow-Origin:*');  
header('Access-Control-Allow-Methods:POST');  
header('Access-Control-Allow-Headers:x-requested-with,content-type'); 

// Check the post
if(!isset($_POST["require"])) {
    echo "{\"status\":\"failure\"}";
    exit(0);
}
if($_POST["require"] != "heart_beat" && $_POST["require"] != "task") {
    echo "{\"status\":\"failure\"}";
    exit(0);
}

// Process the heart beat pack
if($_POST["require"] == "heart_beat") {
    echo "{\"status\":\"success\"}";
    exit(0);
}

// Read and process queue file
$queueFile = fopen("queue.json", "r");
$queueJson = json_decode(fread($queueFile, filesize("queue.json")), true);
fclose($queueFile);

// Read and process config file
$configFile = fopen("config.json", "r");
$configJson = json_decode(fread($configFile, filesize("config.json")), true);
fclose($configFile);

// Read and process photo file
$photoFile = fopen("photo.json", "r");
$photoJson = json_decode(fread($photoFile, filesize("photo.json")), true);
fclose($photoFile);

// Check the queue
if(sizeof($queueJson["queue"]) == 0) {
    echo "{\"status\":\"success\",\"task\":{\"status\":\"none\"}";
    exit(0);
}

// Get from top of queue
$queueItem = $queueJson["queue"][0];
echo "{\"status\":\"success\",\"task\":{\"status\":\"yes\",\"x\":\"" . $queueItem["x"] . "\",\"y\":\"" . $queueItem["y"] . "\",\"color\":\"" . $queueItem["color"] . "\"}}";

// Remove the top item of queue
array_splice($queueJson["queue"], 0, 1);

// Save queue
$queueFile = fopen("queue.json", "w");
fwrite($queueFile, json_encode($queueJson));
fclose($queueFile);

?>