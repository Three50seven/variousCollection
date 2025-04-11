/// <binding AfterBuild='local-build' ProjectOpened='project-open' />
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const newer = require('gulp-newer');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');
const fs = require('fs');
const cleanCSS = require('gulp-clean-css');

const settings = {
    paths: {
        scriptsDestDirectory: "./wwwroot/assets/js/",
        stylesDestDirectory: "./wwwroot/assets/css/"
    },
    basePath: "./wwwroot/" // appended to filepaths defined in bundle.Files
};

const bundles = require('./assetbundles.json');


// build out script bundles based on explicitly defined "type" or check file extension of first file in list
var scriptBundles = bundles.filter(function (item) {
    return (item.type !== undefined && (item.type === "js" || item.type === "JS"))
        || (item.type === undefined && item.files !== undefined && item.files.length > 0 && item.files.some(function (file) { return file.endsWith("js"); }));
});

// build out style bundles based on explicitly defined "type" or check file extension of first file in list
var styleBundles = bundles.filter(function (item) {
    return (item.type !== undefined && (item.type === "css" || item.type === "CSS"))
        || (item.type === undefined && item.files !== undefined && item.files.length > 0 && item.files.some(function (file) { return file.endsWith("css"); }));
});

// recursively build out list of files in a bundle
function BuildFiles(bundle, bundlesList) {
    var bundleFiles = [];

    if (bundle && bundle.files && bundle.files.length) {
        for (var j = 0; j < bundle.files.length; j++) {
            //if "file" is found as a bundle name, recursively get that bundle's files
            var existingBundle = bundlesList.filter(function (b) {
                return b.name === bundle.files[j];
            });

            if (existingBundle && existingBundle.length) {
                bundleFiles = bundleFiles.concat(BuildFiles(existingBundle[0], bundlesList));
            } else {
                var file = bundle.files[j];
                if (settings.basePath && settings.basePath.length)
                    file = settings.basePath + file;
                bundleFiles.push(file);
            }
        }
    }

    return bundleFiles;
}

function ToBool(value) {
    if (value === undefined) {
        return false;
    } else if (typeof value === 'boolean') {
        return value;
    } else if (typeof value === 'number') {
        value = value.toString();
    } else if (typeof value !== 'string') {
        return false;
    }

    switch (value.toLowerCase()) {
        case "true":
        case "yes":
        case "1":
            return true;
        default:
            return false;
    }
}

function Argument(args, key, defaultValue) {
    var self = this;

    function _getArgumentValue(args, key) {
        var option,
            index = args.indexOf(key);

        if (index > -1 && args.length > (index + 1)) {
            return args[index + 1];
        }

        return undefined;
    }

    self.Value = defaultValue;
    self.Argument = _getArgumentValue(args, key);

    if (self.Argument !== undefined)
        self.Value = self.Argument;
}

function BoolArgument(args, key, defaultValue) {
    var self = this;

    function _getArgumentValue(args, key) {
        var option,
            index = args.indexOf(key);

        if (index > -1 && args.length > (index + 1)) {
            return args[index + 1];
        }

        return undefined;
    }

    self.Value = defaultValue === undefined ? false : defaultValue;
    self.Argument = _getArgumentValue(args, key);

    if (self.Argument !== undefined)
        self.Value = ToBool(self.Argument);
}

gulp.task("clean-js", async function () {
    return gulp
        .src(settings.paths.scriptsDestDirectory, { read: false })
        .on("end", function () {
            console.log("* Cleaning destination '" + settings.paths.scriptsDestDirectory + "'... *");
        })
        .pipe(clean())
        .on("end", function () {
            console.log("* Cleaning complete. *");
        });
});

function BundleJS(newerOnly) {
    if (scriptBundles && scriptBundles.length) {
        console.log("*** Starting JS bundling. Newer Only: " + newerOnly + " ***");

        var completedCount = 0,
            totalBundleCount = scriptBundles.length;

        for (var i = 0; i < totalBundleCount; i++) {
            var scriptBundle = scriptBundles[i];

            var dest = settings.paths.scriptsDestDirectory;
            dest += scriptBundle.subpath || "";

            if (dest.slice(-1) !== "/") { dest += "/"; }

            dest += scriptBundle.filename || (scriptBundle.name + ".min.js");

            if (ToBool(scriptBundle.referenceOnly)) {
                console.log("Bundle for " + scriptBundle.name + " is set to only be referenced. No bundling for this bundle.");

                if (scriptBundle.staticOutputPath) {
                    (function (scriptBundle, dest) {
                        var gulpTask = gulp.src(settings.basePath + scriptBundle.staticOutputPath, { base: "." })
                            .on("end", function () {
                                console.log("Bundle " + scriptBundle.name + " marked as have a *static output* of '" + scriptBundle.staticOutputPath + "'. It will have it's static output copied to destination.");
                            })
                            .pipe(concat(dest))
                            .pipe(gulp.dest("."))
                            .on("end", function () {
                                completedCount++;
                                console.log("Static Output '" + scriptBundle.staticOutputPath + "' copied to '" + dest + "'.");
                            });
                    })(scriptBundle, dest);

                } else {
                    completedCount++;
                }

                continue;
            }

            var files = BuildFiles(scriptBundle, scriptBundles); //get list of files for this bundle
            var gulpTask = gulp.src(files, { base: "." });

            if (newerOnly) {
                gulpTask = gulpTask.pipe(newer(dest));
            }

            (function (name, files) {
                gulpTask
                    .on("end", function () {
                        console.log("Bundling " + name + " ... ");
                        for (var i = 0; i < files.length; i++) {
                            console.log(" - Includes file " + files[i] + ".");
                        }
                    })
                    .pipe(concat(dest))
                    .pipe(uglify()) //COMMENT OUT pipe(uglify()) SECTION TO PREVENT MINIFYING OF JAVASCRIPT FILES (MIGHT HAVE TO DELETE MIN FILE IN wwwroot\js\ SUB-DIRECTORIES
                    .on('error', function (e) {
                        console.log(e);
                    })
                    .pipe(gulp.dest("."))
                    .on("end", function () {
                        completedCount++;

                        if (completedCount === totalBundleCount) {
                            console.log("*** Bundling JS process complete. ***");
                        }
                    });
            })(scriptBundle.name, files);
        }
    } else {
        console.log("No JS bundles found.");
    }
}

