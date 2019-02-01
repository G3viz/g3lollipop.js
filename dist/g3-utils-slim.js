(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.g3slim = global.g3slim || {})));
}(this, (function (exports) { 'use strict';

function getTextWidth(text, font) {
    var canvas = document.getElementById("canvas") || document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = font;
    return context.measureText(text).width;
}

function getUniqueID(left, right) {
    left = left || 1e5;
    right = right || 1e6 - 1;
    return Math.floor(Math.random() * (right - left) + left);
}

var palettes = {
    bottlerocket1: ["#A42820", "#5F5647", "#9B110E", "#3F5151", "#4E2A1E",
        "#550307", "#0C1707"
    ],
    bottlerocket2: ["#FAD510", "#CB2314", "#273046", "#354823", "#1E1E1E"],
    rushmore1: ["#E1BD6D", "#F2300F", "#35274A", "#EABE94", "#0B775E"],
    royal1: ["#899DA4", "#C93312", "#FAEFD1", "#DC863B"],
    royal2: ["#9A8822", "#F5CDB4", "#F8AFA8", "#FDDDA0", "#74A089"],
    zissou1: ["#3B9AB2", "#78B7C5", "#EBCC2A", "#E1AF00", "#F21A00"],
    darjeeling1: ["#FF0000", "#00A08A", "#F2AD00", "#F98400", "#5BBCD6"],
    darjeeling2: ["#ECCBAE", "#046C9A", "#D69C4E", "#ABDDDE", "#000000"],
    chevalier1: ["#446455", "#FDD262", "#D3DDDC", "#C7B19C"],
    fantasticfox1: ["#DD8D29", "#E2D200", "#46ACC8", "#E58601", "#B40F20"],
    moonrise1: ["#F3DF6C", "#CEAB07", "#D5D5D3", "#24281A"],
    moonrise2: ["#798E87", "#C27D38", "#CCC591", "#29211F"],
    moonrise3: ["#85D4E3", "#F4B5BD", "#9C964A", "#CDC08C", "#FAD77B"],
    cavalcanti1: ["#D8B70A", "#02401B", "#A2A475", "#81A88D", "#972D15"],
    grandbudapest1: ["#F1BB7B", "#FD6467", "#5B1A18", "#D67236"],
    grandbudapest2: ["#E6A0C4", "#C6CDF7", "#D8A499", "#7294D4"],
    google16: ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099",
        "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395",
        "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300",
        "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"
    ],
    google5: ["#008744", "#0057e7", "#d62d20", "#ffa700", "#ffffff"],
    material1: ["#263238", "#212121", "#3e2723", "#dd2c00", "#ff6d00",
        "#ffab00", "#ffd600", "#aeea00", "#64dd17", "#00c853",
        "#00bfa5", "#00b8d4", "#0091ea", "#2962ff", "#304ffe",
        "#6200ea", "#aa00ff", "#c51162", "#d50000"
    ],
    pie1: ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99"],
    pie2: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"],
    pie3: ["#495769", "#A0C2BB", "#F4A775", "#F4C667", "#F37361"],
    pie4: ["#FA7921", "#E55934", "#9BC53D", "#FDE74C", "#5BC0EB"],
    pie5: ["#5DA5DA", "#4D4D4D", "#60BD68", "#B2912F", "#B276B2",
        "#F15854", "#FAA43A"
    ],
    pie6: ["#537ea2", "#42a593", "#9f1a1a", "#7c5f95", "#61a070"],
    pie7: ["#bddff9", "#1e72bf", "#ead1ab", "#a2dbc5", "#c7ae7d"],
    breakfast: ["#b6411a", "#eec3d8", "#4182dd", "#ecf0c8", "#2d6328"],
    set1: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00",
        "#ffff33", "#a65628", "#f781bf", "#999999"
    ],
    set2: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854",
        "#ffd92f", "#e5c494", "#b3b3b3"
    ],
    set3: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3",
        "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd",
        "#ccebc5", "#ffed6f"
    ],
    category10: ["#1f77b4", "#2ca02c", "#d62728", "#ff7f0e", "#9467bd",
        "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ],
    pastel1: ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6",
        "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"
    ],
    pastel2: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9",
        "#fff2ae", "#f1e2cc", "#cccccc"
    ],
    accent: ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#bf5b17",
        "#386cb0", "#f0027f", "#666666"
    ],
    dark2: ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e",
        "#e6ab02", "#a6761d", "#666666"
    ],
};

