export function getTextWidth(text, font) {
    var canvas = document.getElementById("canvas") || document.createElement("canvas")
    var context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}

export function getUniqueID(left, right) {
    left = left || 1e5;
    right = right || 1e6 - 1;
    return Math.floor(Math.random() * (right - left) + left);
}