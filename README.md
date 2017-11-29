# Welcome to Aerolab!

![Aerolab Welcome on a MacBook](assets/photo.jpg)

Welcome is a macOS desktop app to help onboard new hires at [Aerolab](https://aerolab.co).

Built using Electron (Javascript + Node.JS), the app guides to through the process of setting up your Mac on your first day. It covers many tasks from your computer's name and creating a private key, all the way towards logging into our Slack channel.

This app assumes the Mac has been set up with our [Mac Setup Script](https://github.com/aerolab/setup), which includes Brew, Brew Cask and a ton of extra utilities. If that's not the case, it should work fine as long as Git is properly configured.

## Config Variables

You need to create an **src/config.json** file to add the semi-secret variables you need for the app to work properly:

```json
{
  "gitlabLink" : "The link to the private GitLab",
  "sketchKey" : "The Sketch for Teams License Key",
  "whatsappLink" : "The Signup Link for the WhatsApp Group",
  "itMail" : "The mail for setting up your Private Key"
}
```

## Dev Enviroment

It's a standard Node.JS app, so as usual you first need to install all the dependencies with

```
npm install
```

And then to start the development environment you run 

```
npm run dev
```

## Building the App

To build the production app you only need to run

```
npm install
npm run build
```

After Electron does it's thing, you'll find the final version for macOS (64 bit) under the **build/** directory.

## License

MIT © Aerolab 2017
