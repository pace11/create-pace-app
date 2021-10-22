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
const repo = "https://github.com/pace11/create-pace-app.git";

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
		"name": folderName,
		"version": "1.0.0",
		"description": "",
		"bin": {
			"react-pace-app": "./bin/create-app.js"
		},
		"main": "index.js",
		"scripts": {
			"test": "echo \"Error: no test specified\" && exit 1"
		},
		"author": "pace11",
		"license": "MIT",
		"homepage": "https://github.com/pace11/create-pace-app",
		"repository": {
			"type": "git",
			"url": "https://github.com/pace11/create-pace-app.git"
		}
	});

	fs.writeFileSync(
		`${process.cwd()}/package.json`,
		JSON.stringify(newPackage, null, 2),
		"utf8",
	);

}
