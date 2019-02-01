import resolve from 'rollup-plugin-node-resolve';

export default {
    external: ["d3"],
    input: 'g3utils-slim.js',
    output: {
        extend: true,
        file: "dist/g3-utils-slim.js",
        format: "umd",
        name: "g3slim",
        indent: false,
        globals: {
            "d3": "d3"
        },
    },
    plugins: [resolve()],
};
