Step 1 - create assetbundles.json in root of site with main bundles and combine all css and js files into bundle names as needed

Step 2 - create a gulpfile.js in root of site (copy functions from another gulpfile.js or review online help for creating gulp tasks)
	make sure there are no JavaScript errors in the gulpfile.js file (especially if not using some parts of a copied file)

Step 3 - Add the package.json file with necessary packages.
			EXAMPLE: {
		  "version": "1.0.0",
		  "name": "asp.net",
		  "devDependencies": {
			"gulp": "3.9.1"
		  }
		}

Step 4 - Build project, if tasks are not seen in the "Task Runner Explorer" then there is most likely an error in the gulpfile.js 
	file or a package failed to load on build.  You should be able to view the build process from Gulp in the second tab under "local-build"
	Make sure all the css files and js files are in their correct places in the assetbundles.json file.