// Name: Geolocation
// ID: samuelloufgeolocation
// Description: Get the user's current location (requires permission from browser). Not supported in desktop app or Electron packaged projects.
// By: SamuelLouf <https://scratch.mit.edu/users/samuellouf/>, Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MIT

(function (Scratch) {
  "use strict";

  /*
   * This section was changed by itswiktoragain/Wind-Z
   */

  const menuIconURI =
    "data:image/svg+xml;base64," +
    btoa(`
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="100"
  height="100"
  viewBox="0 0 100 100"
>
  <!-- Scratch-style category circle -->
  <circle
    cx="50"
    cy="50"
    r="50"
    fill="#e89b3f"
  />

  <!-- YOUR ORIGINAL SVG -->
  <svg
    x="28"
    y="17"
    width="44"
    height="66"
    viewBox="0 0 109.46334 145.24327"
    preserveAspectRatio="xMidYMid meet"
  >
    <g transform="translate(-245.26833,-77.22581)">
      <g
        fill="#fafafa"
        stroke-opacity="0.43529"
        stroke="#ffffff"
        stroke-width="12"
        stroke-miterlimit="10"
      >
        <path d="M251.26833,131.95747c0,-26.91376 21.81791,-48.73166 48.73167,-48.73166c26.91375,0 48.73168,21.81791 48.73168,48.73168c0,25.77338 -44.68945,79.96542 -48.47661,84.5116c-0.16757,0.20115 -0.35353,0.18811 -0.54161,-0.03781c-3.99605,-4.80004 -48.44512,-58.76983 -48.44512,-84.47379zM300.09407,153.3014c13.80712,0 25,-11.19288 25,-25c0,-13.80712 -11.19288,-25 -25,-25c-13.80712,0 -25,11.19288 -25,25c0,13.80712 11.19288,25 25,25z"/>
      </g>
    </g>
  </svg>
</svg>
`);

  const MOVEMENT_THRESHOLD_DEGREES = 5 * 10 ** -5; // ~5.5 meters

  /** @type {Required<PositionOptions>} */
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  };

  /** @type {number|null} */
  let latitude = null;

  /** @type {number|null} */
  let longitude = null;

  /** @type {number|null} accuracy of the position, in meters */
  let accuracy = null;

  /** @type {number|null} */
  let watcherID = null;

  /**
   * @param {PositionOptions} options
   * @returns {Promise<{
   *   latitude: number;
   *   longitude: number;
   *   accuracy: number
   * }|null>}
   */
  function getGeolocation(options) {
    return new Promise((resolve) => {
      /** @type {PositionCallback} */
      const success = (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      };

      /** @type {PositionErrorCallback} */
      const error = (err) => {
        console.warn(err);
        resolve(null);
      };

      navigator.geolocation.getCurrentPosition(
        success,
        error,
        options
      );
    });
  }

  /**
   * @param {number|null} oldLatitude
   * @param {number|null} oldLongitude
   * @param {number} newLatitude
   * @param {number} newLongitude
   * @returns {boolean}
   */
  function hasMoved(
    oldLatitude,
    oldLongitude,
    newLatitude,
    newLongitude
  ) {
    return (
      oldLatitude === null ||
      oldLongitude === null ||
      Math.abs(oldLatitude - newLatitude) >=
        MOVEMENT_THRESHOLD_DEGREES ||
      Math.abs(oldLongitude - newLongitude) >=
        MOVEMENT_THRESHOLD_DEGREES
    );
  }

  /**
   * Updates the stored position and, if it moved,
   * fires "when location changed".
   *
   * @param {{
   *   latitude: number;
   *   longitude: number;
   *   accuracy: number
   * }} coords
   */
  function updatePosition(coords) {
    const moved = hasMoved(
      latitude,
      longitude,
      coords.latitude,
      coords.longitude
    );

    latitude = coords.latitude;
    longitude = coords.longitude;
    accuracy = coords.accuracy;

    if (moved) {
      Scratch.vm.runtime.startHats(
        "samuelloufgeolocation_onUserMove"
      );
    }
  }

  /**
   * @returns {boolean}
   */
  function isElectron() {
    return navigator.userAgent.includes("Electron");
  }

  /**
   * @returns {boolean}
   */
  function isSupported() {
    return !!navigator.geolocation && !isElectron();
  }

  /**
   * @returns {Promise<boolean>}
   */
  async function canGeolocate() {
    if (!isSupported()) {
      return false;
    }

    const allowedByVM = await Scratch.canGeolocate();

    if (!allowedByVM) {
      return false;
    }

    const allowedByBrowser =
      await navigator.permissions.query({
        name: "geolocation",
      });

    return allowedByBrowser.state !== "denied";
  }

  class Geolocation {
    getInfo() {
      return {
        id: "samuelloufgeolocation",

        name: Scratch.translate("Geolocation"),

        /*
         * Requested palette:
         *
         * Light:
         * #e89b3f
         *
         * Dark:
         * #b56f1b
         */
        color1: "#e89b3f",
        color2: "#b56f1b",
        color3: "#b56f1b",

        menuIconURI,

        blocks: [
          ...(isElectron()
            ? [
                {
                  blockType: Scratch.BlockType.LABEL,
                  text: Scratch.translate(
                    "Not supported in desktop app"
                  ),
                },
              ]
            : []),

          {
            opcode: "isSupported",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate(
              "device supports geolocation?"
            ),
          },

          {
            opcode: "isAllowed",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate(
              "geolocation allowed?"
            ),
          },

          "---",

          {
            opcode: "getPositionOnce",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "get position once and wait"
            ),
          },

          {
            opcode: "getLatitude",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("latitude"),
          },

          {
            opcode: "getLongitude",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("longitude"),
          },

          {
            opcode: "getAccuracy",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "accuracy (meters)"
            ),
          },

          "---",

          {
            opcode: "onUserMove",
            blockType: Scratch.BlockType.EVENT,
            text: Scratch.translate(
              "when location changed"
            ),
            isEdgeActivated: false,
          },

          {
            opcode: "startWatching",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "start watching position"
            ),
          },

          {
            opcode: "stopWatching",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "stop watching position"
            ),
          },

          {
            opcode: "isWatchingPos",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate(
              "watching position?"
            ),
          },

          "---",

          {
            opcode: "setTimeoutTo",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "set timeout to [SECONDS] seconds"
            ),

            arguments: {
              SECONDS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10,
              },
            },
          },

          {
            opcode: "getTimeout",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate(
              "get timeout"
            ),
          },

          {
            opcode: "setAccuracy",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate(
              "set accuracy to [ACCURACY]"
            ),

            arguments: {
              ACCURACY: {
                type: Scratch.ArgumentType.STRING,
                menu: "accuracy",
              },
            },
          },

          {
            opcode: "isHighAccuracy",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate(
              "is high accuracy?"
            ),
          },
        ],

        menus: {
          accuracy: {
            acceptReporters: true,

            items: [
              {
                text: Scratch.translate("high"),
                value: "high",
              },

              {
                text: Scratch.translate("low"),
                value: "low",
              },
            ],
          },
        },
      };
    }

    async getPositionOnce() {
      if (!(await canGeolocate())) {
        return;
      }

      const result =
        await getGeolocation(options);

      if (result) {
        updatePosition(result);
      }
    }

    getLatitude() {
      return latitude === null
        ? ""
        : latitude;
    }

    getLongitude() {
      return longitude === null
        ? ""
        : longitude;
    }

    getAccuracy() {
      return accuracy === null
        ? ""
        : accuracy;
    }

    async startWatching() {
      if (
        watcherID !== null ||
        !(await canGeolocate())
      ) {
        return;
      }

      watcherID =
        navigator.geolocation.watchPosition(
          (pos) => {
            updatePosition(pos.coords);
          },

          (err) => {
            console.warn(err);
          },

          options
        );
    }

    stopWatching() {
      if (
        watcherID === null ||
        !isSupported()
      ) {
        return;
      }

      navigator.geolocation.clearWatch(
        watcherID
      );

      watcherID = null;
    }

    isWatchingPos() {
      return watcherID !== null;
    }

    async isAllowed() {
      return await canGeolocate();
    }

    isSupported() {
      return isSupported();
    }

    setTimeoutTo(args) {
      options.timeout =
        Scratch.Cast.toNumber(
          args.SECONDS
        ) * 1000;
    }

    getTimeout() {
      return options.timeout / 1000;
    }

    setAccuracy(args) {
      options.enableHighAccuracy =
        args.ACCURACY === "high";
    }

    isHighAccuracy() {
      return options.enableHighAccuracy;
    }
  }

  // @ts-ignore
  Scratch.extensions.register(
    new Geolocation()
  );

  // @ts-ignore
})(Scratch);
