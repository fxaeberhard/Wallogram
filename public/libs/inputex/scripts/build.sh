#!/bin/sh

CURRENT_PATH="$(dirname "$(readlink ${BASH_SOURCE[0]})")"
BUILD_PATH=$CURRENT_PATH/../build
SRC_PATH=$CURRENT_PATH/../src
YUIcompressorJar=~/Tools/yuicompressor-2.4.6/build/yuicompressor-2.4.6.jar

# Remove previous files
rm -rf $BUILD_PATH
mkdir -p $BUILD_PATH

for f in $SRC_PATH/*
do
  # take action on each file. $f store current file name
  #cat $f

  DIR=`echo $f | cut -d\/ -f4`

  echo "Processing $DIR"
   
  cp -r $SRC_PATH/$DIR $BUILD_PATH/$DIR
   
   if [ $DIR = "loader.js" ]
   then
      java -jar $YUIcompressorJar $BUILD_PATH/$DIR -o $BUILD_PATH/loader-min.js --charset utf8
   else
      java -jar $YUIcompressorJar $BUILD_PATH/$DIR/$DIR.js -o $BUILD_PATH/$DIR/$DIR-min.js --charset utf8
      
      # compress lang files
      if [ -d $BUILD_PATH/$DIR/lang ]; then
         for langfile in $BUILD_PATH/$DIR/lang/*
         do
            echo " - compressing lang $langfile"
            java -jar $YUIcompressorJar $langfile -o $langfile --charset utf8
         done
      fi
      
      # compress assets
      if [ -d $BUILD_PATH/$DIR/assets ]; then
         CSSFILE="$BUILD_PATH/$DIR/assets/skins/sam/$DIR.css"
         echo " - compressing assets $CSSFILE"
         java -jar $YUIcompressorJar $CSSFILE -o $CSSFILE --type css --charset utf8
      fi
         
   fi

done


# mkdir -p
# 
# # Minify using yui compressor
# java -jar $YUIcompressorJar $BUILD_PATH/inputex.js -o $BUILD_PATH/inputex-temp-min.js --charset utf8
# 
# # Minify CSS using yui compressor
# java -jar $YUIcompressorJar $CURRENT_PATH/../css/inputEx.css -o $BUILD_PATH/inputex-temp-min.css --charset utf8
# 
# # Add the license
# cat $CURRENT_PATH/../license.txt $BUILD_PATH/inputex-temp-min.js > $BUILD_PATH/inputex-min.js
# rm -f $BUILD_PATH/inputex-temp-min.js
# 
# cat $CURRENT_PATH/../license.txt $BUILD_PATH/inputex-temp-min.css > $BUILD_PATH/inputex-min.css
# rm -f $BUILD_PATH/inputex-temp-min.css