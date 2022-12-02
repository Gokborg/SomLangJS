esbuild web/index.ts --outdir=target --bundle --format=esm --sourcemap %1
@REM deno bundle web/index.ts %* -- target/compiler.js
