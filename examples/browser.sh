# user must be sitting in the "examples/" directory
nv=`node --version`
echo "node version: $nv"
# cp -r node_modules/nyargs/bootstrap ../my-project
if [ "$1" != "skipbuild" ]; then
    rm -rf ../../nya-browser-app
    cp -r codes/browser ../../nya-browser-app
    cd ../../nya-browser-app
    yarn set version berry
    yarn config set nodeLinker node-modules
    yarn
else
    echo "skipping rm -rf and yarn install"
    cd ../../nya-browser-app
fi


yarn ts-build
yarn js-build
yarn css-build
yarn start
