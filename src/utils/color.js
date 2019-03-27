import d3 from "d3";

export var palettes = {
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
    rainbow: ["#e6261f", "#eb7532", "#f7d038", "#a3e048", "#49da9a", "#34bbe6", "#4355db", "#d23be7"],
    chineseWaterColor: [
        "#832f0e", "#0c0a08", "#594a40", "#8e7967", "#e3c2a0", "#deaa6e", "#81947a"
    ]
};

export function defaultPalette() {
    return palettes["google16"];
}

export function getPalette(paletteName) {
    return (paletteName in palettes) ? palettes[paletteName] : defaultPalette;
}

export function listPalettes() {
    return Object.keys(palettes);
}

export function scaleOrdinal(paletteName) {
    return d3.scaleOrdinal(getPalette(paletteName));
}