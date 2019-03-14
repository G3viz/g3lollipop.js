// ==========================================
// g3.utils.output module 
// ==========================================
//import { saveAs } from 'file-saver';

export default function () {
    var defaultFilename = "output";
    
    var output = function(){};
    /*
    function output(nodeId) {
        svgNode = nodeId || svgNode;
    }
    */

    // helper functions
    function _getSVGByID(nodeId) {
        if (nodeId == "svg") {
            return document.querySelector('svg');
        } else {
            return document.getElementsByTagName('svg')[nodeId];
        }
    }

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

    output.toSVG = function (filename, nodeId) {
        nodeId = nodeId || "svg";
        var svg = _getSVGByID(nodeId);

        filename = _parseFilename(filename, "svg");

        var svg_string = _getSVGString(svg);
        var blod = new Blob([svg_string], {
            type: "image/svg+xml"
        });

        saveAs(blod, filename);
    }

    output.toPNG = function (filename, nodeId) {
        nodeId = nodeId || "svg";
        var svg = _getSVGByID(nodeId);

        filename = _parseFilename(filename, "png");

        var width = +svg.getAttribute("width"),
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

    /* FileSaver.js
     * A saveAs() FileSaver implementation.
     * 1.3.8
     * 2018-03-22 14:03:47
     *
     * By Eli Grey, https://eligrey.com
     * License: MIT
     *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
     */

    /*global self */
    /*jslint bitwise: true, indent: 4, laxbreak: true, laxcomma: true, smarttabs: true, plusplus: true */

    /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/src/FileSaver.js */

    var saveAs = saveAs || (function (view) {
        if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
            return;
        }
        var
            doc = view.document
            // only get URL when necessary in case Blob.js hasn't overridden it yet
            ,
            get_URL = function () {
                return view.URL || view.webkitURL || view;
            },
            save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
            can_use_save_link = "download" in save_link,
            click = function (node) {
                var event = new MouseEvent("click");
                node.dispatchEvent(event);
            },
            is_safari = /constructor/i.test(view.HTMLElement) || view.safari,
            is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent),
            setImmediate = view.setImmediate || view.setTimeout,
            throw_outside = function (ex) {
                setImmediate(function () {
                    throw ex;
                }, 0);
            },
            force_saveable_type = "application/octet-stream"
            // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
            ,
            arbitrary_revoke_timeout = 1000 * 40 // in ms
            ,
            revoke = function (file) {
                var revoker = function () {
                    if (typeof file === "string") { // file is an object URL
                        get_URL().revokeObjectURL(file);
                    } else { // file is a File
                        file.remove();
                    }
                };
                setTimeout(revoker, arbitrary_revoke_timeout);
            },
            dispatch = function (filesaver, event_types, event) {
                event_types = [].concat(event_types);
                var i = event_types.length;
                while (i--) {
                    var listener = filesaver["on" + event_types[i]];
                    if (typeof listener === "function") {
                        try {
                            listener.call(filesaver, event || filesaver);
                        } catch (ex) {
                            throw_outside(ex);
                        }
                    }
                }
            },
            auto_bom = function (blob) {
                // prepend BOM for UTF-8 XML and text/* types (including HTML)
                // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
                if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                    return new Blob([String.fromCharCode(0xFEFF), blob], {
                        type: blob.type
                    });
                }
                return blob;
            },
            FileSaver = function (blob, name, no_auto_bom) {
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                // First try a.download, then web filesystem, then object URLs
                var
                    filesaver = this,
                    type = blob.type,
                    force = type === force_saveable_type,
                    object_url, dispatch_all = function () {
                        dispatch(filesaver, "writestart progress write writeend".split(" "));
                    }
                    // on any filesys errors revert to saving with object URLs
                    ,
                    fs_error = function () {
                        if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
                            // Safari doesn't allow downloading of blob urls
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                                var popup = view.open(url, '_blank');
                                if (!popup) view.location.href = url;
                                url = undefined; // release reference before dispatching
                                filesaver.readyState = filesaver.DONE;
                                dispatch_all();
                            };
                            reader.readAsDataURL(blob);
                            filesaver.readyState = filesaver.INIT;
                            return;
                        }
                        // don't create more object URLs than needed
                        if (!object_url) {
                            object_url = get_URL().createObjectURL(blob);
                        }
                        if (force) {
                            view.location.href = object_url;
                        } else {
                            var opened = view.open(object_url, "_blank");
                            if (!opened) {
                                // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                                view.location.href = object_url;
                            }
                        }
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        revoke(object_url);
                    };
                filesaver.readyState = filesaver.INIT;

                if (can_use_save_link) {
                    object_url = get_URL().createObjectURL(blob);
                    setImmediate(function () {
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        dispatch_all();
                        revoke(object_url);
                        filesaver.readyState = filesaver.DONE;
                    }, 0);
                    return;
                }

                fs_error();
            },
            FS_proto = FileSaver.prototype,
            saveAs = function (blob, name, no_auto_bom) {
                return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
            };

        // IE 10+ (native saveAs)
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
            return function (blob, name, no_auto_bom) {
                name = name || blob.name || "download";

                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                return navigator.msSaveOrOpenBlob(blob, name);
            };
        }

        // todo: detect chrome extensions & packaged apps
        //save_link.target = "_blank";

        FS_proto.abort = function () {};
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;

        FS_proto.error =
            FS_proto.onwritestart =
            FS_proto.onprogress =
            FS_proto.onwrite =
            FS_proto.onabort =
            FS_proto.onerror =
            FS_proto.onwriteend =
            null;

        return saveAs;
    }(
        typeof self !== "undefined" && self ||
        typeof window !== "undefined" && window ||
        undefined
    ));

    return output
}