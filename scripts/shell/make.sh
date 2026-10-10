#!/bin/bash

clear;

STEPS_BEGUN=0;
STEPS_PASS=0;
START_TIME=$SECONDS;
EXIT_CODE=0;

echo "";
echo -e "\033[1m[ Make ]\033[0m\033[2m[ Compiling JavaScript (ES5) From Source Files ] 1.1.1\033[0m";
echo "";

if [ -d ./../log ]; then rm -Rf ./../log; fi
mkdir -p ./../log;

#
# Scoped DLL version
#
echo -en "\033[1m\033[43m  RUNS  \033[0m";
echo -e  " \033[2mBuilding:\033[0m Static Linked Version \033[2m(SCOPED)\033[0m";

STEPS_BEGUN=$((STEPS_BEGUN+1));

if [ $EXIT_CODE == 0 ];
then
    RESULTS=$(eval ./build.sh 2>&1);

    if [ -z "$RESULTS" ];
    then
        echo -en "\033[1A";
        echo -en "\033[1m\033[42m  PASS  \033[0m";
        echo -en "\033[8D";
        echo -en "\033[1B";
        STEPS_PASS=$((STEPS_PASS+1));
    else
        echo -en "\033[1A";
        echo -en "\a\033[1m\033[101m  FAIL  \033[0m";
        echo -en "\033[8D";
        echo -en "\033[1B";
        EXIT_CODE=2;
    fi
else
    echo -en "\033[1A";
    echo -en "\033[1m\033[43m  SKIP  \033[0m";
    echo -en "\033[8D";
    echo -en "\033[1B";
fi

if [ -z "$RESULTS" ];
then
    RID=$(date +"%y.%j");
    SRC=$(cat './../../dist/rune.js');
    echo "$SRC" | sed "s/%RID%/${RID}/g" > './../../dist/rune.js';
fi

#
# Generate documentation with JSDoc
#
echo -en "\033[1m\033[43m  RUNS  \033[0m";
echo -e  " \033[2mBuilding:\033[0m JSDoc documentation";

STEPS_BEGUN=$((STEPS_BEGUN+1));

if [ $EXIT_CODE == 0 ] || [ command -v jsdoc >/dev/null 2>&1 ];
then
    
    RESULTS=$(jsdoc -r ./../../src ./../../README.md -d ./../../docs/ 2>&1);

    if [ -z "$RESULTS" ];
    then
        echo -en "\033[1A";
        echo -en "\033[1m\033[42m  PASS  \033[0m";
        echo -en "\033[8D";
        echo -en "\033[1B";
        STEPS_PASS=$((STEPS_PASS+1));
    else
        echo -en "\033[1A";
        echo -en "\a\033[1m\033[101m  FAIL  \033[0m";
        echo -en "\033[8D";
        echo -en "\033[1B";
        EXIT_CODE=5;
    fi
else
    echo -en "\033[1A";
    echo -en "\033[1m\033[43m  SKIP  \033[0m";
    echo -en "\033[8D";
    echo -en "\033[1B";
fi

ELAPSED_TIME=$(($SECONDS - $START_TIME));
NUMBER_OF_FILES=$(grep -c '\--js ' "./build.sh");

echo -e "";
echo -e "\033[1mNumber of Files:\033[0m\t$NUMBER_OF_FILES \033[2m(JavaScript)\033[0m";
echo -e "\033[1mBuild Steps:\033[0m\t\t$STEPS_PASS passed, $STEPS_BEGUN total";
echo -e "\033[1mDuration:\033[0m\t\t$ELAPSED_TIME seconds";
echo -e "";

#
# Build process output; successful or unsuccessful
#
if [ $EXIT_CODE == 0 ];
then
    echo -e "\033[1m\033[92mBuild process finished successfully.\033[0m";
else
    echo "$RESULTS" > ./../log/compile_error.log;
    echo -e "\033[1m\033[91mBuild process finished unsuccessfully.\033[0m";
    echo "";
    cat ./../log/compile_error.log;
fi

echo "";

exit $EXIT_CODE;