gulp.task("bundle-js", async function () {

    var bundlingArguments = {
        // flag to only update bundle files if the script file is newer
        // defaulted to "true" for quicker local builds
        // process.argv.newerOnly is an optional parameter to set this value - intended as part of CI/build process
        NewerOnly: new BoolArgument(process.argv, "--newerOnly", true)
    };

    BundleJS(bundlingArguments.NewerOnly.Value);
});

gulp.task("bundle-js-full", gulp.series(["clean-js"], async function () {
    BundleJS(false);
}));

gulp.task("bundle-css", async function () {

    if (styleBundles && styleBundles.length) {
        for (var i = 0; i < styleBundles.length; i++) {
            var styleBundle = styleBundles[i];
            if (ToBool(styleBundle.referenceOnly)) {
                console.log("Bundle for " + styleBundle.name + " is set to only be referenced. No bundling for this bundle.");
                continue;
            }

            console.log("Bundling " + styleBundle.name + " ... ");

            var files = BuildFiles(styleBundle, styleBundles); //get list of files for this bundle

            var dest = settings.paths.stylesDestDirectory;
            dest += styleBundle.subpath || "";

            if (dest.slice(-1) !== "/") { dest += "/"; }

            dest += styleBundle.filename || (styleBundle.name + ".min.css");

            gulp.src(files, { base: "." })
                .pipe(concat(dest))
                .pipe(cleanCSS())
                .pipe(gulp.dest("."));
        }
    }
    else {
        console.log("No CSS bundles found.");
    }

    console.log("Bundling CSS process complete.");
});

function NewFile(name, contents) {
    //uses the node stream object
    var readableStream = require('stream').Readable({ objectMode: true });

    //reads in contents string
    readableStream._read = function () {
        this.push(new vinyl({ cwd: "", base: null, path: name, contents: new Buffer(contents) }));
        this.push(null);
    };
    return readableStream;
}

function MergeProperties(base, target, output) {
    // start with all properties in base
    for (var prop in base) {
        if (target.hasOwnProperty(prop)) {
            // recursively merge nested properties if property is an object excluding arrays
            if (typeof target[prop] !== null
                && typeof base[prop] === "object"
                && typeof target[prop] === "object"
                && toString.call(base[prop]) !== "[object Array]") {
                console.log("Base Property '" + prop + "': is OBJECT type - recursively merging properties...");
                MergeProperties(base[prop], target[prop], output[prop]);
            } else {
                // set the output property to the new target property (includes arrays overwriting arrays)
                console.log("Base Property '" + prop + "': output VALUE SET to " + target[prop]);
                output[prop] = target[prop];
            }
        } else {
            console.log("Base Property '" + prop + "' not found on target.");
        }
    }

    // see if any new properties exist on the target and add to the output if not present
    for (var prop in target) {
        if (!output.hasOwnProperty(prop)) {
            console.log("Target Property '" + prop + "': output VALUE SET to + " + target[prop]);
            output[prop] = target[prop];
        } else {
            console.log("Target Property '" + prop + "': already exists on output.");
        }
    }
}

gulp.task("json:transform", async function () {
    var environment = new Argument(process.argv, "--environment"),
        baseDirectory = new Argument(process.argv, "--basedir", "./"),
        filename = new Argument(process.argv, "--basefilename", "appsettings"),
        outputDirectory = new Argument(process.argv, "--outputdir", "./"),
        outputFileName = new Argument(process.argv, "--outputfilename", "appsettings");

    if (environment.Value) {
        console.log("** Transforming JSON file '" + filename.Value + "' for '" + environment.Value + "' environment. **");

        var settingsBase = require(baseDirectory.Value + filename.Value + ".json"),
            newSettings = settingsBase,
            environmentSettings = require(baseDirectory.Value + filename.Value + '.' + environment.Value + '.json');

        MergeProperties(settingsBase, environmentSettings, newSettings);

        //convert new object to a JSON string and write it a file in output directory
        return NewFile(outputFileName.Value + ".json", JSON.stringify(newSettings, null, 2))
            .pipe(gulp.dest(outputDirectory.Value));
    } else {
        console.error("Transform operation aborted. No environment specified.");
    }
});

gulp.task("local-build", gulp.series("bundle-js", "bundle-css"));

gulp.task("build", gulp.series("bundle-js-full", "bundle-css"));

gulp.task("local-web-proj-clean", async function () {

    return del([
        'bin/**',
        'obj/**'
    ]);

});

gulp.task("copy-local-content-to-wwwroot", async function () {
    gulp.src("../../data/sitecontent/**")
        .pipe(gulp.dest("./wwwroot/local_sitecontent/"));
});

gulp.task("project-open", gulp.series("copy-local-content-to-wwwroot"));

gulp.task('print-node-version', async function () {
    console.log("Node Version: " + process.version);
});
