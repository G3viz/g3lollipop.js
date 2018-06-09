<h1 align="center">
G3-lollipop
</h1>

<h4 align="center" color="bluesteel">
Easily generate interactive lollipop-style diagram to visulize genomic mutation data.
</h4>

## Introduction

G3-lollipop is a component of G3 (Gene|Genome|Genetics) javascirpt library, which generates an interactive lollipop-style diagram to visualize genomic mutation data.

### Quick start

Add library
```html
<link rel="stylesheet" href="https://g3js.github.io/lollipop/assets/css/g3-styles.min.css">
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://g3js.github.io/lollipop/assets/js/g3-lollipop.min.js"></script>

<svg></svg>
```
add lollipop chart

```javascript
// new lollipop chart
lollipop = g3.Lollipop("svg");

// add data
lollipop.data.snvData = snvData;
lollipop.data.domainData = domainData;

lollipop.draw(snvOpt, domainOpt);
```

### Demo
[Live demo](https://bl.ocks.org/phoeguo/583a12e04c6b9d7ca1825cdbdc62f531)

![Screenshot](./docs/assets/img/screenshot1.png)

## Features
- Pop types: pie or circle
- Rich chart options
- Interactive chart legend
- Zoom-in and zoom-out (using mouse or brush)
- Label variation annotation (by clicking pops)
- Save lollipop-plot in SVG or PNG format
- Over 20 color schemes

# Options
