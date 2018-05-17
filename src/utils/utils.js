export function getTextWidth(text, font) {
    var canvas = this.canvas || (this.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}

export function isObjectEmpty(obj) {
    return (typeof obj === "undefined" || (Object.keys(obj).length === 0 && obj.constructor === Object));
}

export function getUniqueID(left, right) {
    left = left || 1e5; right = right || 1e6 - 1;
    return Math.floor(Math.random() * (right - left) + left);
}

/**
 * To insert the right boundary value to a tick array.
 * @param {array} tickValues - an array of d3 tick values 
 * @param {*} value - value to append to the array
 */
export function appendValueToDomain(tickValues, value) {
    if (value === undefined || tickValues.length <= 1 || tickValues[tickValues.length - 1] >= value)
        return tickValues;

    var interval = Math.abs(tickValues[1] - tickValues[0]);

    if (Math.abs(value - tickValues[tickValues.length - 1]) > interval / 2) {
        tickValues.push(value);
    } else {
        tickValues[tickValues.length - 1] = value;
    }

    return tickValues;
}