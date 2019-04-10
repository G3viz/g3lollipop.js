# <a name="top"></a>g3-lollipop.js: Interactively visualize genetic mutations using a lollipop-diagram

**Date: 2019-04-06 (version 0.5.0)**

### Table of Contents
* [1. Introduction](#1-introduction)
* [2. Install](#2-install)
* [3. Usage](#3-usage)
    * [3.1 Genetic mutation data](#31-genetic-mutation-data)
    * [3.2 Protein domain information](#32-protein-domain-information)
    * [3.3 Generate g3-lollipop chart](#33-generate-g3-lollipop-chart)
    * [3.4 Lollipop chart options](#34-lollipop-chart-options)
    * [3.5 Color schemes](#35-color-palettes)
    * [3.6 Export chart](#36-export-chart)

## 1. Introduction

`g3-lollipop.js` is D3-based JavaScript library which generates interactive lollipop diagram for the given genetic mutation data.  [g3viz](https://github.com/G3viz/g3viz), the *R*-interface of this package, provides more functionality and usability.

* Demos of `g3-lollipop.js`: [[demo1](https://bl.ocks.org/phoeguo/583a12e04c6b9d7ca1825cdbdc62f531)] [[demo2](https://bl.ocks.org/phoeguo/302a0ff5729f6aa773c33d4bfd3061c4)] [[demo3](https://bl.ocks.org/phoeguo/60f804c6683de30650e36ee912304754)]

* Demos for color palettes: [[demo1](https://bl.ocks.org/phoeguo/2868503a074a6441b5ae6d987f150d48)]  [[demo2](https://bl.ocks.org/phoeguo/de79b9ce9bda958173af9891ab7aec93)]  [[dome3](https://bl.ocks.org/phoeguo/81dffe0c7c6c8caae06f6a5f60c70d19)]

* Introduction of `g3viz` *R*-package: [[introduction](https://g3viz.github.io/g3viz/)] [[chart themes](https://g3viz.github.io/g3viz/chart_themes.html)]

<br/>	
<div align="right">	
    <b><a href="#top">↥ back to top</a></b>	
</div>	
<br/>

## 2. Install

```html
<!-- (optional) css  -->
<link rel="stylesheet" href="https://s3-us-west-2.amazonaws.com/cdsjsd3/g3-viz/0.5.0/g3-lollipop.min.css">

<!-- D3 and G3-lollipop libraries -->
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://s3-us-west-2.amazonaws.com/cdsjsd3/g3-viz/0.5.0/g3-lollipop.min.js"></script>
```

<br/>	
<div align="right">	
    <b><a href="#top">↥ back to top</a></b>	
</div>	
<br/>

## 3. Usage

### 3.1 Genetic mutation data

The input genetic mutation data should be an array of [JSON](https://www.json.org/) objects. For example,

```javascript
var mutation_data = [
    {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Silent",
        "HGVSp_Short": "p.F70F",
        "Mutation_Class": "Inframe",
        "AA_Position": 70
    }, {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Missense_Mutation",
        "HGVSp_Short": "p.E81K",
        "Mutation_Class": "Missense",
        "AA_Position": 81
    }, {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Missense_Mutation",
        "HGVSp_Short": "p.E81K",
        "Mutation_Class": "Missense",
        "AA_Position": 81
    }, {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Missense_Mutation",
        "HGVSp_Short": "p.F83S",
        "Mutation_Class": "Missense",
        "AA_Position": 83
    }, {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Missense_Mutation",
        "HGVSp_Short": "p.R88Q",
        "Mutation_Class": "Missense",
        "AA_Position": 88
    }
];
```

In addition, users need to specify data columns for the _x_, _y_, and _factor_ values.  The default settings are

```javascript
var mutation_data_default_settings = {
    x: "AA_Position",         // mutation position
    y: "Protein_Change",      // amino-acid changes
    factor: "Mutation_Class", // classify mutations by certain factor (optional)
};
```

<br/>	
<div align="right">	
    <b><a href="#top">↥ back to top</a></b>	
</div>	
<br/>

### 3.2 Protein domain information

[Pfam](https://pfam.xfam.org/) domains are commonly used for protein structural annotation in genetic mutation lollipop diagrams.

For exmaple,

```javascript
var pfam_data = {  
   "hgnc_symbol":"TP53",
   "protein_name":"tumor protein p53",
   "uniprot_id":"P04637",
   "length":393,
   "pfam":[  
      {  
         "pfam_ac":"PF08563",
         "pfam_start":6,
         "pfam_end":29,
         "pfam_id":"P53_TAD"
      },
      {  
         "pfam_ac":"PF00870",
         "pfam_start":95,
         "pfam_end":288,
         "pfam_id":"P53"
      },
      {  
         "pfam_ac":"PF07710",
         "pfam_start":318,
         "pfam_end":358,
         "pfam_id":"P53_tetramer"
      }
   ]
}
```

Similarly, users need to specify the format settings of Pfam data.  The default settings are

```javascript
var pfam_data_default_settings = {
    domainType: "pfam",       // key to the domain annotation entries
    length: "length",         // protein length
    details: {
        start: "pfam_start",  // protein domain start position
        end: "pfam_end",      // protein domain end position
        name: "pfam_id",      // protein domain name
    },
};
```

<br/>	
<div align="right">	
    <b><a href="#top">↥ back to top</a></b>	
</div>	
<br/>

### 3.3 Generate `g3-lollipop` chart

To generate `g3-lollipop` chart, we first need to create a lollipop object, set chart options, and draw the chart.

For example,

```javascript
// create in "g3lollipop" div
var lollipop = g3.Lollipop("g3lollipop");

// add mutation data
lollipop.data.snvData = mutation_data;
// mutation data format settings
lollipop.format.snvData = mutation_data_default_settings;

// Pfam domain data
lollipop.data.domainData = pfam_data;
// Pfam data format settings
lollipop.format.domainData = pfam_data_default_settings;

// set up more chart options ...

lollipop.draw();
```

### 3.4 Lollipop chart options

`g3-lollipop` has more than 60 chart options.  Users can use [getter/setter](https://www.w3schools.com/js/js_object_accessors.asp) to set up or query chart options.  For example,

```javascript
lollipop.options.chartMargin = {
    "left": 40, "right": 40, "top": 30, "bottom": 25
};
lollipop.options.titleFont = "normal 20px Sans";
lollipop.options.titleColor = "steelblue";
lollipop.options.titleAlignment = "middle";
lollipop.options.titleDy = "0.3em";
```

or you can use `setOptions` to set a list of options,

```javascript
var plot_options = {
    "chartMargin": {
        "left": 40, "right": 40, "top": 30, "bottom": 25
    },
    "titleFont": "normal 20px Sans",
    "titleColor": "steelblue",
    "titleAlignment": "middle",
    "titleDy": "0.3em"
};

// add chart options
lollipop.setOptions(plot_options);
```

The full list of `g3-lollipop` chart options

* Chart options

| Option 	| Description 	|
|------------------------------	|---------------------------------------------------------------------------------------------------------------------------------	|
| chartTarget   | chart target DIV id.   |
| chartID   | (getter only) get chart SVG unique id. |
| chartWidth 	| chart width in px.  Default `800`. 	|
| chartHeight   | (getter only) chart height in px. |
| chartType 	| pop type, `pie` or `circle`.  Default `pie`. 	|
| chartMargin 	| specify chart margin in JSON format.  Default ```{"left": 40, "right": 20, "top": 15, "bottom": 25}```. 	|
| chartBackground 	| chart background.  Default `transparent`. 	|
| transitionTime 	| chart animation transition time in millisecond.  Default `600`. 	|

* Lollipop options

| Option 	| Description 	|
|------------------------------	|---------------------------------------------------------------------------------------------------------------------------------	|
| lollipopTrackHeight 	| height of lollipop track. Default `420`. 	|
| lollipopTrackBackground 	| background of lollipop track. Default `rgb(244,244,244)`. 	|
| lollipopPopMinSize 	| lollipop pop minimal size in px. Default `2`. 	|
| lollipopPopMaxSize 	| lollipop pop maximal size in px. Default `12`. 	|
| lollipopPopInfoLimit 	| threshold of lollipop pop size to show count information in middle of pop. Default `8`. 	|
| lollipopPopInfoColor 	| lollipop pop information text color. Default `#EEE`. 	|
| lollipopPopInfoDy 	| y-axis direction text adjustment of lollipop pop information. Default `-0.35em`. 	|
| lollipopLineColor 	| lollipop line color. Default `rgb(42,42,42)`. 	|
| lollipopLineWidth 	| lollipop line width. Default `0.5`. 	|
| lollipopCircleColor 	| lollipop circle border color. Default `wheat`. 	|
| lollipopCircleWidth 	| lollipop circle border width. Default `0.5`. 	|
| lollipopLabelRatio 	| lollipop click-out label font size to circle size ratio. Default `1.4`. 	|
| lollipopLabelMinFontSize 	| lollipop click-out label minimal font size. Default `10`. 	|
| lollipopColorScheme 	| color scheme to fill lollipop pops. Default `accent`. Check [color schemes](#35-color-schemes) for details. 	|
| highlightTextAngle 	| the rotation angle of on-click highlight text in degree.  Default `90`. 	|

* Protein doamin annotation track

| Option | Description |
|------------------------------	|---------------------------------------------------------------------------------------------------------------------------------	|
| annoHeight 	| height of protein structure annotation track. Default `30`. 	|
| annoMargin 	| margin of protein structure annotation track in JSON format. Default ```{"top": 4, "bottom": 0}```. 	|
| annoBackground 	| background of protein structure annotation track. Default `transparent`. 	|
| annoBarFill 	| background of protein bar in protein structure annotation track. Default `#E5E3E1`. 	|
| annoBarMargin 	| margin of protein bar in protein structure annotation track. Default ```{"top": 2, "bottom": 2)```. 	|
| domain.color.scheme 	| color scheme of protein domains. Default `category10`.  Check [color schemes](#35-color-schemes) for details. 	|
| domainMargin 	| margin of protein domains. Default ```{"top": 0, "bottom": 0}```. 	|
| domainTextFont 	| domain label text font in shorthand format. Default `normal 11px Arial`. 	|
| domainTextColor 	| domain label text color. Default `#F2F2F2`. 	|

* Y-axis label

| Option | Description |
|------------------------------	|---------------------------------------------------------------------------------------------------------------------------------	|
| yAxisLabel 	| Y-axis label text.  Default `# of mutations`. 	|
| axisLabelFont 	| css font style shorthand (font-style font-variant font-weight font-size/line-height font-family).  Default `normal 12px Arial`. 	|
| axisLabelColor 	| axis label text color.  Default `#4f4f4f`. 	|
| axisLabelAlignment 	| axis label text alignment (start/end/middle). Default `middle` 	|
| axisLabelDy 	| text adjustment of axis label text.  Default `-2em`. 	|
| yAxisLineColor 	| color of y-axis in-chart lines (ticks). Default `#c4c8ca`. 	|
| yAxisLineStyle 	| style of y-axis in-chart lines (ticks), `dash` or `line`. Default `dash`. 	|
| yAxisLineWidth 	| width of y-axis in-chart lines (ticks). Default `1`. 	|
| yMaxRangeRatio 	| ratio of y-axis range to data value range.  Default `1.1`. 	|

* Chart title

| Option | Description |
|------------------------------	|---------------------------------------------------------------------------------------------------------------------------------	|
| titleText 	| title of chart. Default "". 	|
| titleFont 	| font of chart title. Default `normal 16px Arial`. 	|
| titleColor 	| color of chart title. Default `#424242`. 	|
| titleAlignment 	| text alignment of chart title (start/middle/end). Default `middle`. 	|
| titleDy 	| text adjustment of chart title. Default `0.35em`. 	|

* Chart legend

| Option | Description |
|------------------------------	|---------------------------------------------------------------------------------------------------------------------------------	|
| legend 	| if show legend. Default `TRUE`. 	|
| legendMargin 	| legend margin in _list_ format. Default `list(left = 10, right = 0, top = 5, bottom = 5)`. 	|
| legendInteractive 	| legend interactive mode. Default `TRUE`. 	|
| legendTitle 	| legend title. If `NA`, use factor name as `factor.col`. Default is `NA`. 	|

* Brush selection tool

| Option | Description |
|------------------------------	|---------------------------------------------------------------------------------------------------------------------------------	|
| brush 	| if show brush. Default `TRUE`. 	|
| brushBackground 	| background color of selection brush. Default `#666`. 	|
| brushOpacity 	| background opacity of selection brush. Default `0.2`. 	|
| brushBorderColor 	| border color of selection brush. Default `#969696`. 	|
| brushBorderWidth 	| border width of selection brush. Default `1`. 	|
| brushHandler	| color of left and right handlers of selection brush. Default `#333`. 	|

* Tooltip and zoom

| Option | Description |
|------------------------------	|---------------------------------------------------------------------------------------------------------------------------------	|
| tooltip 	| if show tooltip. Default `TRUE`. 	|
| zoom 	| if enable zoom feature. Default `TRUE`. 	|

<br/>	
<div align="right">	
    <b><a href="#top">↥ back to top</a></b>	
</div>	
<br/>

### 3.5 Color palettes

`g3-lollipop` package includes 37 built-in color schemes for categorical data.  These color palettes can be used for lollipops ([demo1](https://bl.ocks.org/phoeguo/2868503a074a6441b5ae6d987f150d48)) or protein domains ([demo2](https://bl.ocks.org/phoeguo/de79b9ce9bda958173af9891ab7aec93)).  The full list of these palettes are shown in this [dome](https://bl.ocks.org/phoeguo/81dffe0c7c6c8caae06f6a5f60c70d19).

<br/>	
<div align="right">	
    <b><a href="#top">↥ back to top</a></b>	
</div>	
<br/>

### 3.6 Export chart

`g3-lollipop` package includes built-in functions to export the resultant chart in PNG or vector-based SVG file.

For example,
HTML code
```html
<div>
    <span class="btn-group">
        <button id="save-as-png">save as PNG</button>
        <button id="save-as-svg">save as SVG</button>
    </span>
</div>

<div id="g3-lollipop"></div>
```
JavaScript code
```javascript
// get chart div id
var chartID = lollipop.options.chartID;

// set default filename
var output_chart_filename = "g3-lollipop";

// button actions: download chart
document.getElementById("save-as-png").onclick = function (e) {
    g3.output().toPNG(output_chart_filename, chartID);
};

document.getElementById("save-as-svg").onclick = function (e) {
    g3.output().toSVG(output_chart_filename, chartID);
};
```

<br/>	
<div align="right">	
    <b><a href="#top">↥ back to top</a></b>	
</div>	
<br/>