# g3-lollipop.js: Interactively visualize genetic mutations using a lollipop-diagram

## 1. Introduction

`g3-lollipop.js` is D3-based JavaScript library which generates interactive lollipop diagram for the given genetic mutation data.  [g3viz](https://github.com/G3viz/g3viz), the *R*-interface of this package, provides more functionality and usability.

* Demos of `g3-lollipop.js`: [[demo1](https://bl.ocks.org/phoeguo/583a12e04c6b9d7ca1825cdbdc62f531)] [[demo2](https://bl.ocks.org/phoeguo/302a0ff5729f6aa773c33d4bfd3061c4)] [[demo3]((https://bl.ocks.org/phoeguo/60f804c6683de30650e36ee912304754))]

* Demos for color-schemes: [[demo1](https://bl.ocks.org/phoeguo/2868503a074a6441b5ae6d987f150d48)]  [[demo2](https://bl.ocks.org/phoeguo/de79b9ce9bda958173af9891ab7aec93)]

* Introduction of `g3viz` *R*-package: [[introduction](https://g3viz.github.io/g3viz/)] [[chart themes](https://g3viz.github.io/g3viz/chart_themes.html)]


## 2. Install

```html
<!-- (optional) css  -->
<link rel="stylesheet" href="https://s3-us-west-2.amazonaws.com/cdsjsd3/g3-viz/0.5.0/g3-lollipop.min.css">

<!-- D3 and G3-lollipop libraries -->
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://s3-us-west-2.amazonaws.com/cdsjsd3/g3-viz/0.5.0/g3-lollipop.min.js"></script>
```

## 3. Usage

### 3.1 Genetic mutation data

The input genetic mutation data should be an array of [JSON](https://www.json.org/) objects. For example,

```javascript
var mutation_data = [{
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
}];
```

In addition, users need to specify data columns for the _x_, _y_, and _factor_ values.  The default settings are

```javascript
var mutation_data_default_settings = {
    x: "AA_Position",         // mutation position
    y: "Protein_Change",      // amino-acid changes
    factor: "Mutation_Class", // classify mutations by certain factor (optional)
};
```

### 3.2 Protein domain information

[Pfam](https://pfam.xfam.org/) domains are commonly used for structural annotation in genetic mutation lollipop diagrams.  For exmaple,

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

### 3.3 Generate `g3-lollipop` chart

To generate `g3-lollipop` chart, we first need to create a lollipop object, set chart options, and draw the chart.  For example,

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
    left: 40, right: 40, top: 30, bottom: 25
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
