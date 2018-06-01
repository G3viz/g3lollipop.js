// query gene symbol
//import xlm2json from "xml-ls";

function uniprot(symbol) {
    var url = "https://www.uniprot.org/uniprot/?query=gene_exact:" +
        symbol +
        "+AND+organism:9606+AND+reviewed:yes\&columns=id,length\&format=tab";
    console.log(url);

    fetch(url, {
        cache: 'default', // *default, no-cache, reload, force-cache, only-if-cached
        method: 'GET',
        "Content-type": "text/plain",
    })
        .then(function (res) {
            if (res.status == 200) {
                
                console.log(res);
            } else {
                console.log(res);
            }
        });
}

// query data from UniProt



// query data from Pfam

// query data from 