import resolve from 'rollup-plugin-node-resolve'; 

//const definition = require("./package.json");

export default {
    input: 'g3-utils.js',
    external: "d3",
    output: {
        extend: true,
        file: "build/g3-utils.js",
        format: "umd",
        name: "g3.utils",
        globals: {
            "d3": "d3",
        },
    },
    plugins: [resolve()],
};