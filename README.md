# Safe Internet Coalition README

## Introduction

This is a Google Chrome browser extension for content filtering boasting user defined keywords that act as filters. These keywords get passed through machine learning based models in order to get semantically associated words. On page loads, the extension then uses these keywords to find potentially triggering sections, censoring them.

## Requirements

For working with the code, Python module PyTorch is needed for the models, and Node.js with npm is needed for running the associated testbench. For more information on each package associated with Node.js, check the package.json file.

## External Deps

- Git - https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
- PyTorch - https://pytorch.org/get-started/locally/
- Node.js - https://nodejs.org/en/download/

## Installation

Download this code repository using git:

`git clone https://github.com/SP23-CSCE482/github-setup-internet_censor_sprint_1.git`

To get all associated packages, move to the project file location and run the Node.js command in your respective terminal:

'npm install'

## Execute Extension

Open up an instance of chrome. Open up the manage extension page 'Extensions pop-up -> Manage Extensions'. Then, toggle on developer mode in the top right corner. In the top left corner, a button named 'Load unpacked' should have appeared. Click on it, and section the folder that holds 'manifest.json' in it. This should load the extension for use on the browser page.

## Execute Testbench

Run the following code in your respective terminal to run the test cases:

'npm test'

To run the linter, run this command:

'npm lint'

## CI/CD

A CI pipeline has been created for this repo. This involves running the linter and test cases after every commit. For more information, check https://github.com/SP23-CSCE482/github-setup-internet_censor_sprint_1/actions
