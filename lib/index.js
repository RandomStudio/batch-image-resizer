// Native
const fs = require('fs');
const path = require('path');

// Resizer
const resizer = require('./resizer');

// Arguments
const {
	input,
	output,
	sizes,
	fit,
	keepName
} = require('./argsHandler');

// Constants
const {
	SUPPORTED_INPUT_TYPES,
} = require('./constants');

// Utilities
const {
	getFileExtension,
	isDirectory,
	getDirectoriesByGlob,
} = require('./utilities');

const resize = (inputFile, outputFile) => {
	const inputFileExtension = getFileExtension(inputFile);

	if (inputFileExtension) {
		if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
			// Parse image sizes
			const imagesSizes = (sizes) ? JSON.parse(sizes).map(size => parseInt(size, 10)) : undefined;

			if (imagesSizes !== undefined) {
				imagesSizes.forEach((size) => {
					resizer(inputFile, outputFile, size, fit, keepName);
				});
			} else {
				resizer(inputFile, outputFile);
			}
		} else {
			console.error(`${inputFileExtension} is not supported.`);
			console.error(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]`);
		}
	}
};

const getFiles = () => {
	if (isDirectory(input)) {
		getDirectoriesByGlob(input, (error, result) => {
			if (error) {
				console.error(error);
			} else {
				const fileList = result.map(file => file.split(input)[1]);

				fileList.map((file) => {
					// Check if the current file is a directory
					const fileIsDirectory = isDirectory(path.resolve(path.join(input, file)));

					// Create the directory folder tree in the output folder
					if (fileIsDirectory) {
						const absoluteFolderPath = path.join(path.resolve(output), file);

						// Create folder if it doesn't exist yet
						if (!fs.existsSync(absoluteFolderPath)) {
							fs.mkdirSync(absoluteFolderPath);
						}
					} else {
						const absoluteInputFilePath = path.join(path.resolve(input), file);
						const absoluteOutputFilePath = path.join(path.resolve(output), file);

						resize(absoluteInputFilePath, absoluteOutputFilePath);
					}
				});
			}
		});
	} else {
		// If no directory was given just process the single given file
		resize(input, output);
	}
};

getFiles();
