<?php

// Set header
header('content-type:application:json;charset=utf8');  
header('Access-Control-Allow-Origin:*');  
header('Access-Control-Allow-Methods:POST');  
header('Access-Control-Allow-Headers:x-requested-with,content-type');

// Read and process config file
$configFile = fopen("config.json", "r");
$configJson = json_decode(fread($configFile, filesize("config.json")), true);
fclose($configFile);

// Check post data
if(!isset($_POST["x"]) || !isset($_POST["y"]) || !isset($_POST["color"])) {
    echo "{\"status\":\"success\",\"next\":{\"x\":\"" . $configJson["start"]["x"] . "\",\"y\":\"" . $configJson["start"]["y"] . "\"}}";
    exit(0);
}
if($_POST["x"] < 0 || $_POST["x"] > 1280 || $_POST["y"] < 0 || $_POST["y"] > 720) {
    echo "{\"status\":\"failure\"}";
    exit(0);
}

// Read and process color file
$colorFile = fopen("color.json", "r");
$colorJson = json_decode(fread($colorFile, filesize("color.json")), true);
fclose($colorFile);

// Read and process photo file
$photoFile = fopen("photo.json", "r");
$photoJson = json_decode(fread($photoFile, filesize("photo.json")), true);
fclose($photoFile);

// Process the position and color
$relativeX = $_POST["x"] - $configJson["start"]["x"];
$relativeY = $_POST["y"] - $configJson["start"]["y"];

// Check border
if($relativeX > sizeof($configJson["data"][0]) - 1 || $relativeY > sizeof($configJson["data"]) - 1) {
    echo "{\"status\":\"failure\"}";
    exit(0);
}

// Process color
$photoJson["data"][$relativeY][$relativeX] = $colorJson["color"][$_POST["color"]];

// Write file
$photoFile = fopen("photo.json", "w");
fwrite($photoFile, json_encode($photoJson));
fclose($photoFile);

// Process next
if($relativeX + 1 > sizeof($configJson["data"][0]) - 1) {
    if($relativeY + 1 > sizeof($configJson["data"]) - 1) {
        $nextX = $configJson["start"]["x"];
        $nextY = $configJson["start"]["y"];
    } else {
        $nextX = $configJson["start"]["x"];
        $nextY = $_POST["y"] + 1;
    }
} else {
    $nextX = $_POST["x"] + 1;
    $nextY = $_POST["y"];
}

// Return
echo "{\"status\":\"success\",\"next\":{\"x\":\"" . $nextX . "\",\"y\":\"" . $nextY . "\"}}";

?>