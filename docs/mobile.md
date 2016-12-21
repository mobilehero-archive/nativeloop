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

# ⚡[`{nativeloop}`](#nativeloop)⚡

[![npm version](https://badge.fury.io/js/%40nativeloop%2Fmobile.svg)](https://badge.fury.io/js/%40nativeloop%2Fmobile)
[![](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

<!-- TOC depthFrom:2 depthTo:6 insertAnchor:false orderedList:false updateOnSave:true withLinks:true -->

- [Overview](#overview)
	- [What is [`{nativeloop}`][]?](#what-is-nativeloop)
	- [So what makes [`{nativeloop}`][] so awesome?](#so-what-makes-nativeloop-so-awesome)
- [Quick(est) Start](#quickest-start)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [{nativeloop} Plugins](#nativeloop-plugins)
- [Need Help?](#need-help)
- [License](#license)
- [Legal](#legal)

<!-- /TOC -->

## Overview

### What is [`{nativeloop}`][]?

[`{nativeloop}`] is a framework for building awesome native apps using node.js style javascript. 
It provides developers with access to an extremely rapid development process 
without compromising on the delivered product.

[`{nativeloop}`][] is open-source (MIT) and is built upon the open-source version of [`appcelerator`][]
and other open-source products.  If you like what you see, contribute to this and other open-source projects!

### So what makes [`{nativeloop}`][] so awesome?

[`{nativeloop}`][] enables all features available through use of the Appcelerator Titantium product
and adds many other cool features (and some undocumented hidden gems)!


- [x] ES2015/ES6 support (using babel transformations)
- [ ] Supports Javascript promises (using bluebird but can be replaced with your own)
- [x] Uses the latest version of lodash, instead of older version of underscore.js
- [x] Supports installation of modules for your app using [`npm`][]
- [x] Does not require replacing Alloy (globally or per build of appcelerator)
- [x] Several free [`{nativeloop}`][] plugins developed by MobileHero are included and available now
- [x] Build and use your own [`{nativeloop}`][] plugins easily!
- [x] Customize which [`{nativeloop}`][] plugins run per project, platform or deployment type (dev,test,prod)!
- [x] Works great with Appcelerator LiveView! (🎉 _yay!!_ 🎉)
- [x] Support for lowercase-dashed syntax in your Alloy views


## Quick(est) Start

> **:soon: Not available yet, but coming very soon!!**

Using [`{nativeloop}`][] cli from npm.  [![npm version](https://badge.fury.io/js/nativeloop.svg)](https://badge.fury.io/js/nativeloop) 

**New mobile project**

```bash
npm install -g nativeloop
native create app --id my.demo --name demo
```

**Existing mobile project**

```bash
npm install -g nativeloop
native init
```


## Quick Start

> _These scripts should be run in the root directory of your [`{nativeloop}`][] mobile project
(the directory containing `tiapp.xml`)._

This is a temporary work-around until the [`{nativeloop}`][] command-line tool is available.

**New mobile project**

```bash

npm install -g alloy
npm install -g titanium
ti create --type app -p all --wordspace-dir . --url http://nativeloop.com --id my.demo --name demo
alloy new demo
cd demo
npm init --force
npm install --save @nativeloop/mobile
npm install --save alloy-widget-nativeloop
```

**Existing mobile project**

```bash

cd <directory of your app>
npm install --save @nativeloop/mobile
npm install --save alloy-widget-nativeloop
```

## Usage

> **:soon: Coming Soon!**

## {nativeloop} Plugins 

> **:soon: Coming Soon!**


## Need Help?

Please [submit an issue](https://github.com/nativeloop/nativeloop-mobile/issues) on GitHub and 
provide information about your setup.


## License

[![](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)]()

This project is licensed under the terms of the MIT license. This means you have full access to the
source code and can modify it to fit your own needs. 
See the [license.md](https://github.com/nativeloop/nativeloop-mobile/blob/master/license.md) file.

## Legal

Nativeloop is developed by Superhero Studios and the community and is Copyright (c) 2016 by Superhero Studios Incorporated.  All Rights Reserved.

_Superhero Studios Incorporated and this project are in no way affiliated with any of the following companies:_

- _Appcelerator, Inc_
- _Axway Inc_
- _Apple Inc_
- _Google Inc_

Alloy is developed by Appcelerator and the community and is Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.   

Alloy is made available under the Apache Public License, version 2. See their [LICENSE](https://github.com/appcelerator/alloy/blob/master/LICENSE) file for more information.  

[alloy]: https://github.com/appcelerator/alloy  "alloy"
[npm]: https://www.npmjs.com/    "npm"
[`nativeloop`]: https://github.com/nativeloop/nativeloop-mobile  "nativeloop"
[`{nativeloop}`]: https://github.com/nativeloop/nativeloop-mobile  "nativeloop"
[`Appcelerator`]: http://www.appcelerator.com/mobile-app-development-products/ "appcelerator"