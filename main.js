"use strict";
//@ts-ignore
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d", { desynchronized: true });
//@ts-ignore
// context?.imageSmoothingEnabled = true
//@ts-ignore
// context?.lineCap = 'round';
//@ts-ignore
// context?.lineJoin = 'round';
var drawing = false;
var ongoingTouches = new Array();
startup();
function startup() {
    canvas.addEventListener("pointerdown", handleStart, false);
    canvas.addEventListener("pointerup", handleEnd, false);
    canvas.addEventListener("pointercancel", handleCancel, false);
    canvas.addEventListener("pointermove", handleMove, false);
}
function handleStart(evt) {
    log("start");
    ongoingTouches.push(copyTouch(evt));
    var color = colorForTouch(evt);
    // context?.beginPath();
    // context?.arc(ongoingTouches[ongoingTouches.length - 1].pageX, ongoingTouches[ongoingTouches.length - 1].pageY, 4, 0, 2 * Math.PI, false);  // a circle at the start
    // context?.arc(evt.clientX, evt.clientY, 4, 0, 2 * Math.PI, false);  // a circle at the start
    //@ts-ignore
    // context?.fillStyle = color;
    // context?.fill();
}
function handleMove(evt) {
    var color = colorForTouch(evt);
    var idx = ongoingTouchIndexById(evt.pointerId.toString());
    if (evt.pointerType != "pen")
        return;
    if (idx >= 0) {
        context === null || context === void 0 ? void 0 : context.beginPath();
        context === null || context === void 0 ? void 0 : context.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
        // const centerX = evt.clientX > ongoingTouches[idx].pageX ? ongoingTouches[idx].pageX - (evt.clientX / 2) : evt.clientX - (ongoingTouches[idx].pageX / 2)
        // const centerY = evt.clientY > ongoingTouches[idx].pageY ? ongoingTouches[idx].pageY - (evt.clientY / 2) : evt.clientY - (ongoingTouches[idx].pageY / 2)
        // context?.quadraticCurveTo(centerX, centerY, evt.clientX, evt.clientY);
        context === null || context === void 0 ? void 0 : context.lineTo(evt.clientX, evt.clientY);
        //@ts-ignore
        context === null || context === void 0 ? void 0 : context.lineWidth = evt.pressure * 3;
        //@ts-ignore
        context === null || context === void 0 ? void 0 : context.strokeStyle = color;
        console.log(evt.buttons);
        if (evt.buttons == 32) {
            //@ts-ignore
            context === null || context === void 0 ? void 0 : context.lineWidth = 25;
            //@ts-ignore
            context === null || context === void 0 ? void 0 : context.strokeStyle = "#000000";
        }
        context === null || context === void 0 ? void 0 : context.stroke();
        ongoingTouches.splice(idx, 1, copyTouch(evt)); // swap in the new touch record
    }
    else {
    }
}
function handleEnd(evt) {
    var color = colorForTouch(evt);
    var idx = ongoingTouchIndexById(evt.pointerId);
    if (evt.pointerType != "pen")
        return;
    if (idx >= 0) {
        //@ts-ignore
        context === null || context === void 0 ? void 0 : context.lineWidth = 4;
        //@ts-ignore
        context === null || context === void 0 ? void 0 : context.fillStyle = color;
        context === null || context === void 0 ? void 0 : context.beginPath();
        context === null || context === void 0 ? void 0 : context.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
        context === null || context === void 0 ? void 0 : context.lineTo(evt.clientX, evt.clientY);
        // context?.fillRect(evt.clientX - 4, evt.clientY - 4, 8, 8);  // and a square at the end
        ongoingTouches.splice(idx, 1); // remove it; we're done
    }
    else {
    }
}
function handleCancel(evt) {
    log("pointercancel: id = " + evt.pointerId);
    var idx = ongoingTouchIndexById(evt.pointerId);
    ongoingTouches.splice(idx, 1); // remove it; we're done
}
function colorForTouch(touch) {
    var r = touch.pointerId % 16;
    var g = Math.floor(touch.pointerId / 3) % 16;
    var b = Math.floor(touch.pointerId / 7) % 16;
    //@ts-ignore
    r = r.toString(16); // make it a hex digit
    //@ts-ignore
    g = g.toString(16); // make it a hex digit
    //@ts-ignore
    b = b.toString(16); // make it a hex digit
    var color = "#FFFFFF";
    log("color for touch with identifier " + touch.pointerId + " = " + color);
    return color;
}
function copyTouch(touch) {
    return { identifier: touch.pointerId, pageX: touch.clientX, pageY: touch.clientY };
}
function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;
        if (id == idToFind) {
            return i;
        }
    }
    return -1; // not found
}
function log(msg) {
    console.log(msg);
}
window.addEventListener("resize", function () {
    updateCanvasSize();
});
updateCanvasSize();
function updateCanvasSize() {
    var width = window.innerWidth - 10;
    var height = window.innerHeight - 10;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
}
