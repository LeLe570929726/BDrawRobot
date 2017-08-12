// ==UserScript==
// @name         BDrawRobot
// @namespace    http://lele.moe/
// @version      1.0
// @description  Using it in SummerDraw by Bilibili draw automatic.
// @author       LeLe570929726
// @match        http://live.bilibili.com/pages/1702/pixel-drawing*
// @grant        none
// @require      https://code.jquery.com/jquery-3.2.1.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    caretePlane();
    setEvent();
})();

var isDraw = false;

function caretePlane() {
    $("body").append(
        "<div style=\"position:fixed;left:0px;top:0px;height:65px;width:250px;background-color:#76b900;z-index:1002;padding:20px;box-shadow:0px 0px 15px #000;\">" +
        "    服务器地址</br>" +
        "    <input type=\"text\" name=\"server\" id=\"plugin_server\" style=\"width:240px;\"></br>" +
        "    <button type=\"button\" id=\"plugin_start\">开始</button>" +
        "    <button type=\"button\" id=\"plugin_stop\">停止</button>" +
        "</div>" +
        "<div id=\"plugin_mask_plane\" style=\"position:fixed;top:0px;left:0px;width:100%;height:100%;background-color:rgba(118,185,0,0.5);z-index:1001;display: flex;justify-content:center;align-items:Center;\">" +
        "    <h1 style=\"text-align:center;font-size:32px;color:#ffffff;text-shadow:0px 0px 15px #000\">正在联网施工中，此页面暂时不可进行操作。</h1>" +
        "</div>"
    );
    $("button#plugin_stop").attr('disabled',"true");
    $("div#plugin_mask_plane").css('visibility',"hidden");
}

function setEvent() {
    // Set start button's event
    $("button#plugin_start").click(function() {
        buttonStatusStart();
        if(checkScale() === false) {
            alert("请将【绘板缩放】调至1x。");
            buttonStatusStop();
        } else if(!checkServer($("input#plugin_server").val() + "/control.php")) {
            alert("服务器不可用，请输入正确的服务器地址。");
            buttonStatusStop();
        } else {
            isDraw = true;
            startDraw();
        }
    });
    // Set stop button's event
    $("button#plugin_stop").click(function() {
        isDraw = false;
        buttonStatusStop();
    });
}

function buttonStatusStart() {
    $("button#plugin_start").attr('disabled',"true");
    $("button#plugin_stop").removeAttr('disabled');
    $("div#plugin_mask_plane").css('visibility',"visible");
}

function buttonStatusStop() {
    $("button#plugin_stop").attr('disabled',"true");
    $("button#plugin_start").removeAttr('disabled');
    $("div#plugin_mask_plane").css('visibility',"hidden");
}

function checkServer(server) {
    var postStatus = false;
    $.ajax(server, { type : "post", dataType : "json", async : false, data : { require : "heart_beat" }, success : function(data) {
        if(data.status == "success") {
            postStatus = true;
        }
    }});
    return postStatus;
}

function checkScale() {
    return $("div.scaling-rate").text() == "绘板缩放1 x";
}

function startDraw() {
    var server = $("input#plugin_server").val();
    // Get the check point
    $.ajax(server + "/check.php", { type:"post", dataType:"json", data:{  }, success:function(data) {
        getPoint(server + "/check.php", data.task.x, data.task.y, data.task.w, data.task.h);
    }});
    // Draw point
    drawPoint(server + "/control.php");
}

function drawPoint(server) {
    if(isDraw) {
        $.ajax(server, { type:"post", dataType:"json", data:{ require:"task" }, success:function(data) {
            if(data.task.status == "yes") {
                $.ajax("http://api.live.bilibili.com/activity/v1/SummerDraw/draw",
                       { type:"post", dataType:"json", xhrFields:{ withCredentials: true },data:{ x_min:data.task.x, y_min:data.task.y, x_max:data.task.x, y_max:data.task.y, color:data.task.color } });
            }
            setTimeout(function() { drawPoint(server); }, 185000);
        }});
    }
}

function getPoint(server, px, py, pw, ph) {
    if(isDraw) {
        var canvas = $("canvas#drawing-canvas").get(0).getContext("2d");
        var canvasData = canvas.getImageData(px, py, pw, ph).data;
        var pdata = new Array([]);
        pdata.length = 0;
        for(var i = 0; i < ph; ++i) {
            var line = new Array([]);
            line.length = 0;
            for(var j = 0; j < pw; ++j) {
                line.push(rgbToHEX(canvasData[(4 * ((pw * i) + j))], canvasData[(4 * ((pw * i) + j)) + 1], canvasData[(4 * ((pw * i) + j)) + 2]));
            }
            pdata.push(line);
        }
        $.ajax(server, { type:"post", dataType:"json", data:{ data:JSON.stringify(pdata) }, success:function(data) {
            setTimeout(function() { getPoint(server, data.task.x, data.task.y, data.task.w, data.task.h); }, 30000);
        }});
    }
}

function rgbToHEX(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}