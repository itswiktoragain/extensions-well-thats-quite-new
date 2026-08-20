# Web Serial

The Web Serial extension lets TurboWarp projects communicate with hardware that exposes a serial port, such as many Arduino-compatible boards, ESP32 boards, USB-to-serial adapters, and devices that expose a virtual serial port.

## Browser support

Web Serial requires a browser that supports the Web Serial API and a secure context. The extension includes a **Web Serial supported?** block so projects can check before trying to connect.

## Connecting

Use **choose device and connect at (9600) baud**. The extension shows a small TurboWarp dialog first. Click **Choose serial device** in that dialog to open the browser's serial-device picker. The extra click is required by browser security rules.

After a device has been allowed once, **reconnect allowed device at (9600) baud** can reconnect to the first previously permitted device without opening the browser picker again.

Most simple devices use 9600 or 115200 baud. Use the baud rate required by your device.

## Receiving data

**when serial data received** runs whenever a new chunk of text arrives. Use **last received serial chunk** to read that chunk.

**when serial line received** runs when LF, CRLF, or CR completes a line. Use **last received serial line** to read the completed line without its line ending.

**all received serial text** contains recent received text. To avoid unlimited memory use, the extension keeps at most the most recent 1,000,000 characters.

## Sending data

**send serial text (Hello!)** sends text exactly as entered.

**send serial text (Hello!) ending (LF)** can append no line ending, LF, CRLF, or CR. Many microcontroller sketches wait for a line ending before processing a command.

## Troubleshooting

If a connection fails, check **last serial error**. Also make sure no other program, browser tab, serial monitor, or IDE currently has the same serial port open.

The Web Serial API is documented by MDN: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API>
