#!/bin/bash

THEME_FILES=(src/assets/themes/default/index.less src/assets/themes/compact/index.less src/assets/themes/dark/index.less)

ECHO "Building theme less files"

for FILE in ${THEME_FILES[*]}
do
  BASENAME=${FILE%.less}
  ECHO $FILE
  $(npm bin)/lessc --js $FILE > $BASENAME.css
  ECHO $BASENAME.css
done

echo Finished building CSS.