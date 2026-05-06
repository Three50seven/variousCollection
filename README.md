# variousCollection
Holds Various collections of JavaScript projects.  This is also my main sandbox for learning and/or trying out new JavaScript techniques and libraries.

# Bundling and minifying scripts
After adding new values or otherwise updating view-models and other scripts, you will need to build the project, or run the gulp tasks to update the data arrays in the minified/bundled scripts. 

# Checking data arrays
Once you have bundled and minified scripts, you can check the data arrays by running the following command in a browser console window:
```
MODULES.DataSets.DERBY_WINNERS;

// or to filter by a specific name: 
MODULES.DataSets.DERBY_WINNERS.filter(item => 
  item.toLowerCase().includes("hoo")
);

// returns:
['Hoop Jr.', 'Typhoon II']
```