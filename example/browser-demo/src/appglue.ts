// this is bundle-able to esbuild.
// you can't actually use a script tag with "module" in a browser
// to "import" stuff from esbuild, so this is needed to act as the browser's script tag. contents. 
import './mybrowserapp.js'


