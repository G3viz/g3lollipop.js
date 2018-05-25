import d3 from "d3";

import { getTextWidth, getUniqueID } from "../utils/utils";
import { palettes, defaultPalette, getPalette, listPalettes, scaleOrdinal } from "../utils/color";
import { default as output } from "../output/output";
import { default as legend } from "../legend/legend";
import { default as tooltip } from "../utils/tooltip";

export default function Lollipop(target, chartType, width) {
    'ues strict';

    const Add = 1, Remove = -1,
        Prefix = "g3_lollipop",
        Undefined = "__undefined__",
        NumberUndefined = null;

    const ChartTypes = { "circle": 0, "pie": 1 };
    const ChartTypeDefault = "circle";
    const Target = "svg", Width = 800;
    const LollipopTrackHeightDefault = 420, DomainTractHeightDefault = 30;

    const SnvDataDefaultOpt = {
        x: "AA_Position",
        y: "Protein_Change",
        factor: "Mutation_Class",
    };

    const DomainDataDefaultOpt = {
        symbol: "hgnc_symbol",
        name: "protein_name",
        length: "length",
        domainType: "pfam",
        details: {
            start: "pfam_start",
            end: "pfam_end",
            ac: "pfam_ac",
            name: "pfam_id",
        },
    };

    // public parameters
    target = target || Target;
    width = width || Width;
    chartType = chartType || ChartTypeDefault;

    if (!(chartType in ChartTypes)) {
        chartType = ChartTypeDefault;
    }

    var uniqueID = getUniqueID();
    var options = {
        chartID: Prefix + "_" + uniqueID,
        className: "g3-chart",
        tooltip: true,
        margin: { left: 40, right: 20, top: 15, bottom: 25 },
        background: "transparent",
        transitionTime: 600,
        legend: true,
        legendOpt: {
            margin: {},
            interactive: true,
            title: Undefined,
        },
    };

    // lollipop settings
    var lollipopOpt = {
        id: Prefix + "-main-" + uniqueID,
        defsId: Prefix + "-main-defs-" + uniqueID,
        height: LollipopTrackHeightDefault,
        background: "rgb(244,244,244)",
        lollipopClassName: {
            group: "lollipop",
            line: "lollipopLine",
            pop: "pop",
        },
        lollipopLine: {
            "stroke": "rgb(42,42,42)",
            "stroke-width": 0.5,
        },
        popClassName: {
            pie: "popPie",
            slice: "pieSlice",
            text: "popText",
            circle: "popCircle",
            label: "popLabel",
        },
        // pop circle
        popCircle: {
            "stroke": "wheat",
            "stroke-width": 0.5,
        },
        // text in middle of pops
        popText: {
            fill: "#EEE",
            "font-family": "Sans",
            "font-weight": "normal",
            "text-anchor": "middle",
            dy: "0.35em",
        },
        popLabel: {
            "font-family": "Arial",
            "font-weight": "normal",
            minFontSize: 10,
            fontsizeToRadius: 1.4,
            padding: 5,
        },
        popColorScheme: scaleOrdinal("accent"),
        yPaddingRatio: 1.1,
        popParams: {
            rMin: 2,
            rMax: 12,
            addNumRCutoff: 8,
            yLowerQuantile: .25,
            yUpperQuantile: .99,
        },
        title: {
            id: "g3-chart-title",
            text: "",
            font: "normal 16px Arial",
            color: "#424242",
            alignment: "middle",
            dy: "0.35em",
        },
        axisLabel: {
            font: "normal 12px Arial",
            fill: "#4f4f4f",
            "text-anchor": "middle",
            dy: "-2em",
            alignment: "middle",
        },
        ylab: {
            text: "mutations",
        },
    };

    // domain information settings
    var domainOpt = {
        id: Prefix + "-domain-" + uniqueID,
        defsId: Prefix + "-annotation-defs-" + uniqueID,
        height: DomainTractHeightDefault,
        margin: { top: 4, bottom: 0 },
        background: "transparent",
        className: {
            track: "domain_track",
            bar: "domain_bar",
            domain: Prefix + "_domain",
            brush: "domain-x-brush",
            zoom: "main-viz-zoom",
        },
        domain: {
            colorScheme: scaleOrdinal("category10"),
            margin: { top: 0, bottom: 0 },
            label: {
                font: "normal 11px Arial",
                color: "#f2f2f2",
            },
        },
        bar: {
            background: "#e5e3e1",
            margin: { top: 2, bottom: 2 }
        },
        brush: true,
        zoom: true,
    };

    // data and settings
    var snvData = [], domainData = {};
    var snvDataOpt = SnvDataDefaultOpt, domainDataOpt = DomainDataDefaultOpt;

    /* private variables */
    // chart settings
    var _svg, _viz, _mainViz, _domainViz,
        _lollipops, _popLines, _pops,
        _popYUpper, _popYLower, // lollipop viz components
        _domainRect, _domainText,
        _snvInit = false, // data initiallization
        _yUpperValueArray = [], _yValueMax,
        _xRange, _xScale, _xAxis, _xTicks, _domXAxis,
        _yRange, _yScale, _yAxis, _yValues, _domYAxis,
        _popTooltip = null,
        _chartInit = false,
        _byFactor = false, _currentStates = {}, _lollipopLegend;

    var _domainBrush, _xScaleOrig, _domainZoom;
    var _domainH, _domainW, _mainH, _mainW, _svgH, _svgW;

    var _colorPanel = function (name) {
        return d3.scaleOrdinal(getPalette(name));
    };

    var _appendValueToDomain = function (tickValues, value) {
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

    // event handlers
    var _getDomainRectWidth = function (d) {
        return _getDomainEnd(d) - _getDomainStart(d);
    };

    var _getDomainStart = function (d) {
        return _xScale(d[domainDataOpt.details.start]);
    };

    var _getDomainEnd = function (d) {
        return _xScale(d[domainDataOpt.details.end]);
    };

    var _updateX = function () {
        _xScale.domain(_xRange);
        _domXAxis.call(_xAxis);

        // update domains
        _domainRect
            .attr("x", function (d) { return _getDomainStart(d); })
            .attr("width", function (d) { return _getDomainRectWidth(d); });

        _domainText
            .attr("x", function (d) { return (_getDomainStart(d) + _getDomainEnd(d)) / 2; })

        // update lines of lollipops
        _popLines//.transition().duration(_options.transitionTime)
            .attr("x1", function (d) { return _getPopX(d); })
            .attr("x2", function (d) { return _getPopX(d); });

        // update pop arcs
        _pops//.transition().duration(_options.transitionTime)
            .attr("transform", function (d) {
                return "translate(" + _getPopX(d) + "," + _getPopY(d) + ")";
            });
    };

    var _domainBrushMove = function () {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;

        let _selection = d3.event.selection || _xScaleOrig.range();
        _xRange = _selection.map(_xScaleOrig.invert);

        if (domainOpt.zoom) {
            _mainViz.select(".main-viz-zoom").call(_domainZoom.transform,
                d3.zoomIdentity
                    .scale(_mainW / (_selection[1] - _selection[0]))
                    .translate(-_selection[0], 0));
        }

        _updateX();
    };

    var _drawDomain = function () {
        // domain protein bar
        let _barH = _domainH - domainOpt.bar.margin.top - domainOpt.bar.margin.bottom;

        _domainViz.append("rect").classed(domainOpt.className.bar, true)
            .attr("x", 0).attr("y", domainOpt.bar.margin.top)
            .attr("width", _domainW).attr("height", _barH)
            .attr("fill", domainOpt.bar.background);

        // draw protein domains
        let _dH = _domainH - domainOpt.domain.margin.top - domainOpt.domain.margin.bottom;

        // draw domains
        let _domainG = _domainViz.append("g").attr("class", domainOpt.className.track)
            .selectAll(domainOpt.className.domain)
            .data(domainData[domainDataOpt.domainType]).enter().append("g")
            .attr("clip-path", "url(#" + domainOpt.defsId + ")")
            .attr("class", domainOpt.className.domain);

        _domainRect = _domainG.append("rect")
            .attr("x", function (d) { return _getDomainStart(d); })
            .attr("y", domainOpt.domain.margin.top)
            .attr("height", _dH)
            .attr("width", function (d) { return _getDomainRectWidth(d); })
            .attr("fill", function (d) { return domainOpt.domain.colorScheme(d[domainDataOpt.details.name]); });

        _domainText = _domainG.append("text")
            .attr("x", function (d) { return (_getDomainStart(d) + _getDomainEnd(d)) / 2; })
            .attr("y", domainOpt.domain.margin.top + _dH / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("fill", domainOpt.domain.label.color || "white")
            .style("font", domainOpt.domain.label.font)
            .text(function (d) { return d[domainDataOpt.details.name]; });

        if (domainOpt.brush) {
            _domainBrush = d3.brushX()
                .extent([[0, 0], [_domainW, _domainH]])
                .on("brush end", _domainBrushMove);
        }

        if (domainOpt.zoom) {
            _domainZoom = d3.zoom()
                .scaleExtent([1, Infinity])
                .translateExtent([[0, 0], [_mainW, _mainH]])
                .extent([[0, 0], [_mainW, _mainH]])
                .on("zoom", _mainVizZoomed);
        }

        if (domainOpt.brush) {
            _domainViz.append("g")
                .attr("class", domainOpt.className.brush)
                .call(_domainBrush);
        }
        if (domainOpt.zoom) {
            _mainViz.append("rect")
                .attr("class", domainOpt.className.zoom)
                .attr("width", _mainW)
                .attr("height", _mainH)
                .attr("fill", "none")
                .attr("cursor", "move")
                .attr("pointer-events", "all")
                .call(_domainZoom);
        }
    };

    var _getPopX = function (_datum) {
        return _xScale(_datum.position);
    };

    var _getPopY = function (_datum) {
        return _yScale(_datum._currentState.count);
    };

    var _getPopR = function (_datum) {
        let count = _datum._currentState.count;

        if (count == 0)
            return 0;

        if (count >= _popYUpper)
            return lollipopOpt.popParams.rMax;
        else if (count <= _popYLower)
            return lollipopOpt.popParams.rMin;
        else
            return ((count - _popYLower) / (_popYUpper - _popYLower) *
                (lollipopOpt.popParams.rMax - lollipopOpt.popParams.rMin) +
                lollipopOpt.popParams.rMin);
    };

    var _popDetailHtml = function (d) {
        let _html = "";

        if (_byFactor) {
            _html += `<div class="note">
            <table class="pure-table pure-table-bordered">
                <caption> Position ${d.position} </caption>
                <thead>
                    <tr>
                        <th scope="col">Class</th>
                        <th scope="col">#</th>
                        <th scope="col">Change</th>
                        <th scope="col">&#37;</th>
                    </tr>
                </thead>
                <tbody>`;

            d._currentState.summary.forEach(function (ent) {
                if (ent.value.count > 0) {
                    _html += `
                    <tr>
                        <th scope="row"> ${ent.key} </th>
                        <td> ${ent.value.count} </td>
                        <td>` + _formatProteinChange(ent.value.byY) + `</td>
                        <td>` + d3.format(".1f")(ent.value.count / d._currentState.count * 100) + `&#37;</td>
                    </tr>`;
                }
            });

            _html += `
                </tbody>
            </table></div>`;
        } else {
            _html += `
            <table class="pure-table pure-table-bordered">
                <caption> Position ${d.position} </caption>
                <thead>
                    <tr>
                        <th scope="col">Change</th>
                        <th scope="col">&#37;</th>
                    </tr>
                </thead>
                <tbody>`;

            d._currentState.summary[0].value.byY.forEach(function (ent) {
                _html += `
                    <tr>
                        <th> ${ent.key} </th>
                        <td>` + d3.format(".1f")(ent.value / d._currentState.count * 100) + `&#37;</td>
                    </tr>`;
            });
            _html += `
                </tbody>
            </table>`;
        }

        return _html;
    };

    var _formatProteinChange = function (arr) {
        var info = "";
        arr.forEach(function (e) {
            info += `${e.key} (n=${e.value})<br>`;
        });
        return info;
    };

    var _popMouseOver = function (d, target) {
        if (options.tooltip) {
            _popTooltip.show(d, target);
        }
    };

    var _popMouseOut = function (d) {
        if (options.tooltip) {
            _popTooltip.hide(d);
        }
    };

    var _getDataDominant = function (d) {
        let _snv, _color, _cur_max = -1, _class;
        d._currentState.summary.forEach(function (_c) {
            if (_c.value.count > 0 && _c.value.count > _cur_max) {
                _snv = _c.value.byY[0].key;
                _class = _c;
                _color = lollipopOpt.popColorScheme(_c.key);
                _cur_max = _c.value.count;
            }
        });

        return { "class": _class, "entry": _snv, "count": _cur_max, "color": _color };
    };

    var _popClick = function (d, parentG) {
        // show the most representative node
        if (d._currentState.showLabel) {
            // hide label
            d._currentState.showLabel = false;
            let _label = parentG.select("." + lollipopOpt.popClassName.label);

            _updateYBahavior(_label.attr("yMaxValue"), Remove);

            // text rotation
            _label.transition().duration(options.transitionTime).attr("transform", "rotate(0)").remove();
        } else {
            d._currentState.showLabel = true;

            // (1) pick the lastest mutation class
            // (2) pick the the most representative snvs in this class
            let _dominant = _getDataDominant(d);

            // get text length
            let _fontSize = Math.max(d._currentState.radius * lollipopOpt.popLabel.fontsizeToRadius, lollipopOpt.popLabel.minFontSize) + "px";
            let _font = lollipopOpt.popLabel["font-weight"] + " " + _fontSize + " " + lollipopOpt.popLabel["font-family"];
            // text length in dimention
            let _txtLen = getTextWidth(_dominant.entry, _font);

            // note: y axis 0 is at top-left cornor
            let _txtH = d._currentState.radius + lollipopOpt.popLabel.padding + _txtLen;
            let _txtY = (_yRange[1] - _yRange[0]) * (_txtH / _mainH);
            let _txtYMax = d._currentState.count + _txtY;

            _updateYBahavior(_txtYMax, Add);

            var txtHolder = parentG
                .append("text")
                .classed(lollipopOpt.popClassName.label, true)
                .attr("x", - d._currentState.radius - lollipopOpt.popLabel.padding)
                .attr("y", 0)
                .attr("yMaxValue", _txtYMax)
                .text(_dominant.entry)
                .style("fill", _dominant.color)
                .style("font", _font)
                .attr("dy", ".35em")
                .attr("text-anchor", "end");

            // text rotation
            txtHolder.transition().duration(options.transitionTime).attr("transform", "rotate(90)");
        }
    };

    var _addLollipopLegend = function () {
        // register legend
        if (!options.legend) return;

        _lollipopLegend = new legend(target);

        if ((Object.keys(options.legendOpt.margin)).length == 0) {
            options.legendOpt.margin = {
                left: options.margin.left,
                right: options.margin.right,
                top: 2,
                bottom: 2,
            };
        }

        _lollipopLegend.margin = options.legendOpt.margin;
        _lollipopLegend.interactive = options.legendOpt.interactive;
        _lollipopLegend.title = (options.legendOpt.title === Undefined) ? snvDataOpt.factor : options.legendOpt.title;

        for (let _d in _currentStates) {
            _lollipopLegend.addSeries({
                "key": _d,
                "value": {
                    fill: lollipopOpt.popColorScheme(_d),
                    label: _d + " (" + _currentStates[_d] + ")",
                }
            });
        }

        _lollipopLegend.dispatch.on("legendClick", function (key, selected) {
            !selected ? delete _currentStates[key] : _currentStates[key] = selected;

            _prepareData();
            // calculate y range based on the current yValues
            _calcYRange();

            // update (1) y axis (2) lollipop lines (3) pop group
            _updateY();

            _pops.each(_updatePop);
        });

        _lollipopLegend.draw();
    };

    var _pieFun = function () {
        return d3.pie().sort(null);
    }

    var _pieTransition = function (d, popGroup, popR) {
        let _arc = d3.arc().innerRadius(0).outerRadius(popR);
        let _pie = _pieFun().value(function (_d) { return _d.value.count; });

        let _pieSlice = popGroup.select("." + lollipopOpt.popClassName.pie)
            .selectAll("path." + lollipopOpt.popClassName.slice)
            .data(_pie(d._currentState.summary));

        _pieSlice.enter().insert("path");

        _pieSlice.transition().duration(options.transitionTime)
            .attrTween("d", function (_d) {
                this._current = this._current || _d;
                let _interpolate = d3.interpolate(this._current, _d);
                this._current = _interpolate(0);

                return function (t) {
                    return _arc(_interpolate(t));
                }
            });

        _pieSlice.exit().remove();
    };

    var _circleTransition = function (d, popGroup, popR) {
        let _circle = popGroup.select("." + lollipopOpt.popClassName.circle);
        let _dominant = _getDataDominant(d);
        let _fill = _dominant.color || "transparent";

        _circle.transition().duration(options.transitionTime)
            .attr("r", popR).attr("fill", _fill);
    };

    var _updatePop = function (d) {
        let _popGroup = d3.select(this);

        // remove label
        if (d._currentState.showLabel) {
            _popGroup.select("." + lollipopOpt.popClassName.label).remove();
            d._currentState.showLabel = false;
        }

        // update pop
        let _popR = d._currentState.radius = _getPopR(d);

        switch (chartType) {
            case "pie":
                _pieTransition(d, _popGroup, _popR);
                break;
            default:
                _circleTransition(d, _popGroup, _popR);
        }

        let _popText = _popGroup.select("." + lollipopOpt.popClassName.text);
        // add text if large enough
        if (_popR >= lollipopOpt.popParams.addNumRCutoff) {
            let _popTextFontSize = _calcPopTextFontSize(_popR, d._currentState.count, lollipopOpt.popText["font-weight"],
                lollipopOpt.popText["font-family"]);
            let _popTextFont = lollipopOpt.popText["font-weight"] + " " + _popTextFontSize + " " + lollipopOpt.popText["font-family"];

            _popText.transition().duration(options.transitionTime)
                .text(d._currentState.count)
                .style("font", _popTextFont);
        } else {
            _popText.text("");
        }
    };

    var _calcPopTextFontSize = function (r, number, fontWeight, fontFamily) {
        let _w = r * 1.75;
        for (let _f = Math.ceil(_w); _f >= 0; _f--) {
            let _textwidth = getTextWidth(number, fontWeight + " " + _f + "px " + fontFamily);
            if (_textwidth <= _w) {
                return _f + "px";
            }
        }
        return 0;
    };

    var _getPopGroupId = function (idx) {
        return Prefix + "-" + uniqueID + "-lollipop-group-" + idx;
    };

    var _drawPie = function (d) {
        let _chartG = d3.select(this);

        let _popR = d._currentState.radius = _getPopR(d);

        // add popCircle
        _chartG.append("circle")
            .attr("class", lollipopOpt.popClassName.circle)
            .attr("cx", 0).attr("cy", 0)
            .attr("r", _popR)
            .attr("stroke", lollipopOpt.popCircle.stroke)
            .attr("stroke-width", lollipopOpt.popCircle["stroke-width"])
            .attr("fill", "none");

        // add pie (no change on axis change)
        let _arc = d3.arc().innerRadius(0).outerRadius(_popR);
        let _pie = _pieFun().value(function (_d) { return _d.value.count; });

        // pie arc
        let _pieSlice = _chartG.append("g").attr("class", lollipopOpt.popClassName.pie);

        // add pie arcs
        _pieSlice.selectAll(lollipopOpt.popClassName.slice)
            .data(_pie(d._currentState.summary))
            .enter().append("path")
            .attr("d", _arc)
            .attr("class", lollipopOpt.popClassName.slice)
            .attr("fill", function (d) {
                return lollipopOpt.popColorScheme(d.data.key);
            });

        _pieSlice.exit().remove();

        // add text if large enough
        let _popText = _chartG.append("text")
            .attr("class", lollipopOpt.popClassName.text)
            .attr("fill", lollipopOpt.popText.fill)
            .style("font-family", lollipopOpt.popText["font-family"])
            .style("font-weight", lollipopOpt.popText["font-weight"])
            .attr("text-anchor", lollipopOpt.popText["text-anchor"])
            .attr("dy", lollipopOpt.popText.dy);

        if (_popR >= lollipopOpt.popParams.addNumRCutoff) {
            let _popTextFontSize = _calcPopTextFontSize(_popR,
                d._currentState.count, lollipopOpt.popText["font-weight"],
                lollipopOpt.popText["font-family"]);
            _popText.transition().duration(options.transitionTime)
                .text(d._currentState.count)
                .style("font-size", _popTextFontSize);
        } else {
            _popText.text("");
        }

        _chartG.on("mouseover", function (d) { _popMouseOver(d); })
            .on("mouseout", function (d) { _popMouseOut(d); })
            .on("click", function (d) { _popClick(d, _chartG); });
    };

    var _drawCircle = function (d) {
        let _chartG = d3.select(this);

        let _popR = d._currentState.radius = _getPopR(d);

        // circle
        let _dominant = _getDataDominant(d);
        // circle
        _chartG.append("circle")
            .attr("class", lollipopOpt.popClassName.circle)
            .attr("cx", 0).attr("cy", 0)
            .attr("r", _popR)
            .attr("stroke", lollipopOpt.popCircle.stroke)
            .attr("stroke-width", lollipopOpt.popCircle["stroke-width"])
            .attr("fill", _dominant.color);

        // add text if large enough
        let _popText = _chartG.append("text")
            .attr("class", lollipopOpt.popClassName.text)
            .style("font-family", lollipopOpt.popText["font-family"])
            .style("font-weight", lollipopOpt.popText["font-weight"])
            .attr("text-anchor", lollipopOpt.popText["text-anchor"])
            .attr("dy", lollipopOpt.popText.dy);

        if (_popR >= lollipopOpt.popParams.addNumRCutoff) {
            let _popTextFontSize = _calcPopTextFontSize(_popR,
                d._currentState.count, lollipopOpt.popText["font-weight"],
                lollipopOpt.popText["font-family"]);
            _popText.transition().duration(options.transitionTime)
                .text(d._currentState.count)
                .attr("font-size", _popTextFontSize);
        } else {
            _popText.text("");
        }

        _chartG.on("mouseover", function (d) { _popMouseOver(d); })
            .on("mouseout", function (d) { _popMouseOut(d); })
            .on("click", function (d) { _popClick(d, _chartG); });
    };

    var _drawLollipops = function () {
        // lollipop groups
        _lollipops = _mainViz.append("g")
            .attr("class", lollipopOpt.lollipopClassName.group);

        // draw popline first
        _popLines = _lollipops.append("g")
            .attr("clip-path", "url(#" + lollipopOpt.defsId + ")")
            .selectAll(lollipopOpt.lollipopClassName.line)
            .data(snvData).enter()
            .append("line")
            .attr("x1", function (d) { return _getPopX(d); })
            .attr("x2", function (d) { return _getPopX(d); })
            .attr("y1", _yScale(0) + domainOpt.margin.top)
            .attr("y2", function (d) { return _getPopY(d); })
            .attr("class", lollipopOpt.lollipopClassName.line)
            .attr("stroke", lollipopOpt.lollipopLine.stroke)
            .attr("stroke-width", lollipopOpt.lollipopLine["stroke-width"]);

        // then draw pops
        _pops = _lollipops.append("g")
            .attr("clip-path", "url(#" + lollipopOpt.defsId + ")")
            .selectAll(lollipopOpt.lollipopClassName.pop)
            .data(snvData).enter()
            .append("g")
            .attr("transform", function (d) { return "translate(" + _getPopX(d) + "," + _getPopY(d) + ")"; })
            .classed(lollipopOpt.lollipopClassName.pop, true)
            .attr("id", function (d, i) { return _getPopGroupId(i); });

        switch (chartType) {
            case "pie":
                _pops.each(_drawPie);
                break;
            default:
                _pops.each(_drawCircle);
        }
        // add title
        let _anchor, _xPos, _yPos;
        if (lollipopOpt.title.text.length > 0) {
            if (lollipopOpt.title.alignment == "start") {
                _anchor = "start"; _xPos = 0;
            } else if (lollipopOpt.title.alignment == "middle") {
                _anchor = "middle"; _xPos = _mainW / 2;
            } else {
                _anchor = "end"; _xPos = _mainW;
            }

            _yPos = -options.margin.top / 2;

            _mainViz.append("text")
                .attr("id", lollipopOpt.title.id)
                .style("font", lollipopOpt.title.font)
                .attr("fill", lollipopOpt.title.color)
                .attr("text-anchor", _anchor)
                .attr("alignment-base", "alphabetic")
                .attr("transform", "translate(" + _xPos + "," + _yPos + ")")
                .attr("dy", lollipopOpt.title.dy)
                .text(lollipopOpt.title.text);
        }
    };

    var _mainVizZoomed = function () {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;

        let _t = d3.event.transform;
        _xRange = _t.rescaleX(_xScaleOrig).domain();

        if (domainOpt.brush) {
            _domainViz.select("." + domainOpt.className.brush)
                .call(_domainBrush.move, _xScaleOrig.range().map(_t.invertX, _t));
        }
        _updateX();
    };

    var _calcOptions = function () {
        // viz height
        _svgH = lollipopOpt.height + domainOpt.height;
        _svgW = width;
        _mainH = lollipopOpt.height - options.margin.top - options.margin.bottom;
        _mainW = _svgW - options.margin.left - options.margin.right;
        _domainH = domainOpt.height - domainOpt.margin.top - domainOpt.margin.bottom;
        _domainW = _mainW;
    };

    var _prepareData = function () {
        if (!snvDataOpt.hasOwnProperty('x') || !snvDataOpt.hasOwnProperty('y')) {
            throw "No X or Y columns specified in data set";
        }
        // for the first time, summarize mutation factors and counts
        if (!_snvInit) {
            // => factor (or undefined): count
            _currentStates = d3.nest()
                .key(d => d[snvDataOpt.factor])
                .rollup(function (d) { return +d.length; })
                .object(snvData);

            // group by postion, sort
            snvData = d3.nest()
                .key(d => +d[snvDataOpt.x])
                .entries(snvData)
                .sort((a, b) => a.key - b.key);

            // position and total
            snvData.forEach(function (d) {
                d["position"] = +d["key"]; delete d["key"];
                d["total"] = +d.values.length;
            });
        }

        // parse each position
        // use _currentState to record the current information for current
        snvData.forEach(function (d) {
            // group by factor, group by y, sort
            //let _d = d.values.filter(function (d) { return d[snvOpt.factor] in _currentStates; });
            let _factorSummary = d3.nest()
                .key(function (_) { return _[snvDataOpt.factor]; })
                .rollup(function (_) {
                    let _d = _.filter(function (_) { return _[snvDataOpt.factor] in _currentStates; });
                    return {
                        count: +_d.length,
                        byY: d3.nest().key(function (_) { return _[snvDataOpt.y]; })
                            .rollup(function (_) { return +_.length; })
                            .entries(_d).sort(function (a, b) { return b.value - a.value; }),
                    };
                }).entries(d.values)
                .sort(function (a, b) { return a.key > b.key; });
            //.sort(function (a, b) { return b.value.count - a.value.count; });

            if (!_snvInit) {
                d._currentState = {};
                d._currentState.showLabel = false;
            }
            d._currentState.count = d3.sum(_factorSummary.map(function (_) { return _.value.count; }));
            d._currentState.summary = _factorSummary;
        });

        _snvInit = true;

        // calculate counts
        _yValues = snvData
            .map(function (_) { return +_._currentState.count; })
            .filter(function (_) { return _ > 0; })
            .sort(function (a, b) { return a - b; });

        // calculate pop size boundary
        _popYLower = Math.ceil(d3.quantile(_yValues, lollipopOpt.popParams.yLowerQuantile));
        _popYUpper = Math.floor(d3.quantile(_yValues, lollipopOpt.popParams.yUpperQuantile));

        _yUpperValueArray = [];
    };

    var _getYMaxAfterNice = function (yMax) {
        return d3.scaleLinear().domain([0, yMax]).range([_mainH, 0]).nice().domain()[1];
    };

    var _calcYRange = function () {
        if (_yValues.length == 0) {
            _yRange = [0, 1];
        } else {
            _yRange = d3.extent(_yValues);
        }
        // get yRange
        _yValueMax = _yRange[1] = _getYMaxAfterNice(_yRange[1] * lollipopOpt.yPaddingRatio);
    };

    var _calcAxis = function () {
        // y
        _calcYRange();
        _yScale = d3.scaleLinear().domain(_yRange).range([_mainH, 0]);
        _yAxis = d3.axisLeft(_yScale).tickSize(-_mainW).ticks(9);

        // x
        _xRange = [0, domainData["length"]];
        _xScale = d3.scaleLinear().domain(_xRange).range([0, _domainW]);
        _xScaleOrig = d3.scaleLinear().domain(_xRange).range([0, _domainW]);
        _xTicks = _appendValueToDomain(_xScale.ticks(), domainData["length"], "aa");
        _xAxis = d3.axisBottom(_xScale).tickValues(_xTicks)
            .tickFormat(function (_) { return this.parentNode.nextSibling ? _ : _ + " aa"; });
    };

    var _updateYBahavior = function (yValue, behavior) {
        // check behavior
        behavior = behavior || Add; // default is to add
        if (behavior != Add && behavior != Remove) behavior = Add;

        // calculate new yMax
        yValue = _getYMaxAfterNice(yValue * lollipopOpt.yPaddingRatio);
        yValue = Math.max(_yValueMax, yValue);

        // yValue > yValueMax
        if (behavior === Add) {
            _yUpperValueArray.push(yValue);
            _yUpperValueArray = _yUpperValueArray.sort();
        } else {
            let _idx = _yUpperValueArray.indexOf(yValue);
            if (_idx != -1) {
                _yUpperValueArray = _yUpperValueArray.slice(0, _idx).concat(_yUpperValueArray.slice(_idx + 1));
            }
        }

        // if need to
        let _yMax = (_yUpperValueArray.length == 0) ? _yValueMax : _yUpperValueArray[_yUpperValueArray.length - 1];

        if (_yMax != _yRange[1]) {
            _yRange[1] = _yMax;
            _updateY();
        }
    };

    var _updateY = function () {
        _yScale.domain(_yRange);
        _domYAxis.transition().duration(options.transitionTime).call(_yReAxis);

        // update lines of lollipops
        _popLines.transition().duration(options.transitionTime).attr("y2", function (d) { return _getPopY(d); });

        // update pop group
        _pops.transition().duration(options.transitionTime).attr("transform", function (d) {
            return "translate(" + _getPopX(d) + "," + _getPopY(d) + ")";
        });
    };

    var _yReAxis = function (g) {
        var s = g.selection ? g.selection() : g;
        g.call(_yAxis);

        s.select(".domain").remove();
        s.selectAll(".tick line").filter(Number).attr("stroke", "#aaa").attr("stroke-dasharray", "2,2");
        s.selectAll(".tick text").attr("x", -2).attr("dy", 2);
        if (s !== g) g.selectAll(".tick text").attrTween("x", null).attrTween("dy", null);
    };

    var _drawAxis = function () {
        //yRange[1] *= _lollipopOpt.yRatio;
        _calcAxis();

        _domYAxis = _mainViz.append("g").attr("class", "axis axis--y").call(_yReAxis);

        // y label text
        let _anchor, _yPos;
        if (lollipopOpt.axisLabel.alignment == "start") {
            _anchor = "end"; _yPos = 0;
        } else if (lollipopOpt.axisLabel.alignment == "middle") {
            _anchor = "middle"; _yPos = _mainH / 2;
        } else {
            _anchor = "start"; _yPos = _mainH;
        }

        _mainViz.append("text")
            .attr("class", "yaxis axis-label")
            .attr("transform", "translate(0," + _yPos + ")rotate(-90)")
            .style("font", lollipopOpt.axisLabel.font)
            .attr("fill", lollipopOpt.axisLabel.fill)
            .attr("text-anchor", _anchor)
            .attr("alignment-base", "middle")
            .attr("dy", lollipopOpt.axisLabel.dy)
            .text(lollipopOpt.ylab.text);

        // add x axis
        _domXAxis = _mainViz.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0, " + (_mainH + domainOpt.height) + ")")
            .call(_xAxis);
    };

    var _addBackground = function (g, bgColor, height, width) {
        var bgLayer = g.append("g").attr("id", "background-layer");
        bgLayer.append("rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", width).attr("height", height)
            .attr("fill", bgColor);
    };

    var _initMainViz = function () {
        _addBackground(_mainViz, lollipopOpt.background, _mainH, _mainW);
    };

    var _initDomainViz = function () {
        _addBackground(_domainViz, domainOpt.background, _domainH, _domainW);
    };

    var _initTooltip = function () {
        if (options.tooltip) {
            _popTooltip = tooltip().attr("class", "d3-tip").offset([8, 0])
                .direction(
                    function (d) {
                        if (d.count > _yRange[1] / 2) return "s";
                        else return "n";
                    })
                .offset(function (d) {
                    if (d.count > _yRange[1] / 2) return [16, 0];
                    else return [-12, 0];
                })
                .html(_popDetailHtml);

            _mainViz.call(_popTooltip);
        }
    };

    var _initViz = function () {
        _svg = d3.select(target).attr("width", _svgW).attr("height", _svgH)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

        _svg.classed(options.className, true)
            .style("background-color", options.background || "transparent");

        // viz region
        _viz = _svg.append("g")
            .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")")
            .attr("id", options.chartID);

        // lollipop viz
        _mainViz = _viz.append("g").attr("id", lollipopOpt.id);
        _initMainViz();

        // annotation viz
        _domainViz = _viz.append("g").attr("id", domainOpt.id)
            .attr("transform", "translate(0, " + (_mainH + domainOpt.margin.top) + ")");
        _initDomainViz();

        // tooltips and menu
        _initTooltip();
    };

    var _initBrush = function () {
        _domainViz.select(".domain-x-brush").call(_domainBrush.move, [0, _domainW]);
    };

    var _addDefs = function () {
        // defs
        _mainViz.append("defs").append("clipPath")
            .attr("id", lollipopOpt.defsId)
            .append("rect")
            .attr("width", _mainW)
            .attr("height", _mainH + domainOpt.margin.top);
        // defs
        _domainViz.append("defs").append("clipPath")
            .attr("id", domainOpt.defsId)
            .append("rect")
            .attr("width", _domainW)
            .attr("height", _domainH);
    };

    // =====================
    // public functions
    // =====================
    var lollipop = {
    };

    // getter and setter, e.g., lollipop.options.width; lollipop.options.snvData = [];
    lollipop.options = {
        // set target svg node
        set target(_) { target = _; }, get target() { return target; },
        // set chart width
        set width(_) { width = _; }, get width() { return width; },
        // set chart type (pie or circle)
        set chartType(_) { if (_ && _ in ChartTypes) chartType = _; }, get chartType() { return chartType; },
        // get chart ID
        get chartID() { return options.chartID },

        // chart margin (top / bottom / left / right)
        set margin(_) { options.margin = _; }, get margin() { return options.margin; },
        // chart background
        set background(_) { options.background = _; }, get background() { return options.background; },

        // chart animation transition time (ms)
        set transitionTime(_) { options.transitionTime = _; }, get transitionTime() { return options.transitionTime; },

        set tooltip(_) { options.tooltip = _; }, get tooltip() { return options.tooltip; },

        // ylabel text
        set ylab(_) { lollipopOpt.ylab.text = _; }, get ylab() { return lollipopOpt.ylab.text; },

        // axis settings (label font / color / alignment / y-adjustment)
        set axisLabelFont(_) { lollipopOpt.axisLabel.font = _; }, get axisLabelFont() { return lollipopOpt.axisLabel.font; },
        set axisLabelColor(_) { lollipopOpt.axisLabel.fill = _; }, get axisLabelColor() { return lollipopOpt.axisLabel.fill; },
        set axisLabelAlignment(_) { lollipopOpt.axisLabel.alignment = _; }, get axisLabelAlignment() { return lollipopOpt.axisLabel.alignment; },
        set axisLabelDy(_) { lollipopOpt.axisLabel.dy = _; }, get axisLabelDy() { return lollipopOpt.axisLabel.dy; },

        // legend settings (show legend or not / legend margin / interactive legend or not)
        set showLegend(_) { options.legend = _; }, get showLegend() { return options.legend; },
        set legendMargin(_) { options.legendOpt.margin = _; }, get legendMargin() { return options.legendOpt.margin; },
        set legendInteractive(_) { options.legendOpt.interactive = _; }, get legendInteractive() { return options.legendOpt.interactive; },
        set legendTitle(_) { options.legendOpt.title = _; }, get legendTitle() { return options.legendOpt.title; },

        // get lollipopTrack ID
        get lollipopTrackID() { return lollipopOpt.id; },

        // lollipop track height and background
        set lollipopTrackHeight(_) { lollipopOpt.height = _; }, get lollipopTrackHeight() { return lollipopOpt.height; },
        set lollipopTrackBackground(_) { lollipopOpt.background = _; }, get lollipopTrackBackground() { return lollipopOpt.background; },

        // pop circle size (min / max)
        set lollipopPopMinSize(_) { lollipopOpt.popParams.rMin = _; }, get lollipopPopMinSize() { return lollipopOpt.popParams.rMin; },
        set lollipopPopMaxSize(_) { lollipopOpt.popParams.rMax = _; }, get lollipopPopMaxSize() { return lollipopOpt.popParams.rMax; },
        // pop cicle text (radius cutoff to show info, info text color)
        set lollipopPopInfoLimit(_) { lollipopOpt.popParams.addNumRCutoff = _; }, get lollipopPopInfoLimit() { return lollipopOpt.popParams.addNumRCutoff; },
        set lollipopPopInfoColor(_) { lollipopOpt.popText.fill = _; }, get lollipopPopInfoColor() { return lollipopOpt.popText.fill; },

        // lollipop line (color / width)
        set lollipopLineColor(_) { lollipopOpt.lollipopLine.stroke = _; }, get lollipopLineColor() { return lollipopOpt.lollipopLine.stroke; },
        set lollipopLineWidth(_) { lollipopOpt.lollipopLine["stroke-width"] = _; }, get lollipopLineWidth() { return lollipopOpt.lollipopLine["stroke-width"]; },

        // lollipop circle (color / width)
        set lollipopCircleColor(_) { lollipopOpt.popCircle.stroke = _; }, get lollipopCircleColor() { return lollipopOpt.popCircle.stroke; },
        set lollipopCircleWidth(_) { lollipopOpt.popCircle["stroke-width"] = _; }, get lollipopCircleWidth() { return lollipopOpt.popCircle["stroke-width"]; },

        // pop click label (font size ratio to pop size / minimal font size)
        set lollipopLabelRatio(_) { lollipopOpt.popLabel.fontsizeToRadius = _; }, get lollipopLabelRatio() { return lollipopOpt.popLabel.fontsizeToRadius; },
        set lollipopLabelMinFontSize(_) { lollipopOpt.popLabel.minFontSize = _; }, get lollipopLabelMinFontSize() { return lollipopOpt.popLabel.minFontSize; },

        // pop color scheme
        set lollipopColorScheme(_) { lollipopOpt.popColorScheme = _; }, get lollipopColorScheme() { return lollipopOpt.popColorScheme; },

        // title related settings (text / font / color / alignment / y-adjustment)
        // note : font (font-style font-variant font-weight font-size/line-height font-family)
        // i.e., italic small-caps normal 13px sans-serif
        set titleText(_) { lollipopOpt.title.text = _; }, get titleText() { return lollipopOpt.title.text; },
        set titleFont(_) { lollipopOpt.title.font = _; }, get titleFont() { return lollipopOpt.title.font; },
        set titleColor(_) { lollipopOpt.title.color = _; }, get titleColor() { return lollipopOpt.title.color; },
        set titleAlignment(_) { lollipopOpt.title.alignment = _; }, get titleAlignment() { return lollipopOpt.title.alignment; },
        set titleDy(_) { lollipopOpt.title.dy = _; }, get titleY() { return lollipopOpt.title.dy; },

        get annoID() { return domainOpt.id },

        set annoHeight(_) { domainOpt.height = _; }, get annoHeight() { return domainOpt.height; },
        set annoMargin(_) { domainOpt.margin = _; }, get annoMargin() { return domainOpt.margin; },
        set annoBackground(_) { domainOpt.background = _; }, get annoBackground() { return domainOpt.background; },

        set annoBarFill(_) { domainOpt.bar.background = _; }, get annoBarFill() { return domainOpt.bar.background; },
        set annoBarMargin(_) { domainOpt.bar.margin = _; }, get annoBarMargin() { return domainOpt.bar.margin; },

        set domainColorScheme(_) { domainOpt.domain.colorScheme = _; }, get domainColorScheme() { return domainOpt.domain.colorScheme; },
        set domainMargin(_) { domainOpt.domain.margin = _; }, get domainMargin() { return domainOpt.domain.margin; },
        set domainTextFont(_) { domainOpt.domain.label.font = _; }, get domainTextFont() { return domainOpt.domain.label.font; },
        set domainTextColor(_) { domainOpt.domain.label.color = _; }, get domainTextColor() { return domainOpt.domain.label.color; },

        set brush(_) { domainOpt.brush = _; }, get brush() { return domainOpt.brush; },
        set zoom(_) { domainOpt.zoom = _; }, get zoom() { return domainOpt.zoom; },
    };

    lollipop.setOptions = function (options) {
        for (let _key in options) {
            this.options[_key] = options[_key];
        }
    };

    lollipop.getOptions = function (options) {
        let _options = {};
        let self = this;
        options.forEach(function (opt) {
            if (self.options[opt]) {
                _options[opt] = self.options[opt];
            }
        });
        return _options;
    };

    lollipop.destroy = function () {
        _svg = d3.select(target);
        _svg.attr("width", null).attr("height", null)
            .attr("xmlns", null).attr("xmlns:xlink", null)
            .classed(options.className, false)
            .style("background-color", null);
        _svg.selectAll("*").remove();

        if (options.tooltip && _chartInit) {
            _popTooltip.destroy();
        }
    }

    lollipop.refresh = function () {
        this.destroy();
        this.draw(snvDataOpt, domainDataOpt);
    };

    lollipop.data = {
        set snvData(_) { snvData = _; }, get snvData() { return snvData; },
        set domainData(_) { domainData = _; }, get domainData() { return domainData; },
    };

    lollipop.draw = function (snvOption, domainOption) {
        snvDataOpt = snvOption || SnvDataDefaultOpt;
        domainDataOpt = domainOption || DomainDataDefaultOpt;

        if (snvDataOpt.hasOwnProperty('factor')) {
            _byFactor = true;
        } else {
            _byFactor = false;
            snvDataOpt.factor = Undefined;
            snvData.forEach(function (d) { d[snvDataOpt.factor] = Undefined; });
        }

        _calcOptions();

        // prepare data
        _prepareData();

        // initalize viz
        _initViz();

        // calculate range, Axis
        _drawAxis();

        // add defs
        _addDefs();

        // add domain panel
        _drawDomain();

        // add lollipops
        _drawLollipops();
        if (options.legend) {
            _addLollipopLegend();
        }

        if (domainOpt.brush) {
            _initBrush();
        }

        _chartInit = true;
    };

    return lollipop;
}
