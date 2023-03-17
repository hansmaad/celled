import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import sourceMaps from 'rollup-plugin-sourcemaps';
import scss from 'rollup-plugin-scss';
import copy from 'rollup-plugin-copy';


export default {
    input: 'src/celled.ts',
    output: [
        { file: 'dist/celled.js', format: 'umd', name: 'CellEd', sourcemap: true },
        { file: 'dist/celled.min.js', format: 'umd', name: 'CellEd', sourcemap: true, plugins: [terser()] },
        { file: 'dist/celled.es6.js', format: 'es', sourcemap: true, plugins: [terser()] },
    ],
    external: [

    ],
    watch: {
        include: 'src/**'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript(),
        scss({ fileName: 'celled.css' }),
        sourceMaps(),
        copy({
            targets: [
                { src: 'src/*.html', dest: 'dist' },
            ],
        }),
    ],
};

