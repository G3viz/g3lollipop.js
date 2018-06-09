<h1 align="center">G3-lollipop</h1>

<h4 align="center" style="color:#4682b4">
Easily generate interactive lollipop-style diagram to visulize genomic mutation data
</h4>

------

## Introduction

G3-lollipop is a component of G3 (Gene|Genome|Genetics) Javascirpt library, which generates an interactive lollipop-style diagram to visualize genomic mutation data.

## Quick start

- Add libraries
```html
<link rel="stylesheet" href="https://g3js.github.io/lollipop/assets/css/g3-styles.min.css">
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://g3js.github.io/lollipop/assets/js/g3-lollipop.min.js"></script>

<svg></svg>
```

- An example of Mutation data in tab-delimited format

Protein_Change | Mutation_Type | Mutation_Class | AA_Position
| ------------- |------------- | ----- |  ---- |
| P13Lfs*2 | Frame_Shift_Del |Truncating | 13 |
| L14Sfs*15 | Frame_Shift_Ins | Truncating | 14 |
| Q16Rfs*28 | Frame_Shift_Del | Truncating | 16 |
| T18Hfs*26 | Frame_Shift_Del | Truncating | 18 |
| F19Kfs*24 | Frame_Shift_Del | Truncating | 19 |
| S20Qfs*24 | Frame_Shift_Del | Truncating | 20 |
| ... | ... | ... | ... | 

- Protein domain information (in JSON format)

```JSON
{  
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

- Data configuration

```javascript
var snvOpt = {
    x: "AA_Position",
    y: "Protein_Change",
    factor: "Mutation_Class",
};

var domainOpt = {
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
```

- Create lollipop chart

```javascript
// new lollipop chart
lollipop = g3.Lollipop("svg");

// add data
lollipop.data.snvData = snvData;
lollipop.data.domainData = domainData;

lollipop.draw(snvOpt, domainOpt);
```

## Demo
[Live demo](https://bl.ocks.org/phoeguo/583a12e04c6b9d7ca1825cdbdc62f531)


<a href="https://bl.ocks.org/phoeguo/583a12e04c6b9d7ca1825cdbdc62f531"><img src="./docs/assets/img/screenshot1.png" alt="demo screenshot" width="500"/></a>

## Features

- Pop types: pie or circle
- Rich chart options
- Interactive chart legend
- Zoom-in and zoom-out (using mouse or brush)
- Label variation annotation (by clicking pops)
- Save lollipop-plot in SVG or PNG format
- Over 20 color schemes

## API
