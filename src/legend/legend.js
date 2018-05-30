import d3 from "d3";
import { getTextWidth } from "../utils/utils";;

export default function (target, title, series) {
    const Enabled = "enabled", Disabled = "disabled";

    // use setter and getter to control these variables
    // so that "this" keyword can be ignored in legend object
    var interactive = true,
        margin = { left: 10, right: 0, top: 5, bottom: 5, },
        dispatch = d3.dispatch(
            'legendClick',
            'legendDblclick',
            'legendMouseover',
            'legendMouseout');

    target = target || "svg";
    title = title || false;
    series = series || [];

    var height = 0;

    var labelFont = "normal 12px sans-serif", labelColor = "black",
        titleFont = "bold 12px sans-serif", titleColor = "black";

    var legend = {
        set target(_) { target = _; }, get target() { return target; },
        set title(_) { title = _; }, get title() { return title; },
        set series(_) { series = _; }, get series() { return series; },
        set margin(_) { margin = _; }, get margin() { return margin; },
        set dispatch(_) { dispatch = _; }, get dispatch() { return dispatch; },
        set interactive(_) { interactive = _; }, get interactive() { return interactive; },
        set labelFont(_) { labelFont = _; }, get labelFont() { return labelFont; },
        set labelColor(_) { labelColor = _; }, get labelColor() { return labelColor; },
        set titleFont(_) { titleFont = _; }, get titleFont() { return titleFont; },
        set titleColor(_) { titleColor = _; }, get titleColor() { return titleColor; },
        get height() { return height; },
        addSeries: function (datum) {
            // key : legend name
            // value: legend related information
            // (text: label, fill: color, class: class_name controlled)
            if (!(datum.key in Object.keys(series))) {
                series.push(datum);
            }
        },
        getLegendStatus: function () {
            return series.map(function (d) {
                return {
                    key: d.key,
                    status: d._status || true
                };
            });
        },
        destroy: function () {
            d3.select(".g3-legend").selectAll("*").remove();
        },
        draw: function () {
            series.forEach(d => d._status = true);
            //let _counter = series.length;

            let _svg = d3.select(target),
                _width = +_svg.attr("width"),
                _height = +_svg.attr("height"),
                _totalW = _width - (margin.left || 0) - (margin.right || 0),
                _wrap = _svg.append("g").attr("class", "g3-legend")
                    .attr("transform", "translate(" + margin.left + "," + (_height + margin.top) + ")"),
                _lineHeight = 16;

            let _titleLen = (title) ? getTextWidth(title, titleFont) : 0;

            let _radioLeft = 12, _radioRight = 5, _radioRadius = 3,
                _radioStrokeWidth = 1, _radioStroke = "grey";

            let _titleInterval = 6,
                _titleWidth = Math.min(_titleLen + _titleInterval, 1 / 3 * _totalW),
                _availableW = _totalW - _titleWidth,
                _radioW = _radioLeft + _radioRight + 2 * _radioRadius;

            let _curPos = { x: 0, y: _lineHeight / 2, },
                _nextPos = { x: 0, y: _lineHeight / 2, };

            // add title
            if (title) {
                _wrap.append("g").attr("class", "g3-legend-title")
                    .append("text")
                    .attr("x", _titleWidth - _titleInterval).attr("y", _lineHeight / 2)
                    .attr("text-anchor", "end")
                    .attr("fill", titleColor)
                    .style("font", titleFont)
                    .attr("dy", "0.35em")
                    .text(title);
            }

            var _updatePosition = function (width) {
                // if longer than availabelW
                width += _radioW;
                if (width > _availableW - _nextPos.x) {
                    // new line
                    _curPos.x = 0, _curPos.y = _nextPos.y + _lineHeight;
                    _nextPos.x = width, _nextPos.y = _curPos.y;
                } else {
                    // same line
                    _curPos.x = _nextPos.x;
                    _nextPos.x += width;
                }
            };

            var _toggleState = function (g) {
                var _color = g.attr("defaultColor");
                var _c = g.select("circle"), _t = g.select("text");

                if (g.attr("state") == Enabled) {
                    g.attr("state", Disabled);

                    _c.attr("fill", "transparent")
                        .attr("stroke", _color);
                    _t.style("opacity", 0.5);
                } else {
                    g.attr("state", Enabled);

                    _c.attr("fill", _color)
                        .attr("stroke", _radioStroke);
                    _t.style("opacity", 1);
                }
            };

            var _legends = _wrap.append("g")
                .attr("class", "g3-legend-item-container")
                .attr("transform", "translate(" + _titleWidth + ", 0)");

            var _addOneLegend = function (d) {
                let _g = d3.select(this);
                let _text = d.value.label || d.key;
                _updatePosition(getTextWidth(_text, labelFont));

                let _x = _curPos.x + _radioLeft + _radioRadius, _y = _curPos.y;

                // add legend circle
                _g.attr("state", Enabled)
                    .attr("defaultColor", d.value.fill);

                _g.append("circle")
                    .attr("cx", _x).attr("cy", _y)
                    .attr("r", _radioRadius)
                    .attr("fill", d.value.fill || "transparent")
                    .attr("stroke-width", _radioStrokeWidth)
                    .attr("stroke", _radioStroke);

                _x += (_radioRadius + _radioRight);

                // add text
                _g.append("text")
                    .attr("x", _x).attr("y", _y)
                    .attr("text-anchor", "start")
                    .attr("fill", labelColor)
                    .style("font", labelFont)
                    .attr("dy", "0.35em")
                    .text(_text);

                _g.on("click", function () {
                    if (interactive) {
                        _toggleState(_g);
                        dispatch.call("legendClick", this, d.key, _g.attr("state") == Enabled);
                        d._status = (_g.attr("state") == Enabled);
                    }
                });
            };

            _legends.selectAll(".g3-legend-item")
                .data(series).enter()
                .append("g").attr("class", "g3 g3-legend-item")
                .style("cursor", interactive ? "pointer" : "default")
                .each(_addOneLegend);

            height = margin.top + _curPos.y + _lineHeight / 2 + margin.bottom;
            +_svg.attr("height", height + _height);
        },
    }

    return legend;
}