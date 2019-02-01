import resolve from 'rollup-plugin-node-resolve';

export default {
    external: ["d3"],
    input: 'g3utils.js',
    output: {
        extend: true,
        file: "dist/g3-utils.js",
        format: "umd",
        name: "g3utils",
        indent: false,
        globals: {
            "d3": "d3"
        },
    },
    plugins: [resolve()],
};
