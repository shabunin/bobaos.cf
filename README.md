# bobaos.cf - js module to control KNX datapoints

## Intro

This module will allow you to control KNX datapoints with help of [Weinzirl BAOS modules](https://weinzierl.de/index.php/en/all-knx/knx-module-en)

## Hardware installation

Quick start can be done with Raspberry Pi and Weinzierl KNX BAOS 838 kBerry module installed.

Download image for Raspberry: [261218_raspbianBobaos](https://drive.google.com/file/d/1au5h-BIoJlb7irvMgZ08hFaJVf2cnjVl/view?usp=sharing)

This image is based on Raspbian Lite with enables ssh, configured UART, installed nodejs and bobaos packages: bobaos.pub, bobaos.tool and bobaos.ws.

So, just insert sd card to Raspberry and proceed to next steps.

## ETS configuration

Configure BAOS datapoints in ETS tool, using BAOS 830 application. If necessary, reboot raspberry pi.

## iViewer

Download this repo to your pc, open `assets/js/userMain.js` function to change ip address of your RasspberryPi and to read/change js code.

Controlling datapoints in this example done mainly via JavaScript. As an example, there is also button with gui assignment for command `toggleDatapoint`. So, it is possible to assign functions from userMain.js like `toggleDatapoint`, `increaseSetpointBy`, `sendDirectValue` to gui elements.

For feedbacks use `bobaosCallback` and `processOneValue` function.

This example don't cover all bobaos features, so, if you are interested, you can study `assets/js/wsClient.js` file.
