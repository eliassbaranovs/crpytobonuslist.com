#!/bin/bash

DEPLOYPATH=/home/exparboc/cryptobonuslist.com
REPOPATH=/home/exparboc/repositories/crpytobonuslist.com

echo "========================================" >> $REPOPATH/deploy.log
echo "Starting deployment at $(date)" >> $REPOPATH/deploy.log

cd $REPOPATH || exit 1

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "Node.js version: $(node --version)" >> $REPOPATH/deploy.log
    echo "NPM version: $(npm --version)" >> $REPOPATH/deploy.log

    # Install dependencies
    echo "Installing dependencies..." >> $REPOPATH/deploy.log
    npm install --production 2>> $REPOPATH/deploy.log

    # Build the site
    echo "Building Astro site..." >> $REPOPATH/deploy.log
    npm run build 2>> $REPOPATH/deploy.log

    if [ -d "$REPOPATH/dist" ]; then
        # Deploy ONLY to cryptobonuslist.com folder
        echo "Deploying to $DEPLOYPATH..." >> $REPOPATH/deploy.log
        rm -rf $DEPLOYPATH/*
        cp -r $REPOPATH/dist/* $DEPLOYPATH/

        echo "✓ Deployment successful at $(date)" >> $REPOPATH/deploy.log
        echo "========================================" >> $REPOPATH/deploy.log
    else
        echo "✗ ERROR: dist folder not found after build" >> $REPOPATH/deploy.log
        echo "========================================" >> $REPOPATH/deploy.log
        exit 1
    fi
else
    echo "✗ ERROR: Node.js not found on server" >> $REPOPATH/deploy.log
    echo "Please contact hosting support to install Node.js" >> $REPOPATH/deploy.log
    echo "Or use GitHub Actions deployment method instead" >> $REPOPATH/deploy.log
    echo "========================================" >> $REPOPATH/deploy.log
    exit 1
fi
