@REM esbuild src/compiler.ts --outdir=target --bundle --format=esm --sourcemap %1
deno bundle src/compiler.ts %* -- target/compiler.js
