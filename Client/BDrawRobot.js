// ==UserScript==
// @name         SummerDrawAuto
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
        "<div style=\"position:fixed;left:0px;top:0px;height:95px;width:250px;background-color:#76b900;z-index:1002;padding:20px;box-shadow:0px 0px 15px #000;\">" +
        "    服务器地址</br>" +
        "    <input type=\"text\" name=\"server\" id=\"plugin_server\" style=\"width:240px;\"></br>" +
        "    <button type=\"button\" id=\"plugin_start\">开始</button>" +
        "    <button type=\"button\" id=\"plugin_stop\">停止</button></br></br>" +
        "    请在开始施工前确保【绘板缩放】为1x。" +
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
        if(!checkServer($("input#plugin_server").val() + "/control.php")) {
            alert("服务器不可用，请输入正确的服务器地址。");
            buttonStatusStop();
        }
        isDraw = true;
        startDraw();
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

function startDraw() {
    var server = $("input#plugin_server").val();
    // Get the check point
    $.ajax(server + "/check.php", { type:"post", dataType:"json", data:{  }, success:function(data) {
        getPoint(server + "/check.php", data.next.x, data.next.y);
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
            setTimeout(function() { drawPoint(server); }, 180000);
        }});
    }
}

function getPoint(server, px, py) {
    if(isDraw) {
        var canvas = $("canvas#drawing-canvas").get(0).getContext("2d");
        var pcolor = rgbToHEX(canvas.getImageData(px, py, 1, 1).data[0], canvas.getImageData(px, py, 1, 1).data[1], canvas.getImageData(px, py, 1, 1).data[2]);
        $.ajax(server, { type:"post", dataType:"json", data:{ x:px, y:py, color:pcolor }, success:function(data) {
            setTimeout(function() { getPoint(server, data.next.x, data.next.y); }, 50);
        }});
    }
}

function rgbToHEX(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}