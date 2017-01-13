<h3 align="center">
  <img src="https://cdn.secure-api.org/images/nativeloop_logo_text_256.png" alt="nativeloop logo" />
</h3>

 <div align="center">⚡ Developing native mobile apps just got a whole lot more awesome ⚡</div>

---


```javascript
const status = "Pre-Production Beta!";
const warning = "Breaking changes may be introduced before 1.0.0 release";

developer.read(warning)
	.then((⚡) => { return developer.code(⚡); })
	.then((code) => { return developer.😀 });
	.then((app) => { return users.❤️ });

```

---

# ⚡[`{nativeloop} cli`](#nativeloop)⚡

[![npm version](https://badge.fury.io/js/nativeloop.svg)](https://badge.fury.io/js/nativeloop) 
[![](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

<!-- TOC depthFrom:2 depthTo:6 insertAnchor:false orderedList:false updateOnSave:true withLinks:true -->

- [Overview](#overview)
	- [What is [`{nativeloop}`][]?](#what-is-nativeloop)
- [Quick Start](#quick-start)
- [Quick Start (with some options)](#quick-start-with-some-options)
	- [Install `{nativeloop}`](#install-nativeloop)
		- [Option 1:  Install Globally](#option-1--install-globally)
		- [Option 2:  Install Locally](#option-2--install-locally)
		- [Option 3:  Install using gitTio ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png)](#option-3--install-using-gittio-coming-soonhttpsimgshieldsiobadgecoming-soon-orangepng)
	- [Setup mobile project](#setup-mobile-project)
		- [Create new mobile project](#create-new-mobile-project)
		- [Upgrade existing Appcelerator mobile project ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png)](#upgrade-existing-appcelerator-mobile-project-coming-soonhttpsimgshieldsiobadgecoming-soon-orangepng)
	- [Install Prerequisites/Dependencies](#install-prerequisitesdependencies)
- [Features](#features)
- [Need Help?](#need-help)
- [License](#license)
- [Legal](#legal)

<!-- /TOC -->

## Overview

`{nativeloop}` is many tools in one package:
* a command line (cli) tool for creating and working with existing {nativeloop} mobile applications
* a compile-time library for creating awesome mobile apps
* a run-time library for enhancing mobile apps
* an Appcelerator widget for augmenting Alloy mobile apps.

> **:soon: Only a few of the clicommands have been implemented at this time.
Feel free to test out the functionality that exists right now and stay tuned
as more features are added soon!**


### What is [`{nativeloop}`][]?

[`{nativeloop}`] is a framework for building awesome native apps using node.js style javascript. 
It provides developers with access to an extremely rapid development process 
without compromising on the delivered product.

[`{nativeloop}`][] is open-source (MIT) and is built upon the open-source version of [`appcelerator`][]
and other open-source products.  If you like what you see, contribute to this and other open-source projects!


## Quick Start

> Install `{nativeloop}` (if you have not already done this) and create new project!

```bash
npm install -g nativeloop
nativeloop create mycoolapp
```

## Quick Start (with some options)

### Install `{nativeloop}`

#### Option 1:  Install Globally

>This is your quickest and easiest way to get started with `{nativeloop}`.  Installing globally will 
allow it to be accessed by any our your mobile projects.

```bash
npm install -g nativeloop
```

#### Option 2:  Install Locally

>Just as quick and easy, but this will allow you to use a specific version `{nativeloop}` for your mobile project.  Simply run this in the root of your mobile project!

```bash
npm install --save nativeloop
```

#### Option 3:  Install using gitTio ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png)

> **:soon: Not available yet, but coming very soon!!**

>Install this as a widget using gitTio (http://gitt.io).  We hope to have this option available soon!

```bash
gittio install nativeloop
```

### Setup mobile project

#### Create new mobile project

:book: [see documentation for `create` for more details](https://github.com/nativeloop/nativeloop/blob/develop/docs/create.md)

```bash
	native create my-cool-app
```

#### Upgrade existing Appcelerator mobile project ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png)

> **:soon: Not available yet, but coming very soon!!**

```bash
	native init
```

### Install Prerequisites/Dependencies

>_Our goal is to provide as much automation as possible to make the mobile development
experience as awesome as possible.  Currently there are some prerequisites/dependencies that
need to installed manually but we hope to automate some of these in the near future!_


- [OSX] Install latest Xcode from App Store _(8.2.1 as of the time of writing)_
- Install Appcelerator Titanium and Alloy

```bash
	npm install -g alloy
	npm install -g titanium
```

- [OSX] Install [homebrew](http://brew.sh) _(optional, but highly recommended)_

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

- Install IDE of your choice _(We highly recommend [Microsoft Visual Studio Code](https://code.visualstudio.com), as it is free, fast and works great!)_
- Install Android SDK and NDK

>OSX

```bash
	brew install android-sdk
	brew install android-ndk
```

>Windows

:soon: Instructions for installing on Windows coming soon!

- There might be a few more items to install... Stay tuned for more detailed instructions


## Features

- [x] **ECMAScript 2015/ES6** - using babel.js
- [x] **Node.js global objects:**
    - [x] `Promise` - using bluebird but can be easily replaced
    - [x] `__dirname` - available with Appcelerator 6.x
    - [x] `__filename` - available with Appcelerator 6.x
- [x] **Node.js core modules:** 
	- [x] `fs` (not complete coverage)
    - [x] `path`
    - [ ] `url`   ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png)
    - [ ] `querystring`   ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png)
- [x] **Appcelerator Titanium/Alloy workarounds**
	- [x] Supports relative path usage to workaround (https://jira.appcelerator.org/browse/TIMOB-24170)
    - [x] Replace underscorejs the latest version of lodash  https://jira.appcelerator.org/browse/ALOY-1495
	- [x] Create new apps from external templates https://jira.appcelerator.org/browse/ALOY-1498
	- [x] Use relative paths with LiveView https://jira.appcelerator.org/browse/TIMOB-24170
- [x] Supports installation of modules for your app using [`npm`][]
- [x] Does not require replacing Alloy (globally or per build of appcelerator)
- [x] Several free [`{nativeloop}`][] plugins developed by MobileHero are included and available now
- [x] Build and use your own [`{nativeloop}`][] plugins easily!
- [x] Customize which [`{nativeloop}`][] plugins run per project, platform or deployment type (dev,test,prod)!
- [x] Works great with Appcelerator LiveView! (🎉 _yay!!_ 🎉)
- [x] **Enhancements for Alloy xml views**
    - [x] Supports for camelcase syntax in your Alloy xml views  (i.e. `<webView>` instead of `<WebView>` )
    - [x] Supports lowercase-dashed syntax in your Alloy views (i.e. `<web-view>` instead of `<WebView>` )
    - [x] Extra xml attributes added to Appcelerator Alloy views.  (docs coming soon)
- [x] **Enhanced UI controls!**
    - [ ] `View
    - [ ] `Button`
    - [ ] `ImageView`
    - [ ] `Label`
    - [ ] `Window`
- [x] **New UI controls!**
    - [ ] navbar - ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png)
- [x] **New libraries!**
    - [ ] navigator - `cross-platform window navigation`  ![coming soon!](https://img.shields.io/badge/coming-soon-orange.png)


## Need Help?

Please [submit an issue](https://github.com/nativeloop/nativeloop/issues) on GitHub and
provide information about your setup.


## License

[![](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

Except for otherwise noted, this project is licensed under the terms of the MIT license. This means you have full access to the
source code and can modify it to fit your own needs. 
See the [license.md](https://github.com/nativeloop/nativeloop-cli/blob/master/license.md) file.

This project uses other third party open-source tools.
Please see the [third-party.md](https://github.com/nativeloop/nativeloop-cli/blob/master/license.md)  file for more information and licenses.

## Legal

Nativeloop is developed by Superhero Studios and the community and is Copyright (c) 2017 by Superhero Studios Incorporated.  All Rights Reserved.

_Superhero Studios Incorporated and this project are in no way affiliated with any of the following companies:_

- _Appcelerator, Inc_
- _Axway Inc_
- _Apple Inc_
- _Google Inc_

Alloy is developed by Appcelerator and the community and is Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.   

Alloy is made available under the Apache Public License, version 2. See their [license](https://github.com/appcelerator/alloy/blob/master/LICENSE) file for more information.  

[alloy]: https://github.com/appcelerator/alloy  "alloy"
[npm]: https://www.npmjs.com/    "npm"
[`nativeloop`]: https://github.com/nativeloop/nativeloop-mobile  "nativeloop"
[`{nativeloop}`]: https://github.com/nativeloop/nativeloop-mobile  "nativeloop"
[`Appcelerator`]: http://www.appcelerator.com/mobile-app-development-products/ "appcelerator"
