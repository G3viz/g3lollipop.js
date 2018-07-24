<h1>G3-lollipop.js</h1>

## Introduction
`G3-lollipop` is a `D3`-based Javascript library, which generates interactive 'lollipop-style' diagrams to effectively visualize every details of annotated mutations on protein structure.
`G3-lillipop` takes annotated <a href="https://docs.gdc.cancer.gov/Encyclopedia/pages/Mutation_Annotation_Format/">MAF (Mutation Annotation Format)</a> files (with amino-acid change information) as input, and the generated plots can be saved locally in *png* or *svg* format for future use. For more information about MAF files, please read this <a href="https://www.biostars.org/p/69222/">post</a>. The Pfam composition is retrieved from <a href="http://pfam.xfam.org/help#tabview=tab9">Pfam</a> and <a href="https://www.uniprot.org/">UniProt</a> databases.


## Usage

### Add libraries
Add Javascript libraries (`GS-lollipop` and `D3`) and CSS
```html
<link rel="stylesheet" href="https://g3js.github.io/lollipop/assets/css/g3-styles.min.css">
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://g3js.github.io/lollipop/assets/js/g3-lollipop.min.js"></script>
```

### Mutation data preparation
The input mutation data should be in <a href="https://docs.gdc.cancer.gov/Data/File_Formats/MAF_Format/">MAF files</a> or alternative user-defined tab-delimited file.  For either formats, the file is required to contain some mandatory columns as listed

Column | Description | Examples
| ------- | ------------- | -------- |
| **Hugo_symbol** | HUGO symbol | TP53, BRCA1 |
| **Amino_acid_change** | Amino Acid change | A915D, T3085fs | 
| **Variant_Classification** | translational effects of mutations | Missense_Mutation, Frame_Shift_Ins |
| **Chromosome** | Chromosome | chr1, chrX |
| **Start_position** | mutation start position | 133647184 |
| **End_position** | mutation end position | 133647185 |

### *Variant_Classification* to *Variant_type*

An example of Mutation data in tab-delimited format

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
var snvDataFormat = {
    x: "AA_Position",          // (mandatory) mutation position
    y: "Protein_Change",       // (mandatory) protein change type
    factor: "Mutation_Class",  // (optional) if mutations are classified by cetern categories
};

var domainDataFormat = {
    length: "length",         // protein length
    details: {
        start: "pfam_start",  // protein domain start position
        end: "pfam_end",      // protein domain end position
        name: "pfam_id",      // protein domain name
    },
};
```

- Create lollipop chart

```javascript
// new lollipop chart
lollipop = g3.Lollipop("g3chart");

// add data
lollipop.data.snvData = snvData;
lollipop.data.domainData = domainData;

// specify data format
lollipop.format.snvData = snvDataFormat;
lollipop.format.domainData = domainDataFormat;

lollipop.draw();
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
