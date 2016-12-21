<h3 align="center">
  <img src="https://cdn.secure-api.org/images/nativeloop_logo_text_256.png" alt="nativeloop logo" />
</h3>

 <div align="center">⚡ Developing native apps just got a whole lot more awesome ⚡</div>

---


```javascript
const status = "Pre-Production Beta!";
const warning = "Breaking changes may be introduced before 1.0.0 release";

developer.read(warning)
	.then(developer.code)
	.then(developer.😀);

```

---

# ⚡ nativeloop ⚡

[![npm version](https://badge.fury.io/js/nativeloop.svg)](https://badge.fury.io/js/nativeloop) ➖
[![](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

<!-- TOC depthFrom:2 depthTo:6 insertAnchor:false orderedList:false updateOnSave:true withLinks:true -->

- [Overview](#overview)
	- [What is nativeloop?](#what-is-nativeloop)
		- [Features](#features)
	- [How is this different than Adamantium?](#how-is-this-different-than-adamantium)
	- [So what makes nativeloop so awesome?](#so-what-makes-nativeloop-so-awesome)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Templated Parameters](#templated-parameters)
- [Alloy+ Plugins](#alloy-plugins)
- [Need Help?](#need-help)
- [License](#license)
- [Legal](#legal)

<!-- /TOC -->

## Overview

### What is nativeloop?

[`nativeloop`][] is a framework for building awesome native apps using node.js style javascript. 
It provides developers with access to an extremely rapid development process 
without comprimising on the delivered product.


####Features

- Support for lowercase-dashed syntax in your Alloy views
- 


[`nativeloop`][] is an entire framework built around 
[Appcelerator Mobile](http://www.appcelerator.com/mobile-app-development-products/) and their [Alloy][] product. 
The idea for this framework was built upon the concepts of [MobileHero Adamantium](https://github.com/mobilehero/adamantium) 
and a desire to customize and extend Appcelerator Alloy for developers.  How much faster or stronger all depends on YOU, the developer.  

There will be an assortment of alloy+ plugins (available as npm modules) that you can install 
in your project to help you take your existing development tools furthur 
than possible today.  You can choose which modules are executed in your `config.json` file 
(which is part of your Alloy project).  You can also easily create your own plugins by simply 
creating a npm module that follows a simple convention.  

### How is this different than Adamantium?

[Adamantium](https://github.com/mobilehero/adamantium) is a custom build of [Appcelerator Alloy](https://github.com/appcelerator/alloy). 
This was our first _(well, maybe not the first...)_ attempt to add features and capabilities to Alloy that were not necessarily on Appcelerator's 
Roadmap for the product.  Keeping Adamantium up-to-date was, however, was becoming more difficult with merges and was not a sustainable model.

[Alloy+][] is a framework for modifying your app and code during the Alloy build process. 
Both accomplish getting new features and capabilities into your app. 
When using alloy+, builds may take slightly longer and we are also limited 
to working within the available build hooks made available by Appcelerator.  

### So what makes nativeloop so awesome?

Alloy+ has many features that couldn't be implemented easily using Adamantium!

* Does not require replacing Alloy (globally or per build of appcelerator)
* Several free Alloy+ plugin developed by MobileHero and available now
* Build and use your own Alloy+ plugin easily!
* Customize which Alloy+ plugins run per project, platform or deployment type (dev,test,prod)!
* Works great with Appcelerator LiveView! (🎉 _yay!!_ 🎉)


## Quick Start

> _All modules should be installed in the root directory of your Appcelerator mobile project (the directory containing `tiapp.xml`)._

[![npm version](https://badge.fury.io/js/nativeloop.svg)](https://badge.fury.io/js/nativeloop)

```bash
npm install --save nativeloop
```

## Usage

To use plugins in your app, add entries for your plugins to your app's `config.json` file:

```json
	{
	"tasks": [
		"@aplus/npm",
		"@aplus/underscore",
		"@aplus/babel",
		"@aplus/node",
		{
			"module": "some-other-aplus-plugin",
			"dirname": "${event.dir.lib}",
			"args": ["these", "are", "my", "args"]
		}
	],
	}
```

## Templated Parameters

You can use templated parameters in your variables (if supported by your plugin). 
The following parameters are passed to every plugin and can be used in templating:


| property  	|   description	|
|---	|---	|
|  `event` 	|   The `event` object provides a set of objects and values which may be useful for building tasks. The object comes from the [`alloy.jmk` build task](https://wiki.appcelerator.org/pages/viewpage.action?pageId=35620079).	  **NOTE:**  There is an additional property not found in the original event object -- `event.dir.resourcesPlatform`.  This property is the platorm specific directory under the Alloy project's `Resource` directory (i.e. /Resources/iphone).|
|  `config` 	|   The `config` object is the result of the [`config.json` file](https://wiki.appcelerator.org/pages/viewpage.action?pageId=35620077) after it has been processed by Alloy (to handle themes/platforms/etc).	|
|  `logger` 	|   The `logger` object provides a reference to the logger.  See the [Appcelerator alloy.jmk wiki page](https://wiki.appcelerator.org/pages/viewpage.action?pageId=35620079) for a list of methods and properties.	|
|  `code` 	|   The `code` object is the source code of an module before it is parsed by uglifyjs in Alloy.  This is only available in the alloy+ *exclusive* event: `preparse`.	|


## Alloy+ Plugins 

> **Coming Soon! :mega:**

- [`npm`][]: Execute npm during the Alloy build process
- [`babel`][]: Run babel transformations on your code during the build process
- [`es6`][]: Use ES6/ES2015 code in your apps via babel transformations!
- [`node`][]: Make `require` statements in your app support nodejs packages installed via npm
- [`underscore`][]: Fix some issues with the usage of underscore in Alloy and allow upgrading to lodash


## Need Help?

Please [submit an issue](https://github.com/mobilehero/aplus-core/issues) on GitHub and provide information about your setup.


## License

[![](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

This project is licensed under the terms of the MIT license. This means you have full access to the source code and can modify it to fit your own needs. 
See the [license.md](https://github.com/mobilehero/aplus-core/blob/master/license.md) file.

## Legal

_Superhero Studios Incorporated and this project are in no way affiliated with any of the following companies:_

- _Appcelerator, Inc_
- _Axway Inc_
- _Apple Inc_
- _Google Inc_

Alloy is developed by Appcelerator and the community and is Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.   
Alloy is made available under the Apache Public License, version 2. See their [LICENSE](https://github.com/appcelerator/alloy/blob/master/LICENSE) file for more information.  

[alloy]: https://github.com/appcelerator/alloy  "alloy"
[npm]: https://www.npmjs.com/    "npm"
[`nativeloop`]: https://github.com/mobilehero/nativeloop  "Nativeloop"
[`node`]: https://github.com/mobilehero/aplus-node  "node"
[`babel`]: https://github.com/mobilehero/aplus-babel  "babel"
[`es6`]: https://github.com/mobilehero/aplus-es6  "es6"
[`underscore`]: https://github.com/mobilehero/aplus-underscore  "underscore"
[`npm`]: https://github.com/mobilehero/aplus-npm  "npm"
