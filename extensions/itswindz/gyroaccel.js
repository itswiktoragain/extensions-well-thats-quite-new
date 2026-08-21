// Name: Gyroscope & Accelerometer
// ID: itswindzgyroaccel
// Description: Read gyroscope, orientation, and accelerometer data from your Android device. Only compatible with Chromium-based browsers on Android.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Gyroscope & Accelerometer must be run unsandboxed");
  }

  const { ArgumentType, BlockType, Cast } = Scratch;
  const runtime = Scratch.vm.runtime;
  const iconURI = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMDQuNDYzMjUiIGhlaWdodD0iMTA0LjQ2MzI1IiB2aWV3Qm94PSIwLDAsMTA0LjQ2MzI1LDEwNC40NjMyNSI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI0Ny43NjgzNywtOTcuNzY4MzcpIj48ZyBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiPjxwYXRoIGQ9Ik0yNDcuNzY4MzcsMTUwYzAsLTI4Ljg0NjczIDIzLjM4NDksLTUyLjIzMTYzIDUyLjIzMTYzLC01Mi4yMzE2M2MyOC44NDY3MywwIDUyLjIzMTYzLDIzLjM4NDkgNTIuMjMxNjMsNTIuMjMxNjNjMCwyOC44NDY3MyAtMjMuMzg0OSw1Mi4yMzE2MyAtNTIuMjMxNjMsNTIuMjMxNjNjLTI4Ljg0NjczLDAgLTUyLjIzMTYzLC0yMy4zODQ5IC01Mi4yMzE2MywtNTIuMjMxNjN6IiBmaWxsPSIjNzBiNGU2IiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMCIvPjxnIGZpbGw9IiNmZmZmZmYiPjxwYXRoIGQ9Ik0zMDMuMTQ1NjksMTY2Ljc1OTcybC02LjgzNjQ5LC01LjAyMjI2Yy0wLjM3ODY2LC0wLjI3OTk0IC0wLjU0MjY3LC0wLjc2NjI0IC0wLjQxMDg5LC0xLjIxODMzYzAuMTMxNzgsLTAuNDUyMDggMC41MzE0MSwtMC43NzQwOSAxLjAwMTE4LC0wLjgwNjcybDIyLjY4NTcsLTEuNTYyNDVsMC4xODMxMSwwLjAwNDIyYzAuNjE2NzEsMC4wNTg3NyAxLjA2OTI4LDAuNjA1OTUgMS4wMTEzMiwxLjIyMjc0bC0yLjA5MjUxLDIyLjE1NjI1Yy0wLjA0NDE3LDAuNDY4MjEgLTAuMzc2MDUsMC44NTkgLTAuODMwOTMsMC45Nzg0Yy0wLjQ1NDg4LDAuMTE5NDEgLTAuOTM1OTEsLTAuMDU3OTkgLTEuMjA0MzYsLTAuNDQ0MTNsLTQuMTIxMTcsLTUuOTI5OThjLTEuMTc1MTUsMC45MzA2MSAtMi41ODU4MiwxLjgxNjY0IC00LjE2NDU0LDIuNjAwMjdjLTQuMTE5MzYsMi4wNDczMyAtOS40NDgyMSwzLjQyODQ5IC0xNC44NTE3NCwzLjEwMjAyYy01LjQ1NTk0LC0wLjMyNzY3IC0xMC45ODcxNywtMi4zODUyNCAtMTUuNDQ1MDUsLTcuMjI2MmMtMS42MjQ1LC0xLjc2MjQzIC0zLjEwMjAyLC0zLjg5MzQ5IC00LjM3NDc1LC02LjQzODk1Yy0wLjI3NzYsLTAuNDY1MTIgLTAuMTgzNTMsLTEuMDYyMTMgMC4yMjM2NCwtMS40MTkzNmMwLjQwNzE3LC0wLjM1NzIzIDEuMDExMzQsLTAuMzcyODMgMS40MzY0LC0wLjAzNzA4YzYuNTU3NjEsNS4xNjA4IDEyLjIxNTMzLDYuMjk4IDE2Ljk4MjgsNS40NzcwMmM0LjI2MDMxLC0wLjczMzY0IDcuODc3MzIsLTMuMDM1NzYgMTAuODA4ODgsLTUuNDM0ODZ6IiBzdHJva2Utb3BhY2l0eT0iMC4xMjkiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxNS43MTM0Ii8+PHBhdGggZD0iTTMwMy4xNDU2OSwxNjYuNzU5NzJsLTYuODM2NDksLTUuMDIyMjZjLTAuMzc4NjYsLTAuMjc5OTQgLTAuNTQyNjcsLTAuNzY2MjQgLTAuNDEwODksLTEuMjE4MzNjMC4xMzE3OCwtMC40NTIwOCAwLjUzMTQxLC0wLjc3NDA5IDEuMDAxMTgsLTAuODA2NzJsMjIuNjg1NywtMS41NjI0NWwwLjE4MzExLDAuMDA0MjJjMC42MTY3MSwwLjA1ODc3IDEuMDY5MjgsMC42MDU5NSAxLjAxMTMyLDEuMjIyNzRsLTIuMDkyNTEsMjIuMTU1NjVjLTAuMDQ0MTcsMC40NjgyMSAtMC4zNzYwNSwwLjg1OSAtMC44MzA5MywwLjk3ODRjLTAuNDU0ODgsMC4xMTk0MSAtMC45MzU5MSwtMC4wNTc5OCAtMS4yMDQzNiwtMC40NDQxM2wtNC4xMjExNywtNS45MjkzOGMtMS4xNzUxNSwwLjkzMDYxIC0yLjU4NTgyLDEuODE2NjQgLTQuMTY0NTQsMi42MDAyN2MtNC4xMTkzNiwyLjA0NzMzIC05LjQ0ODIxLDMuNDI4NDkgLTE0Ljg1MTc0LDMuMTAyMDJjLTUuNDU1OTQsLTAuMzI3NjcgLTEwLjk4NzE3LC0yLjM4NTI0IC0xNS40NDUwNSwtNy4yMjYyYy0xLjYyNDUsLTEuNzYyNDMgLTMuMTAyMDIsLTMuODkzNDkgLTQuMzc0NzUsLTYuNDM4OTVjLTAuMjc3NiwtMC40NjUxMiAtMC4xODM1MywtMS4wNjIxMyAwLjIyMzY0LC0xLjQxOTM2YzAuNDA3MTcsLTAuMzU3MjMgMS4wMTEzNCwtMC4zNzI4MyAxLjQzNjQsLTAuMDM3MDhjNi41NTc2MSw1LjE2MDggMTIuMjE1MzMsNi4yOTggMTYuOTgyOCw1LjQ3NzAyYzQuMjYwMzEsLTAuNzMzNjQgNy44NzczMiwtMy4wMzU3NiAxMC44MDgyOCwtNS40MzQ4NnoiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjxnIGZpbGw9IiNmZmZmZmYiPjxwYXRoIGQ9Ik0yOTYuODUzNzEsMTMzLjI0MTA0bDYuODM3MDksNS4wMjIyNmMwLjM3ODY2LDAuMjc5OTQgMC41NDI2NywwLjc2NjI0IDAuNDEwODksMS4yMTgzM2MtMC4xMzE3OCwwLjQ1MjA4IC0wLjUzMTQxLDAuNzc0MDkgLTEuMDAxMTgsMC44MDY3MmwtMjIuNjg1NywxLjU2MjQ1bC0wLjE4MzExLC0wLjAwNDIyYy0wLjYxNjcxLC0wLjA1ODc3IC0xLjA2OTI4LC0wLjYwNTk1IC0xLjAxMTMyLC0xLjIyMjc0bDIuMDkxOTEsLTIyLjE1NjI1YzAuMDQzODgsLTAuNDY4NTUgMC4zNzU4OSwtMC44NTk3MyAwLjgzMTA4LC0wLjk3OTE5YzAuNDU1MTksLTAuMTE5NDUgMC45MzY1MSwwLjA1ODI5IDEuMjA0ODEsMC40NDQ5Mmw0LjEyMDU2LDUuOTI5OTdjMS4xNzU3NiwtMC45MzA2MSAyLjU4NTgyLC0xLjgxNjY0IDQuMTY0NTQsLTIuNjAwMjdjNC4xMTk5NiwtMi4wNDczMyA5LjQ0ODgxLC0zLjQyODQ5IDE0Ljg1MTc1LC0zLjEwMjAyYzUuNDU1OTQsMC4zMjc2NyAxMC45ODc3NywyLjM4NTI0IDE1LjQ0NTA0LDcuMjI2MmMxLjYyNDUsMS43NjI0MyAzLjEwMjYyLDMuODkzNDkgNC4zNzUzNSw2LjQzODk1YzAuMjc3NiwwLjQ2NTEyIDAuMTgzNTMsMS4wNjIxMyAtMC4yMjM2NCwxLjQxOTM2Yy0wLjQwNzE3LDAuMzU3MjMgLTEuMDExMzQsMC4zNzI4MyAtMS40MzYzOSwwLjAzNzA4Yy02LjU1ODIxLC01LjE2MDggLTEyLjIxNTkzLC02LjI5OCAtMTYuOTgyOCwtNS40NzcwMmMtNC4yNjAzMSwwLjczMzY0IC03Ljg3NzMyLDMuMDM1NzYgLTEwLjgwOTQ4LDUuNDM0ODZ6IiBzdHJva2Utb3BhY2l0eT0iMC4xMjkiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxNS43MTM0Ii8+PHBhdGggZD0iTTI5Ni44NTM3MSwxMzMuMjQxMDRsNi44MzcwOSw1LjAyMjI2YzAuMzc4NjYsMC4yNzk5NCAwLjU0MjY3LDAuNzY2MjQgMC40MTA4OSwxLjIxODMzYy0wLjEzMTc4LDAuNDUyMDggLTAuNTMxNDEsMC43NzQwOSAtMS4wMDExOCwwLjgwNjcybC0yMi42ODU3LDEuNTYyNDVsLTAuMTgzMTEsLTAuMDA0MjJjLTAuNjE2NzEsLTAuMDU4NzcgLTEuMDY5MjgsLTAuNjA1OTUgLTEuMDExMzIsLTEuMjIyNzRsMi4wOTE5MSwtMjIuMTU1NjVjMC4wNDM4OCwtMC40Njg1NSAwLjM3NTg5LC0wLjg1OTc0IDAuODMxMDgsLTAuOTc5MTljMC40NTUxOSwtMC4xMTk0NSAwLjkzNjUxLDAuMDU4MjkgMS4yMDQ4MSwwLjQ0NDkybDQuMTIwNTYsNS45MjkzN2MxLjE3NTc2LC0wLjkzMDYxIDIuNTg1ODIsLTEuODE2NjQgNC4xNjQ1NCwtMi42MDAyN2M0LjExOTk2LC0yLjA0NzMzIDkuNDQ4ODEsLTMuNDI4NDkgMTQuODUxNzUsLTMuMTAyMDJjNS40NTU5NCwwLjMyNzY3IDEwLjk4Nzc3LDIuMzg1MjQgMTUuNDQ1MDQsNy4yMjYyYzEuNjI0NSwxLjc2MjQzIDMuMTAyNjIsMy44OTM0OSA0LjM3NTM1LDYuNDM4OTVjMC4yNzc2LDAuNDY1MTIgMC4xODM1MywxLjA2MjEzIC0wLjIyMzY0LDEuNDE5MzZjLTAuNDA3MTcsMC4zNTcyMyAtMS4wMTEzNCwwLjM3MjgzIC0xLjQzNjM5LDAuMDM3MDhjLTYuNTU4MjEsLTUuMTYwOCAtMTIuMjE1OTMsLTYuMjk4IC0xNi45ODI4LC01LjQ3NzAyYy00LjI2MDMxLDAuNzMzNjQgLTcuODc3MzIsMy4wMzU3NiAtMTAuODA4ODgsNS40MzQ4NnoiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjUyLjIzMTYyNjY5NzI0MzI6NTIuMjMxNjI2Njk3MjQzMTQ0LS0+";

  const finiteNumber = (value) =>
    typeof value === "number" && Number.isFinite(value) ? value : 0;

  const errorText = (error) => {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    return Cast.toString(error || Scratch.translate("Unknown sensor error"));
  };

  class GyroscopeAccelerometer {
    constructor() {
      this.active = false;
      this.lastError = "";
      this.interval = 0;
      this.acceleration = { x: 0, y: 0, z: 0 };
      this.accelerationWithGravity = { x: 0, y: 0, z: 0 };
      this.rotationRate = { alpha: 0, beta: 0, gamma: 0 };
      this.orientation = { alpha: 0, beta: 0, gamma: 0 };
      this.orientationAbsolute = false;

      this._onMotion = (event) => {
        const acceleration = event.acceleration;
        const withGravity = event.accelerationIncludingGravity;
        const rotationRate = event.rotationRate;

        this.acceleration.x = finiteNumber(acceleration && acceleration.x);
        this.acceleration.y = finiteNumber(acceleration && acceleration.y);
        this.acceleration.z = finiteNumber(acceleration && acceleration.z);

        this.accelerationWithGravity.x = finiteNumber(withGravity && withGravity.x);
        this.accelerationWithGravity.y = finiteNumber(withGravity && withGravity.y);
        this.accelerationWithGravity.z = finiteNumber(withGravity && withGravity.z);

        this.rotationRate.alpha = finiteNumber(rotationRate && rotationRate.alpha);
        this.rotationRate.beta = finiteNumber(rotationRate && rotationRate.beta);
        this.rotationRate.gamma = finiteNumber(rotationRate && rotationRate.gamma);

        this.interval = finiteNumber(event.interval);
      };

      this._onOrientation = (event) => {
        this.orientation.alpha = finiteNumber(event.alpha);
        this.orientation.beta = finiteNumber(event.beta);
        this.orientation.gamma = finiteNumber(event.gamma);
        this.orientationAbsolute = Boolean(event.absolute);
      };

      runtime.on("PROJECT_STOP_ALL", () => {
        this._stop();
      });
    }

    getInfo() {
      return {
        id: "itswindzgyroaccel",
        name: Scratch.translate("Gyroscope & Accelerometer"),
        color1: "#70b4e6",
        color2: "#4d92c5",
        color3: "#38739e",
        menuIconURI: iconURI,
        blockIconURI: iconURI,
        blocks: [
          { opcode: "supported", blockType: BlockType.BOOLEAN, text: Scratch.translate("sensors supported?") },
          { opcode: "start", blockType: BlockType.COMMAND, text: Scratch.translate("start sensors") },
          { opcode: "stop", blockType: BlockType.COMMAND, text: Scratch.translate("stop sensors") },
          { opcode: "isActive", blockType: BlockType.BOOLEAN, text: Scratch.translate("sensors active?") },
          "---",
          {
            opcode: "getAcceleration",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("acceleration [AXIS] (m/s²)"),
            arguments: { AXIS: { type: ArgumentType.STRING, menu: "xyz", defaultValue: "x" } },
          },
          {
            opcode: "getAccelerationWithGravity",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("acceleration with gravity [AXIS] (m/s²)"),
            arguments: { AXIS: { type: ArgumentType.STRING, menu: "xyz", defaultValue: "x" } },
          },
          {
            opcode: "getRotationRate",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("gyroscope rotation rate [AXIS] (°/s)"),
            arguments: { AXIS: { type: ArgumentType.STRING, menu: "rotationAxes", defaultValue: "alpha" } },
          },
          {
            opcode: "getOrientation",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("orientation [AXIS] (°)"),
            arguments: { AXIS: { type: ArgumentType.STRING, menu: "rotationAxes", defaultValue: "alpha" } },
          },
          { opcode: "isOrientationAbsolute", blockType: BlockType.BOOLEAN, text: Scratch.translate("orientation absolute?") },
          { opcode: "getInterval", blockType: BlockType.REPORTER, text: Scratch.translate("motion interval (ms)") },
          "---",
          { opcode: "getLastError", blockType: BlockType.REPORTER, text: Scratch.translate("last sensor error"), disableMonitor: true },
        ],
        menus: {
          xyz: { acceptReporters: true, items: ["x", "y", "z"] },
          rotationAxes: { acceptReporters: true, items: ["alpha", "beta", "gamma"] },
        },
      };
    }

    supported() {
      return "DeviceMotionEvent" in window && "DeviceOrientationEvent" in window;
    }

    async start() {
      if (this.active) return;
      this.lastError = "";

      if (!this.supported()) {
        this.lastError = Scratch.translate("Device motion and orientation sensors are not available in this browser.");
        return;
      }

      try {
        const MotionEvent = window.DeviceMotionEvent;
        const OrientationEvent = window.DeviceOrientationEvent;

        if (typeof MotionEvent.requestPermission === "function") {
          const permission = await MotionEvent.requestPermission();
          if (permission !== "granted") throw new Error(Scratch.translate("Motion sensor permission denied"));
        }

        if (typeof OrientationEvent.requestPermission === "function") {
          const permission = await OrientationEvent.requestPermission();
          if (permission !== "granted") throw new Error(Scratch.translate("Orientation sensor permission denied"));
        }

        window.addEventListener("devicemotion", this._onMotion);
        window.addEventListener("deviceorientation", this._onOrientation);
        this.active = true;
      } catch (error) {
        this.lastError = errorText(error);
        this._stop();
      }
    }

    stop() { this._stop(); }

    _stop() {
      window.removeEventListener("devicemotion", this._onMotion);
      window.removeEventListener("deviceorientation", this._onOrientation);
      this.active = false;
    }

    isActive() { return this.active; }

    _axisValue(source, axis) {
      const key = Cast.toString(axis).toLowerCase();
      return Object.prototype.hasOwnProperty.call(source, key) ? source[key] : 0;
    }

    getAcceleration(args) { return this._axisValue(this.acceleration, args.AXIS); }
    getAccelerationWithGravity(args) { return this._axisValue(this.accelerationWithGravity, args.AXIS); }
    getRotationRate(args) { return this._axisValue(this.rotationRate, args.AXIS); }
    getOrientation(args) { return this._axisValue(this.orientation, args.AXIS); }
    isOrientationAbsolute() { return this.orientationAbsolute; }
    getInterval() { return this.interval; }
    getLastError() { return this.lastError; }
  }

  Scratch.extensions.register(new GyroscopeAccelerometer());
})(Scratch);
