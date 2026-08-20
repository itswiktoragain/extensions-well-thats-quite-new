// Name: Web Serial
// ID: itswindzwebserial
// Description: Connect to serial devices and read or write data using the Web Serial API.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Web Serial must be run unsandboxed");
  }

  const { ArgumentType, BlockType, Cast } = Scratch;
  const runtime = Scratch.vm.runtime;
  const renderer = Scratch.vm.renderer;
  const encoder = new TextEncoder();
  const MAX_TEXT = 1000000;

  const iconURI = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMTMuNDMxNDMiIGhlaWdodD0iMTExLjYzNDg4IiB2aWV3Qm94PSIwLDAsMTEzLjQzMTQzLDExMS42MzQ4OCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTI0My4xMzAxMywtOTQuMjAzMjQpIj48ZyBmaWxsPSJub25lIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiPjxnPjxwYXRoIGQ9Ik0zMDIuODg4MSwxOTYuNTg4MTFjLTIuOTMwMzQsLTIuNDcxNjUgLTEzLjkxMjcxLC0xMS42MDMzNiAtMTguNTc4NTYsLTE1LjUzODg2Yy0xLjMwNjkxLC0xLjEwMjM0IC0xLjMxMTI0LC0yLjc0MzQ3IDAuMTExMDMsLTQuNDI5NjhjOS44NDE0OSwtMTEuNjY3ODYgMzQuNzM4NTIsLTM5Ljk1NzM0IDM5Ljk2MDA3LC00Ni4xNDc4OWMxLjEyNDc5LC0xLjMzMzUzIDMuMTc3ODIsLTEuMzg3MzMgNC4zNTIzNiwtMC4zOTY2NGMyLjY3ODA0LDIuMjU4ODQgMTMuNTAwMTEsMTEuMzg2OTQgMTguNTc4NTYsMTUuNjcwNDZjMS42MjAyMywxLjM2NjYxIDEuNTg1OTUsMy41MDg1NCAwLjI2NDE2LDUuMDc1NjJjLTUuNTIwNTMsNi41NDUwMiAtMjguOTc3MDMsMzIuODM5MDMgLTM5LjMxNzgxLDQ1LjA5ODg1Yy0xLjY2MTcxLDEuOTcwMDggLTMuOTY5MjcsMS45ODEwNiAtNS4zNjk4MiwwLjc5OTczeiIgc3Ryb2tlLW9wYWNpdHk9IjAuMzA1ODgiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxOC41IiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxwYXRoIGQ9Ik0yODQuOTQ3NjgsMTY5LjAxMjk4Yy0yLjg3OTE0LC0yLjUzMTEgLTI3Ljk4MzIyLC0yNC43MjU4MSAtMzIuNTY3NTUsLTI4Ljc1NTk3Yy0xLjI4NDA4LC0xLjEyODg1IC0xLjI1NDgyLC0yLjc2OTczIDAuMjAxNjUsLTQuNDI2NDhjMTAuMDc4MiwtMTEuNDY0MDIgMjIuODQ1MzMsLTI2LjI5NDkgMjguMTkyNDcsLTMyLjM3NzI5YzEuMTUxODQsLTEuMzEwMjMgMy4yMDU1NCwtMS4zMjIwMSA0LjM1OTU2LC0wLjMwNzQ4YzIuNjMxMjUsMi4zMTMxOCAyNy41Nzc4MywyNC4zNjk0MyAzMi41Njc1NiwyOC43NTU5OGMxLjU5MTkyLDEuMzk5NDkgMS41MTM4MSwzLjU0MDI2IDAuMTYwMjQsNS4wNzk5N2MtNS42NTMzMSw2LjQzMDY4IC0xNi44MTA1LDE5LjQzMDI0IC0yNy40MDAwMSwzMS40NzU4N2MtMS43MDE2NywxLjkzNTY3IC00LjEzNzg0LDEuNzY1MTUgLTUuNTEzOTIsMC41NTU0MnoiIHN0cm9rZS1vcGFjaXR5PSIwLjMwNTg4IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTguNSIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiLz48cGF0aCBkPSJNMjc3LjExMDQ0LDE0MC41NzczOWw0LjkyNTA1LDQuMzcyODEiIHN0cm9rZS1vcGFjaXR5PSIwLjMwNTg4IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMTguNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTI4OC41Njg0MywxMjcuNjcyMzhsNC45MjUwNSw0LjM3MjgxIiBzdHJva2Utb3BhY2l0eT0iMC4zMDU4OCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjE4LjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zMDIuODg4MSwxOTYuNzE5NzFjLTIuOTMwMzQsLTIuNDcxNjUgLTEzLjkxMjcxLC0xMS43MzQ5NSAtMTguNTc4NTYsLTE1LjY3MDQ2Yy0xLjMwNjkxLC0xLjEwMjM0IC0xLjMxMTIzLC0yLjc0MzQ2IDAuMTExMDMsLTQuNDI5NjdjOS44NDE0OCwtMTEuNjY3ODYgMzQuNzM4NTIsLTM5Ljk1NzM0IDM5Ljk2MDA3LC00Ni4xNDc5YzEuMTI0NzksLTEuMzMzNTMgMy4xNzc4MSwtMS4zODczMyA0LjM1MjM2LC0wLjM5NjYzYzIuNjc4MDQsMi4yNTg4NCAxMy41MDAxMSwxMS4zODY5NCAxOC41Nzg1NiwxNS42NzA0NmMxLjYyMDIzLDEuMzY2NjEgMS41ODU5NSwzLjUwODU0IDAuMjY0MTYsNS4wNzU2MmMtNS41MjA1Myw2LjU0NTAyIC0yOC44NDU0NCwzMi45NzA2MyAtMzkuMTg2MjIsNDUuMjMwNDRjLTEuNjYxNzEsMS45NzAwOCAtNC4xMDA4NSwxLjg0OTQ3IC01LjUwMTQsMC42NjgxNXoiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxMy41IiBzdHJva2UtbGluZWNhcD0iYnV0dCIvPjxnIHN0cm9rZT0iI2ZmZmZmZiI+PHBhdGggZD0iTTI4NC45NDc2NywxNjkuMDEyOThjLTIuODc5MTQsLTIuNTMxMSAtMjcuOTgzMjIsLTI0LjcyNTgxIC0zMi41Njc1NSwtMjguNzU1OTdjLTEuMjg0MDgsLTEuMTI4ODUgLTEuMjU0ODIsLTIuNzY5NzMgMC4yMDE2NSwtNC40MjY0OGMxMC4wNzgyLC0xMS40NjQwMSAyMi44NDUzMywtMjYuMjk0OSAyOC4xOTI0NywtMzIuMzc3M2MxLjE1MTg0LC0xLjMxMDIzIDMuMjA1NTQsLTEuMzIyMDEgNC4zNTk1NiwtMC4zMDc0OGMyLjYzMTI1LDIuMzEzMTggMjcuNTc3ODIsMjQuMzY5NDMgMzIuNTY3NTUsMjguNzU1OThjMS41OTE5MiwxLjM5OTQ5IDEuNTEzODEsMy41NDAyNiAwLjE2MDI0LDUuMDc5OTZjLTUuNjUzMzEsNi40MzA2OCAtMTYuODEwNSwxOS40MzAyNCAtMjcuNDAwMDEsMzEuNDc1ODhjLTEuNzAxNjcsMS45MzU2NiAtNC4xMzc4NSwxLjc2NTE2IC01LjUxMzkzLDAuNTU1NDJ6IiBzdHJva2Utd2lkdGg9IjEzLjUiIHN0cm9rZS1saW5lY2FwPSJidXR0Ii8+PHBhdGggZD0iTTI3Ny4xMTA0NCwxNDAuNTc3MzhsNC45MjUwNSw0LjM3MjgxIiBzdHJva2Utd2lkdGg9IjEwLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yODguNTY4NDIsMTI3LjY3MjM4bDQuOTI1MDUsNC4zNzI4MSIgc3Ryb2tlLXdpZHRoPSIxMC41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L2c+PC9nPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjU2Ljg2OTg2OTA0Njc5NDQ5OjU1Ljc5Njc2NDExNzc5NTM2LS0+";

  const errorText = (error) => {
    if (error instanceof Error || error instanceof DOMException) {
      return `${error.name}: ${error.message}`;
    }
    return Cast.toString(error || Scratch.translate("Unknown serial error"));
  };

  class WebSerial {
    constructor() {
      this.port = null;
      this.reader = null;
      this.readTask = null;
      this.decoder = new TextDecoder();
      this.lastChunk = "";
      this.lastLine = "";
      this.received = "";
      this.lineBuffer = "";
      this.lastError = "";
      this.closing = false;

      runtime.on("PROJECT_STOP_ALL", () => {
        void this._disconnect(false);
      });
    }

    getInfo() {
      return {
        id: "itswindzwebserial",
        name: Scratch.translate("Web Serial"),
        docsURI: "https://extensions.turbowarp.org/itswindz/webserial",
        color1: "#72d64d",
        color2: "#58b83b",
        color3: "#428d2d",
        menuIconURI: iconURI,
        blockIconURI: iconURI,
        blocks: [
          {
            opcode: "supported",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("Web Serial supported?"),
          },
          {
            opcode: "connect",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("choose device and connect at [BAUD] baud"),
            arguments: {
              BAUD: { type: ArgumentType.NUMBER, defaultValue: 9600 },
            },
          },
          {
            opcode: "reconnect",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("reconnect allowed device at [BAUD] baud"),
            arguments: {
              BAUD: { type: ArgumentType.NUMBER, defaultValue: 9600 },
            },
          },
          {
            opcode: "connected",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("serial connected?"),
          },
          {
            opcode: "disconnect",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("disconnect serial"),
          },
          "---",
          {
            opcode: "whenConnected",
            blockType: BlockType.EVENT,
            text: Scratch.translate("when serial connected"),
            isEdgeActivated: false,
          },
          {
            opcode: "whenDisconnected",
            blockType: BlockType.EVENT,
            text: Scratch.translate("when serial disconnected"),
            isEdgeActivated: false,
          },
          {
            opcode: "whenData",
            blockType: BlockType.EVENT,
            text: Scratch.translate("when serial data received"),
            isEdgeActivated: false,
          },
          {
            opcode: "whenLine",
            blockType: BlockType.EVENT,
            text: Scratch.translate("when serial line received"),
            isEdgeActivated: false,
          },
          "---",
          {
            opcode: "lastChunkReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("last received serial chunk"),
            disableMonitor: true,
          },
          {
            opcode: "lastLineReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("last received serial line"),
            disableMonitor: true,
          },
          {
            opcode: "receivedReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("all received serial text"),
            disableMonitor: true,
          },
          {
            opcode: "clearReceived",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("clear received serial text"),
          },
          "---",
          {
            opcode: "sendText",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("send serial text [TEXT]"),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "Hello!" },
            },
          },
          {
            opcode: "sendTextEnding",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("send serial text [TEXT] ending [ENDING]"),
            arguments: {
              TEXT: { type: ArgumentType.STRING, defaultValue: "Hello!" },
              ENDING: { type: ArgumentType.STRING, menu: "lineEnding" },
            },
          },
          "---",
          {
            opcode: "vendorId",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("serial USB vendor ID"),
            disableMonitor: true,
          },
          {
            opcode: "productId",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("serial USB product ID"),
            disableMonitor: true,
          },
          {
            opcode: "lastErrorReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("last serial error"),
            disableMonitor: true,
          },
        ],
        menus: {
          lineEnding: {
            acceptReporters: true,
            items: [
              { text: Scratch.translate("none"), value: "none" },
              { text: "LF", value: "lf" },
              { text: "CRLF", value: "crlf" },
              { text: "CR", value: "cr" },
            ],
          },
        },
      };
    }

    supported() {
      return Boolean(
        navigator.serial &&
          typeof navigator.serial.requestPort === "function" &&
          typeof navigator.serial.getPorts === "function"
      );
    }

    connected() {
      return Boolean(this.port && this.port.readable && this.port.writable);
    }

    _setError(error) {
      this.lastError = errorText(error);
      console.error("Web Serial:", error);
    }

    _appendText(text) {
      if (!text) return;
      this.lastChunk = text;
      this.received += text;
      if (this.received.length > MAX_TEXT) {
        this.received = this.received.slice(-MAX_TEXT);
      }
      runtime.startHats("itswindzwebserial_whenData");

      this.lineBuffer += text;
      while (true) {
        const match = /\r\n|\r|\n/.exec(this.lineBuffer);
        if (!match) break;
        this.lastLine = this.lineBuffer.slice(0, match.index);
        this.lineBuffer = this.lineBuffer.slice(match.index + match[0].length);
        runtime.startHats("itswindzwebserial_whenLine");
      }
    }

    _requestPortFromClick() {
      return new Promise((resolve) => {
        let finished = false;
        const outer = document.createElement("div");
        outer.style.pointerEvents = "auto";
        outer.style.width = "100%";
        outer.style.height = "100%";
        outer.style.display = "flex";
        outer.style.alignItems = "center";
        outer.style.justifyContent = "center";
        outer.style.background = "rgba(0,0,0,.5)";

        const button = document.createElement("button");
        button.textContent = Scratch.translate("Choose serial device");
        button.style.font = "inherit";
        button.style.padding = "12px 18px";
        button.style.borderRadius = "10px";
        button.style.cursor = "pointer";
        outer.appendChild(button);

        const finish = (port) => {
          if (finished) return;
          finished = true;
          runtime.off("PROJECT_STOP_ALL", cancel);
          if (overlay) renderer.removeOverlay(outer);
          resolve(port);
        };
        const cancel = () => finish(null);
        runtime.on("PROJECT_STOP_ALL", cancel);

        button.addEventListener("click", async () => {
          button.disabled = true;
          try {
            finish(await navigator.serial.requestPort());
          } catch (error) {
            if (!error || error.name !== "NotFoundError") this._setError(error);
            finish(null);
          }
        });

        const overlay = renderer.addOverlay(outer, "scale");
        overlay.container.style.zIndex = "100";
        button.focus();
      });
    }

    async _open(port, baudRate) {
      if (!port) return;
      await this._disconnect(false);
      const baud = Math.max(1, Math.floor(Cast.toNumber(baudRate) || 9600));
      this.lastError = "";
      this.decoder = new TextDecoder();
      this.lineBuffer = "";
      try {
        await port.open({ baudRate: baud });
      } catch (error) {
        this._setError(error);
        return;
      }
      this.port = port;
      runtime.startHats("itswindzwebserial_whenConnected");
      this._startReading(port);
    }

    async connect(args) {
      if (!this.supported()) {
        this.lastError = Scratch.translate(
          "Web Serial is not supported in this browser"
        );
        return;
      }
      const port = await this._requestPortFromClick();
      await this._open(port, args.BAUD);
    }

    async reconnect(args) {
      if (!this.supported()) return;
      try {
        const ports = await navigator.serial.getPorts();
        if (!ports.length) {
          this.lastError = Scratch.translate(
            "No previously allowed serial device was found"
          );
          return;
        }
        await this._open(ports[0], args.BAUD);
      } catch (error) {
        this._setError(error);
      }
    }

    _startReading(port) {
      this.readTask = (async () => {
        try {
          while (this.port === port && port.readable) {
            const reader = port.readable.getReader();
            this.reader = reader;
            try {
              while (this.port === port) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                  this._appendText(this.decoder.decode(value, { stream: true }));
                }
              }
            } catch (error) {
              if (!this.closing) this._setError(error);
            } finally {
              if (this.reader === reader) this.reader = null;
              reader.releaseLock();
            }
          }
        } finally {
          if (this.port === port && !this.closing) {
            this.port = null;
            runtime.startHats("itswindzwebserial_whenDisconnected");
          }
        }
      })();
    }

    async _disconnect(notify) {
      const port = this.port;
      if (!port) return;
      this.closing = true;
      try {
        if (this.reader) await this.reader.cancel();
        if (this.readTask) await this.readTask;
        await port.close();
      } catch (error) {
        if (port.readable || port.writable) this._setError(error);
      } finally {
        if (this.port === port) this.port = null;
        this.reader = null;
        this.readTask = null;
        this.closing = false;
        if (notify) runtime.startHats("itswindzwebserial_whenDisconnected");
      }
    }

    disconnect() {
      return this._disconnect(true);
    }

    whenConnected() {}
    whenDisconnected() {}
    whenData() {}
    whenLine() {}

    lastChunkReporter() {
      return this.lastChunk;
    }

    lastLineReporter() {
      return this.lastLine;
    }

    receivedReporter() {
      return this.received;
    }

    clearReceived() {
      this.lastChunk = "";
      this.lastLine = "";
      this.received = "";
      this.lineBuffer = "";
    }

    async _write(text) {
      if (!this.port || !this.port.writable) {
        this.lastError = Scratch.translate("Serial device is not connected");
        return;
      }
      const writer = this.port.writable.getWriter();
      try {
        await writer.write(encoder.encode(text));
      } catch (error) {
        this._setError(error);
      } finally {
        writer.releaseLock();
      }
    }

    sendText(args) {
      return this._write(Cast.toString(args.TEXT));
    }

    sendTextEnding(args) {
      const endings = { none: "", lf: "\n", crlf: "\r\n", cr: "\r" };
      return this._write(
        Cast.toString(args.TEXT) + (endings[args.ENDING] || "")
      );
    }

    vendorId() {
      if (!this.port) return "";
      return this.port.getInfo().usbVendorId ?? "";
    }

    productId() {
      if (!this.port) return "";
      return this.port.getInfo().usbProductId ?? "";
    }

    lastErrorReporter() {
      return this.lastError;
    }
  }

  Scratch.extensions.register(new WebSerial());
})(Scratch);
