var snvFile = "assets/data/TP53-msk_impact_2017.csv";
var domainFile = "assets/data/TP53_pfam.json";

var target1 = "#ex1";

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

var q = d3.queue();
q.defer(d3.tsv, snvFile);
q.defer(d3.json, domainFile);

q.await(function (error, snvData, domainData) {
    snvData.forEach(function (d) {
        d[snvOpt.x] = +d[snvOpt.x];
    });

    lollipop = g3.Lollipop(target1, "pie", 560);
    lollipop.data.snvData = snvData;
    lollipop.data.domainData = domainData;

    lollipop.setOptions({
        legendTitle: "mutation class",
    });
    lollipop.draw(snvOpt, domainOpt);
});

/*
document.getElementById("save-as-png-1").onclick = function (e) {
    g3.output(target1).toPNG('out_png-1');
};
*/

document.getElementById("save-as-svg-1").onclick = function (e) {
    g3.output(target1).toSVG('out_svg-1');
};