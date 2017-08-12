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
if(!isset($_POST["data"])) {
    echo "{\"status\":\"success\",\"task\":{\"x\":\"" . $configJson["start"]["x"] . "\",\"y\":\"" . $configJson["start"]["y"] . 
        "\", \"w\":\"" . sizeof($configJson["data"][0]) . "\",\"h\":\"" . sizeof($configJson["data"]) . "\"}}";
    exit(0);
}
$dataJson = json_decode($_POST["data"], true);
if(sizeof($dataJson) != sizeof($configJson["data"]) || sizeof($dataJson[0]) != sizeof($configJson["data"][0])) {
    echo "{\"status\":\"failure\"}";
}

// Read and process color file
$colorFile = fopen("color.json", "r");
$colorJson = json_decode(fread($colorFile, filesize("color.json")), true);
fclose($colorFile);

// Read and process photo file
$photoFile = fopen("photo.json", "r");
$photoJson = json_decode(fread($photoFile, filesize("photo.json")), true);
fclose($photoFile);

// Read and process queue file
$queueFile = fopen("queue.json", "r");
$queueJson = json_decode(fread($queueFile, filesize("queue.json")), true);
fclose($queueFile);

// Process the color
for($i = 0; $i < sizeof($dataJson); ++$i) {
    for($j = 0; $j < sizeof($dataJson[0]); ++$j) {
        $dataJson[$i][$j] = $colorJson["color"][$dataJson[$i][$j]];
    }
}
$photoJson["data"] = $dataJson;

// Check the queue
for($i = 0; $i < sizeof($photoJson["data"]); ++$i) {
    for($j = 0; $j < sizeof($photoJson["data"][$i]); ++$j) {
        $queueAdd = array("x" => $configJson["start"]["x"] + $j, "y" => $configJson["start"]["y"] + $i, "color" => $configJson["data"][$i][$j]);
        if($configJson["data"][$i][$j] != $photoJson["data"][$i][$j]) {
            if(array_search($queueAdd, $queueJson["queue"]) === false) {
                $queueJson["queue"][] = $queueAdd;
            }
        } else {
            $searchResult = array_search($queueAdd, $queueJson["queue"]);
            if($searchResult !== false) {
                array_splice($queueJson["queue"], $searchResult, 1);
            }
        }
    }
}

// Save queue
$queueFile = fopen("queue.json", "w");
fwrite($queueFile, json_encode($queueJson));
fclose($queueFile);

// Save the photo
$photoFile = fopen("photo.json", "w");
fwrite($photoFile, json_encode($photoJson));
fclose($photoFile);

// Return
echo "{\"status\":\"success\",\"task\":{\"x\":\"" . $configJson["start"]["x"] . "\",\"y\":\"" . $configJson["start"]["y"] . 
    "\", \"w\":\"" . sizeof($configJson["data"][0]) . "\",\"h\":\"" . sizeof($configJson["data"]) . "\"}}";
exit(0);

?>