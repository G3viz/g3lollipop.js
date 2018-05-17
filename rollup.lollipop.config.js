import resolve from 'rollup-plugin-node-resolve';

export default {
    external: [
        'd3',
        "g3.utils"
    ],
    input: 'g3-lollipop.js',
    output: {
        extend: true,
        file: "build/g3-lollipop.js",
        format: "umd",
        name: "g3",
        globals: {
            "d3": "d3",
            "g3.utils": "g3"
        },
    },
    plugins: [resolve()],
};

