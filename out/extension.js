"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const openai_1 = require("openai");
const utils_1 = require("./utils");
const COPY_OUTPUT = "Copy Output";
const initOpenAI = (credentials) => {
    const openaiConfig = new openai_1.Configuration({
        ...credentials
    });
    return new openai_1.OpenAIApi(openaiConfig);
};
// This method is called when the extension is activated
async function activate(context) {
    console.log('Activated');
    const credentials = await (0, utils_1.initAuth)(context);
    if (!credentials) {
        deactivate();
        return;
    }
    const openai = initOpenAI(credentials);
    const statusBarItem = (0, utils_1.buildStatusBarItem)();
    statusBarItem.show();
    const modalMesesageOptions = {
        "modal": true,
        "detail": "- Palantíri"
    };
    // Create documentation for highlighted code
    let createTest = vscode.commands.registerCommand('GPT.createtest', async () => {
        console.log('Generating Unit test');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showWarningMessage('No selected text');
            return;
        }
        let fileExtension = (0, utils_1.getFileExtension)(editor.document.fileName);
        statusBarItem.hide();
        const statusMessage = vscode.window.setStatusBarMessage('$(heart) Generating your Unit Test! $(book)');
        const prompt = `Write an unit test file for ${fileExtension} code, Your response should include ONLY CODE and VALID C++, Your response should be in google test library.
Code: 
${selectedText}

`;
        let payload = (0, utils_1.createPayload)('text', prompt);
        let { isValid, reason } = (0, utils_1.validatePayload)(payload);
        if (!isValid) {
            vscode.window.showErrorMessage(reason);
            deactivate();
        }
        ;
        const response = await openai.completions.create({ ...payload });
        const output = response.choices[0].text?.trim();
        if (response.data.usage?.total_tokens && response.data.usage?.total_tokens >= payload.max_tokens) {
            vscode.window.showErrorMessage(`The completion was ${response.data.usage?.total_tokens} tokens and exceeds your max_token value of ${payload.max_tokens}. Please increase your settings to allow for longer completions.`);
        }
        // Insert the text at the start of the selection
        const doc = await vscode.workspace.openTextDocument({
            content: response.choices[0].text?.trim(),
        });
        await vscode.window.showTextDocument(doc);
        statusMessage.dispose();
        statusBarItem.show();
    });
    // Create documentation for highlighted code
    let createDocumentation = vscode.commands.registerCommand('GPT.createDocs', async () => {
        console.log('Running createDocs');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showWarningMessage('No selected text');
            return;
        }
        let fileExtension = (0, utils_1.getFileExtension)(editor.document.fileName);
        statusBarItem.hide();
        const statusMessage = vscode.window.setStatusBarMessage('$(heart) Generating your Unit Test! $(book)');
        const prompt = `Write ${fileExtension} doc comments for the code
Code: 
${selectedText}
			
Doc comments:
`;
        let payload = (0, utils_1.createPayload)('text', prompt);
        let { isValid, reason } = (0, utils_1.validatePayload)(payload);
        if (!isValid) {
            vscode.window.showErrorMessage(reason);
            deactivate();
        }
        ;
        const response = await openai.completions.create({ ...payload });
        const output = response.choices[0].text?.trim();
        if (response.data.usage?.total_tokens && response.data.usage?.total_tokens >= payload.max_tokens) {
            vscode.window.showErrorMessage(`The completion was ${response.data.usage?.total_tokens} tokens and exceeds your max_token value of ${payload.max_tokens}. Please increase your settings to allow for longer completions.`);
        }
        // Insert the text at the start of the selection
        editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.start, `${output}\n`);
        });
        statusMessage.dispose();
        statusBarItem.show();
    });
    // Create code for highlighted documentation
    let createCodeFromDocumentation = vscode.commands.registerCommand('GPT.createCodeFromDocs', async () => {
        console.log('Running createCodeFromDocs');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showWarningMessage('No selected text');
            return;
        }
        let fileExtension = (0, utils_1.getFileExtension)(editor.document.fileName);
        statusBarItem.hide();
        const statusMessage = vscode.window.setStatusBarMessage('$(heart) Generating your code! $(code)');
        const prompt = `Write ${fileExtension} code to satisfy these doc comments. 
Doc comments: 
${selectedText}
				
Code:
`;
        let payload = (0, utils_1.createPayload)('code', prompt);
        let { isValid, reason } = (0, utils_1.validatePayload)(payload);
        if (!isValid) {
            vscode.window.showErrorMessage(reason);
            deactivate();
        }
        ;
        const response = await openai.completions.create({ ...payload });
        const output = response.choices[0].text?.trim();
        if (response.data.usage?.total_tokens && response.data.usage?.total_tokens >= payload.max_tokens) {
            vscode.window.showErrorMessage(`The completion was ${response.data.usage?.total_tokens} tokens and exceeds your max_token value of ${payload.max_tokens}. Please increase your settings to allow for longer completions.`);
        }
        // Insert the text at the start of the selection
        editor.edit((editBuilder) => {
            editBuilder.insert(editor.selection.end, `\n${output}`);
        });
        statusMessage.dispose();
        statusBarItem.show();
    });
    // Create a suggested alt+ctrlernative to highlight code with an explanation
    let suggestImprovement = vscode.commands.registerCommand('GPT.suggestImprovement', async () => {
        console.log('Running suggestImprovement');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
            vscode.window.showWarningMessage('No selected text');
            return;
        }
        let fileExtension = (0, utils_1.getFileExtension)(editor.document.fileName);
        statusBarItem.hide();
        const statusMessage = vscode.window.setStatusBarMessage('$(heart) Generating your suggestion! $(edit)');
        const prompt = `Improve the Original ${fileExtension} code. 
Provde Suggested ${fileExtension} code and an explanation for why it is better.
Original code: 
${selectedText}

Suggested code:
`;
        let payload = (0, utils_1.createPayload)('text', prompt);
        let { isValid, reason } = (0, utils_1.validatePayload)(payload);
        if (!isValid) {
            vscode.window.showErrorMessage(reason);
            deactivate();
        }
        ;
        const response = await openai.completions.create({ ...payload });
        if (response.data.usage?.total_tokens && response.data.usage?.total_tokens >= payload.max_tokens) {
            vscode.window.showErrorMessage(`The completion was ${response.data.usage?.total_tokens} tokens and exceeds your max_token value of ${payload.max_tokens}. Please increase your settings to allow for longer completions.`);
        }
        const output = response.choices[0].text?.trim() || "A response is not available right now.";
        let items = [
            {
                "title": COPY_OUTPUT
            }
        ];
        const gptResponse = vscode.window.showInformationMessage(output, modalMesesageOptions, ...items);
        gptResponse.then((button) => {
            if (button?.title === COPY_OUTPUT) {
                vscode.env.clipboard.writeText(output);
            }
        });
        statusMessage.dispose();
        statusBarItem.show();
    });
    // Directly write a prompt for GPT
    let ask = vscode.commands.registerCommand('GPT.ask', async () => {
        console.log('Running ask');
        const inputBoxOptions = {
            "title": "Palantíri!",
            "prompt": "Enter in the text you would like to send to Palantíri"
        };
        const prompt = await vscode.window.showInputBox(inputBoxOptions);
        if (!prompt) {
            vscode.window.showWarningMessage('No input received.');
            return;
        }
        statusBarItem.hide();
        const statusMessage = vscode.window.setStatusBarMessage('$(heart) Sending to Palantíri! $(hubot)');
        let payload = (0, utils_1.createPayload)('text', prompt);
        let { isValid, reason } = (0, utils_1.validatePayload)(payload);
        if (!isValid) {
            vscode.window.showErrorMessage(reason);
            deactivate();
        }
        ;
        const response = await openai.completions.create({ ...payload });
        if (response.data.usage?.total_tokens && response.data.usage?.total_tokens >= payload.max_tokens) {
            vscode.window.showErrorMessage(`The completion was ${response.data.usage?.total_tokens} tokens and exceeds your max_token value of ${payload.max_tokens}. Please increase your settings to allow for longer completions.`);
        }
        const output = response.choices[0].text?.trim() || "A response is not available right now.";
        let items = [
            {
                "title": COPY_OUTPUT
            }
        ];
        const gptResponse = vscode.window.showInformationMessage(output, modalMesesageOptions, ...items);
        gptResponse.then((button) => {
            if (button?.title === COPY_OUTPUT) {
                vscode.env.clipboard.writeText(output);
            }
        });
        statusMessage.dispose();
        statusBarItem.show();
    });
    // Update OpenAI API Key
    let updateAPIKey = vscode.commands.registerCommand('GPT.updateAPIKey', async () => {
        console.log('Running updateAPIKey');
        statusBarItem.hide();
        const statusMessage = vscode.window.setStatusBarMessage('$(heart) Securely storing your API Key $(pencil)');
        await (0, utils_1.setNewAPIKey)(context);
        statusMessage.dispose();
        statusBarItem.show();
    });
    // Remove OpenAI API Key
    let removeAPIKey = vscode.commands.registerCommand('GPT.removeAPIKey', async () => {
        console.log('Running removeAPIKey');
        statusBarItem.hide();
        const statusMessage = vscode.window.setStatusBarMessage('$(heart) Securely REMOVING your API Key $(error)');
        await context.secrets.delete(utils_1.OPENAI_API_KEY);
        statusMessage.dispose();
        statusBarItem.show();
    });
    context.subscriptions.push(createDocumentation, createCodeFromDocumentation, suggestImprovement, ask, updateAPIKey, removeAPIKey);
}
exports.activate = activate;
;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map