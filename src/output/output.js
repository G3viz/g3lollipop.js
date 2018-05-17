// ==========================================
// g3.utils.output module 
// ==========================================
import { saveAs } from "file-saver";

export default function () {
    // helper functions
    function _parseFilename(filename, fileExt) {
        filename = filename || defaultFilename;
        return filename + "." + fileExt;
    }

    function _getSVGString(svgNode) {
        svgNode.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svgNode.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        var cssStyvarext = _getCSSStyles(svgNode);

        _appendCSS(cssStyvarext, svgNode);

        var serializer = new XMLSerializer(),
            svgString = serializer.serializeToString(svgNode);
        svgString = svgString.replace(/(\w+)?:?xlink=/g, "xmlns:xlink="); // Fix root xlink without namespace
        svgString = svgString.replace(/NS\d+:href/g, "xlink:href"); // Safari NS namespace fix

        return svgString;

        function _getCSSStyles(parentElement) {
            var selectorTextArr = [];

            // Add Parent element Id and Classes to the list
            selectorTextArr.push("#" + parentElement.id);
            for (let c = 0; c < parentElement.classList.length; c++)
                if (!contains("." + parentElement.classList[c], selectorTextArr))
                    selectorTextArr.push("." + parentElement.classList[c]);

            // Add Children element Ids and Classes to the list
            var nodes = parentElement.getElementsByTagName("*");
            for (let i = 0; i < nodes.length; i++) {
                var id = nodes[i].id;
                if (!contains("#" + id, selectorTextArr))
                    selectorTextArr.push("#" + id);

                var classes = nodes[i].classList;
                for (let c = 0; c < classes.length; c++)
                    if (!contains("." + classes[c], selectorTextArr))
                        selectorTextArr.push("." + classes[c]);
            }

            // Extract CSS Rules
            var extractedCSSText = "";
            for (let i = 0; i < document.styleSheets.length; i++) {
                var s = document.styleSheets[i];

                try {
                    if (!s.cssRules)
                        continue;
                } catch (e) {
                    if (e.name !== "SecurityError")
                        throw e; // for Firefox
                    continue;
                }

                var cssRules = s.cssRules;
                for (var r = 0; r < cssRules.length; r++) {
                    if (contains(cssRules[r].selectorText, selectorTextArr))
                        extractedCSSText += cssRules[r].cssText;
                }
            }

            return extractedCSSText;

            function contains(str, arr) {
                return arr.indexOf(str) === -1 ? false : true;
            }
        }

        function _appendCSS(cssText, element) {
            var styleElement = document.createElement("style");
            styleElement.setAttribute("type", "text/css");
            styleElement.innerHTML = cssText;
            var refNode = element.hasChildNodes() ? element.children[0] : null;
            element.insertBefore(styleElement, refNode);
        }
    }

    var defaultFilename = "output";
    var svgNode = "svg";

    function output(nodeId) {
        svgNode = nodeId || svgNode;
    }

    output.toSVG = function (filename) {
        filename = _parseFilename(filename, "svg");

        var svg_string = _getSVGString(document.querySelector(svgNode));
        var blod = new Blob([svg_string], { type: "image/svg+xml" });

        saveAs(blod, filename);
    }

    output.toPNG = function (filename) {
        filename = _parseFilename(filename, "png");

        var svg = document.querySelector(svgNode),
            width = +svg.getAttribute("width"),
            height = +svg.getAttribute("height"),
            svg_string = _getSVGString(svg);

        // Convert SVG string to data URL
        var imgsrc = "data:image/svg+xml;base64," +
            btoa(unescape(encodeURIComponent(svg_string)));
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        var canvas_content = canvas.getContext("2d");
        var image = new Image();
        image.src = imgsrc;
        image.onload = function () {
            canvas_content.clearRect(0, 0, width, height);
            canvas_content.drawImage(image, 0, 0, width, height);

            canvas.toBlob(function (blob) {
                saveAs(blob, filename);
            });
        };
    }

    return output;
}