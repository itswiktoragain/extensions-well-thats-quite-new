// Name: OpenAI API
// ID: itswiktoragainopenaiapi
// Description: Send prompts and system instructions to models through the OpenAI API.
// By: Wind-Z <https://scratch.mit.edu/users/wind-z/>
// License: MPL-2.0
(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("OpenAI API must be run unsandboxed");
  }

  const { ArgumentType, BlockType, Cast } = Scratch;

  const getResponseText = (data) => {
    if (!data || typeof data !== "object") return "";
    if (typeof data.output_text === "string") return data.output_text;
    if (!Array.isArray(data.output)) return "";

    const parts = [];
    for (const output of data.output) {
      if (!output || !Array.isArray(output.content)) continue;
      for (const content of output.content) {
        if (content && typeof content.text === "string") {
          parts.push(content.text);
        }
      }
    }
    return parts.join("");
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
    return fallback;
  };

  class OpenAIAPI {
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
        id: "itswiktoragainopenaiapi",
        name: Scratch.translate("OpenAI API"),
        color1: "#10a37f",
        color2: "#0d8c6d",
        color3: "#0a735a",
        blocks: [
          { blockType: BlockType.LABEL, text: Scratch.translate("Setup") },
          {
            opcode: "setApiKey",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("set OpenAI API key [KEY]"),
            arguments: {
              KEY: {
                type: ArgumentType.STRING,
                defaultValue: "sk-...",
              },
            },
          },
          {
            opcode: "clearApiKey",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("clear OpenAI API key"),
          },
          {
            opcode: "apiKeySet",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("OpenAI API key set?"),
          },
          {
            opcode: "setModel",
            blockType: BlockType.COMMAND,
            text: Scratch.translate("set OpenAI model to [MODEL]"),
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
            text: Scratch.translate("OpenAI model"),
          },
          "---",
          { blockType: BlockType.LABEL, text: Scratch.translate("Generate") },
          {
            opcode: "ask",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("ask OpenAI [PROMPT]"),
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
              "ask OpenAI with system [SYSTEM] prompt [PROMPT]"
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
            text: Scratch.translate("ask OpenAI [PROMPT] using [MODEL]"),
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
            text: Scratch.translate("last OpenAI response JSON"),
            disableMonitor: true,
          },
          {
            opcode: "lastStatusReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("last OpenAI HTTP status"),
          },
          {
            opcode: "lastErrorReporter",
            blockType: BlockType.REPORTER,
            text: Scratch.translate("last OpenAI error"),
          },
          {
            opcode: "lastSuccessReporter",
            blockType: BlockType.BOOLEAN,
            text: Scratch.translate("last OpenAI request succeeded?"),
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
        this.lastError = Scratch.translate("Set an OpenAI API key first.");
        return "";
      }

      const prompt = Cast.toString(promptValue);
      const instructions = Cast.toString(instructionsValue);
      const model = Cast.toString(modelValue).trim() || this.model;

      if (!model) {
        this.lastError = Scratch.translate("Set a OpenAI model first.");
        return "";
      }
      const body = {
        model,
        input: prompt,
      };
      if (instructions) body.instructions = instructions;

      try {
        const response = await Scratch.fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
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
            this.lastError = Scratch.translate("OpenAI returned invalid JSON.");
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
          this.lastError = Scratch.translate(
            "The OpenAI response did not contain text."
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

  Scratch.extensions.register(new OpenAIAPI());
})(Scratch);
