<h3 align="center">
  <img src="https://cdn.secure-api.org/images/nativeloop_logo_text_256.png" alt="nativeloop logo" />
</h3>

 <div align="center">⚡ Developing native mobile apps just got a whole lot more awesome ⚡</div>

---

## create

---

### Description

Creates a new project for native mobile development with {nativeloop}.

### General Usage

Usage | Description
---|---
Create from default template | `native create <App Name> [--path <Directory>] [--id <App ID>]`
Create from custom template | `native create <App Name> [--path <Directory>] [--appid <App ID>] --template <Template>`

### Options

- `--path` - Specifies the directory where you want to create the project, if different from the current directory. The directory must be empty.
- `--id` - [optional] Sets the application identifier for your project.  If `--id` is not set, the App ID is created based on the name of the app.
- `--template` - [optional] Specifies a local directory or valid npm package which you want to use to create your project. If `--template` are not set, the {nativeloop} CLI creates the project from the default template `@nativeloop/template-default`
- `--name` - Specifies the name of your project.  This is alternative to passing the app name as the first parameter.
- `--url` - [optional] Specifies the url for your organization.
- `--publisher` - [optional] Specifies the publisher for this app.
- `--copyright` - [optional] Specifies the copyright for this app.
- `--description` - [optional] Specifies the description for this app.
- `--guid` - [optional] Specifies the unique GUID for this app.


### Parameters

- `<Template>` is an existing directory or a valid npm package which you want to use as template for your app. You can specify the package by name in the npm registry or by local path or GitHub URL to a directory or .tar.gz containing a package.json file. The contents of the package will be copied to the directory of your project.


### Related Commands

Command | Description
----------|----------
[init]() | ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png) Initializes an existing {nativeloop} or Appcelerator mobile project for development with {nativeloop}. The command prompts you to provide your project configuration interactively and uses the information to create a new package.json file or update the existing one.