function defaultPalette() {
    return palettes["google16"];
}

function getPalette(paletteName) {
    return (paletteName in palettes) ? palettes[paletteName] : defaultPalette;
}

function listPalettes() {
    return Object.keys(palettes);
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

var saveAs = saveAs || (function(view) {
	if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
		return;
	}
	var
		  doc = view.document
		  // only get URL when necessary in case Blob.js hasn't overridden it yet
		, get_URL = function() {
			return view.URL || view.webkitURL || view;
		}
		, save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
		, can_use_save_link = "download" in save_link
		, click = function(node) {
			var event = new MouseEvent("click");
			node.dispatchEvent(event);
		}
		, is_safari = /constructor/i.test(view.HTMLElement) || view.safari
		, is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent)
		, setImmediate = view.setImmediate || view.setTimeout
		, throw_outside = function(ex) {
			setImmediate(function() {
				throw ex;
			}, 0);
		}
		, force_saveable_type = "application/octet-stream"
		// the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
		, arbitrary_revoke_timeout = 1000 * 40 // in ms
		, revoke = function(file) {
			var revoker = function() {
				if (typeof file === "string") { // file is an object URL
					get_URL().revokeObjectURL(file);
				} else { // file is a File
					file.remove();
				}
			};
			setTimeout(revoker, arbitrary_revoke_timeout);
		}
		, dispatch = function(filesaver, event_types, event) {
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
		}
		, auto_bom = function(blob) {
			// prepend BOM for UTF-8 XML and text/* types (including HTML)
			// note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
			if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
				return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
			}
			return blob;
		}
		, FileSaver = function(blob, name, no_auto_bom) {
			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			// First try a.download, then web filesystem, then object URLs
			var
				  filesaver = this
				, type = blob.type
				, force = type === force_saveable_type
				, object_url
				, dispatch_all = function() {
					dispatch(filesaver, "writestart progress write writeend".split(" "));
				}
				// on any filesys errors revert to saving with object URLs
				, fs_error = function() {
					if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
						// Safari doesn't allow downloading of blob urls
						var reader = new FileReader();
						reader.onloadend = function() {
							var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
							var popup = view.open(url, '_blank');
							if(!popup) view.location.href = url;
							url=undefined; // release reference before dispatching
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
				setImmediate(function() {
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
		}
		, FS_proto = FileSaver.prototype
		, saveAs = function(blob, name, no_auto_bom) {
			return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
		};

	// IE 10+ (native saveAs)
	if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
		return function(blob, name, no_auto_bom) {
			name = name || blob.name || "download";

			if (!no_auto_bom) {
				blob = auto_bom(blob);
			}
			return navigator.msSaveOrOpenBlob(blob, name);
		};
	}

	// todo: detect chrome extensions & packaged apps
	//save_link.target = "_blank";

	FS_proto.abort = function(){};
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
	   typeof self !== "undefined" && self
	|| typeof window !== "undefined" && window
	|| undefined
));

// ==========================================
// g3.utils.output module 
// ==========================================
function output () {
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
    };

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
    };

    return output;
}

exports.getTextWidth = getTextWidth;
exports.getUniqueID = getUniqueID;
exports.palettes = palettes;
exports.defaultPalette = defaultPalette;
exports.getPalette = getPalette;
exports.listPalettes = listPalettes;
exports.output = output;

Object.defineProperty(exports, '__esModule', { value: true });

})));
