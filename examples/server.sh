# user must be sitting in the "examples/" directory

# cp -r node_modules/nyargs/bootstrap ../my-project
if [ "$1" != "skipbuild" ]; then    
    rm -rf ../../nya-server-project
    cp -r codes/server ../../nya-server-project
    cd ../../nya-server-project
    # yarn set version berry
    yarn
else
    echo "skipping rm -rf and yarn install"
    cd ../../nya-server-project
fi

corepack enable
echo "corepack enable ran"

yarn ts-build && yarn myapp
