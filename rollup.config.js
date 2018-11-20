import resolve from 'rollup-plugin-node-resolve';

export default {
    external: [
        'd3'
    ],
    input: 'index.js',
    output: {
        extend: true,
        file: "dist/g3-lollipop.js",
        format: "umd",
        name: "g3",
        indent: false,
        globals: {
            "d3": "d3"
        },
    },
    plugins: [resolve()],
};