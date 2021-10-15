#! /usr/bin/env node
/* eslint-disable quote-props */
/* eslint-disable indent */
/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */

const path = require("path");
const util = require("util");
const fs = require("fs");
const packageJson = require("../package.json");
const exec = util.promisify(require("child_process").exec);

async function runCmd(command) {

	try {

		const { stdout, stderr } = await exec(command);
		console.log(stdout);
		console.log(stderr);

	} catch {

		(error) => {

			console.log("\x1b[31m", error, "\x1b[0m");

		};

	}

}

if (process.argv.length < 3) {

	console.log("\x1b[31m", "You have to provide name to your app.");
	console.log("For example:");
	console.log("    npx create-pace-app my-app", "\x1b[0m");
	process.exit(1);

}

const ownPath = process.cwd();
const folderName = process.argv[2];
const appPath = path.join(ownPath, folderName);
const repo = "https://gitlab.com/fdnetworks/fdn-boilerplate.git";

try {

	fs.mkdirSync(appPath);

} catch (err) {

	if (err.code === "EEXIST") {

		console.log(
			"\x1b[31m",
			`The file ${folderName} already exist in the current directory, please give it another name.`,
			"\x1b[0m",
		);

	} else {

		console.log(err);

	}
	process.exit(1);

}

async function setup() {

	try {

		console.log("\x1b[33m", "Downloading the project structure...", "\x1b[0m");
		await runCmd(`git clone --depth 1 ${repo} ${folderName}`);

		process.chdir(appPath);

		console.log("\x1b[34m", "Installing dependencies...", "\x1b[0m");
		await runCmd("npm install");
		console.log();

		await runCmd("npx rimraf ./.git");

		fs.rmdirSync(path.join(appPath, "bin"), { recursive: true });
		fs.unlinkSync(path.join(appPath, "package.json"));

		buildPackageJson(packageJson, folderName);

		console.log(
			"\x1b[32m",
			"The installation is done, this is ready to use !",
			"\x1b[0m",
		);
		console.log();

		console.log("\x1b[34m", "You can start by typing:");
		console.log(`    cd ${folderName}`);
		console.log("    npm run local / yarn local", "\x1b[0m");
		console.log();
		console.log("Check Readme.md for more informations");
		console.log();

	} catch (error) {

		console.log(error);

	}

}

setup();

function buildPackageJson(packageJson, folderName) {

	const {
		bin,
		keywords,
		license,
		homepage,
		repository,
		bugs,
		...newPackage
	} = packageJson;

	Object.assign(newPackage, {
		name: folderName,
		"version": "1.0.0",
		"description": "",
		"author": "",
        "license": "MIT",
		scripts: {
			"check": "eslint consts/* containers/* helpers/* lib/* pages/* store/*",
            "local": "cp .env.loc .env && next dev",
            "dev": "cp .env.dev .env && next start",
            "build": "next build",
            "start": "cp .env.prod .env && next start",
		},
		devDependencies: {
			"@fdn/navbar_header": "^1.1.18",
            "@fdn/profile_store": "^1.0.2",
            "@zeit/next-source-maps": "^0.0.3",
            "cookie": "^0.4.1",
            "next": "latest",
            "next-redux-wrapper": "^6.0.2",
            "prop-types": "^15.7.2",
            "react": "^17.0.2",
            "react-dom": "^17.0.2",
            "react-redux": "^7.2.4",
            "redux": "^4.1.0",
            "redux-saga": "^1.1.3",
            "regenerator-runtime": "^0.13.7",
		},
		dependencies: {
			"eslint": "^7.30.0",
            "eslint-config-airbnb": "^18.2.1",
            "eslint-config-next": "^11.0.1",
            "eslint-plugin-import": "^2.23.4",
            "eslint-plugin-jsx-a11y": "^6.4.1",
            "eslint-plugin-react": "^7.24.0",
            "eslint-plugin-react-hooks": "^4.2.0",
            "redux-devtools-extension": "^2.13.9",
		},
	});

	fs.writeFileSync(
		`${process.cwd()}/package.json`,
		JSON.stringify(newPackage, null, 2),
		"utf8",
	);

}
