// Name: Gemini API
// ID: itswiktoragaingeminiapi
// Description: Send prompts and system instructions to models through the Google Gemini API.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0
(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Gemini API must be run unsandboxed");
  }

  const { ArgumentType, BlockType, Cast } = Scratch;

  const getResponseText = (data) => {
    if (
      !data ||
      !Array.isArray(data.candidates) ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !Array.isArray(data.candidates[0].content.parts)
    ) {
      return "";
    }

    return data.candidates[0].content.parts
      .filter((part) => part && typeof part.text === "string")
      .map((part) => part.text)
      .join("");
  };

  const getErrorMessage = (data, fallback) => {
    if (
      data &&
      data.error &&
      typeof data.error === "object" &&
      typeof data.error.message === "string"
    ) {
      return data.error.message;
    }
    if (
      data &&
      data.promptFeedback &&
      typeof data.promptFeedback.blockReason === "string"
    ) {
      return `Prompt blocked: ${data.promptFeedback.blockReason}`;
    }
    return fallback;
  };

  class GeminiAPI {
    constructor() {
      this.apiKey = "";
      this.model = "";
      this.lastResponse = null;
      this.lastStatus = 0;
      this.lastError = "";
      this.lastSuccess = false;
    }

    getInfo() {
      return {
        id: "itswiktoragaingeminiapi",
        name: Scratch.translate("Gemini API"),
        color1: "#4285f4",
        color2: "#3367d6",
        color3: "#2851a3",
        blocks: [
          { blockType: BlockType.LABEL, text: Scratch.translate("Setup") },
          {
            opcode: "setApiKey",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("set Gemini API key [KEY]"),
            arguments: {
              KEY: {
                type: ArgumentType.STRING,
                defaultValue: "AIza...",
              },
            },
          },
          {
            opcode: "clearApiKey",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("clear Gemini API key"),
          },
          {
            opcode: "apiKeySet",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("Gemini API key set?"),
          },
          {
            opcode: "setModel",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("set Gemini model to [MODEL]"),
            arguments: {
              MODEL: {
                type: ArgumentType.STRING,
                defaultValue: "",
              },
            },
          },
          {
            opcode: "currentModel",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("Gemini model"),
          },
          "---",
          { blockType: BlockType.LABEL, text: Scratch.translate("Generate") },
          {
            opcode: "ask",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("ask Gemini [PROMPT]"),
            arguments: {
              PROMPT: {
                type: ArgumentType.STRING,
                defaultValue: "Say hello in one sentence.",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "askWithInstructions",
            blockType: BlockType.REPORTER,
            text: Scratch.translate(
              "ask Gemini with system [SYSTEM] prompt [PROMPT]"
            ),
            arguments: {
              SYSTEM: {
                type: ArgumentType.STRING,
                defaultValue: "Be concise.",
              },
              PROMPT: {
                type: ArgumentType.STRING,
                defaultValue: "Explain what Scratch is.",
              },
            },
            disableMonitor: true,
          },
          {
            opcode: "askUsingModel",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("ask Gemini [PROMPT] using [MODEL]"),
            arguments: {
              PROMPT: {
                type: ArgumentType.STRING,
                defaultValue: "Write a short greeting.",
              },
              MODEL: {
                type: ArgumentType.STRING,
                defaultValue: "",
              },
            },
            disableMonitor: true,
          },
          "---",
          { blockType: BlockType.LABEL, text: Scratch.translate("Response") },
          {
            opcode: "lastJSON",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("last Gemini response JSON"),
            disableMonitor: true,
          },
          {
            opcode: "lastStatusReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("last Gemini HTTP status"),
          },
          {
            opcode: "lastErrorReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("last Gemini error"),
          },
          {
            opcode: "lastSuccessReporter",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("last Gemini request succeeded?"),
          },
        ],
      };
    }

    setApiKey(args) {
      this.apiKey = Cast.toString(args.KEY).trim();
    }

    clearApiKey() {
      this.apiKey = "";
    }

    apiKeySet() {
      return this.apiKey.length > 0;
    }

    setModel(args) {
      const model = Cast.toString(args.MODEL).trim();
      if (model) this.model = model;
    }

    currentModel() {
      return this.model;
    }

    ask(args) {
      return this.request(args.PROMPT, "", this.model);
    }

    askWithInstructions(args) {
      return this.request(args.PROMPT, args.SYSTEM, this.model);
    }

    askUsingModel(args) {
      return this.request(args.PROMPT, "", args.MODEL);
    }

    async request(promptValue, instructionsValue, modelValue) {
      this.lastResponse = null;
      this.lastStatus = 0;
      this.lastError = "";
      this.lastSuccess = false;

      if (!this.apiKey) {
        this.lastError = Scratch.translate("Set a Gemini API key first.");
        return "";
      }

      const prompt = Cast.toString(promptValue);
      const instructions = Cast.toString(instructionsValue);
      const model = Cast.toString(modelValue).trim() || this.model;

      if (!model) {
        this.lastError = Scratch.translate("Set a Gemini model first.");
        return "";
      }
      const body = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      };

      if (instructions) {
        body.systemInstruction = {
          parts: [{ text: instructions }],
        };
      }

      const encodedModel = encodeURIComponent(model);
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent`;

      try {
        const response = await Scratch.fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey,
          },
          body: JSON.stringify(body),
        });

        this.lastStatus = response.status;
        const responseText = await response.text();
        let data = null;

        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch {
            this.lastError = Scratch.translate("Gemini returned invalid JSON.");
            return "";
          }
        }

        this.lastResponse = data;

        if (!response.ok) {
          this.lastError = getErrorMessage(
            data,
            `HTTP ${response.status} ${response.statusText}`.trim()
          );
          return "";
        }

        const text = getResponseText(data);
        if (!text) {
          this.lastError = getErrorMessage(
            data,
            Scratch.translate("The Gemini response did not contain text.")
          );
          return "";
        }

        this.lastSuccess = true;
        return text;
      } catch (error) {
        this.lastError =
          error && typeof error.message === "string"
            ? error.message
            : String(error);
        return "";
      }
    }

    lastJSON() {
      return this.lastResponse === null ? "" : JSON.stringify(this.lastResponse);
    }

    lastStatusReporter() {
      return this.lastStatus;
    }

    lastErrorReporter() {
      return this.lastError;
    }

    lastSuccessReporter() {
      return this.lastSuccess;
    }
  }

  Scratch.extensions.register(new GeminiAPI());
})(Scratch);
