// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "contextcad-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('contextcad-vscode.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from contextcad-vscode!');
	});

	vscode.debug.onDidStartDebugSession((d: vscode.DebugSession) => {
		console.log(d);
		vscode.window.showInformationMessage("we are starting a debug session");
	});

	vscode.tasks.onDidStartTaskProcess((e) => {vscode.window.showInformationMessage("this is progress");});
	vscode.tasks.onDidEndTask((e) => {vscode.window.showInformationMessage("another test");});

	vscode.debug.onDidReceiveDebugSessionCustomEvent(event => {
		vscode.window.showInformationMessage("we are here!");
		// v = vscode.debug.activeDebugSession?.customRequest("evaluate", {"expression": "print(a)"});
		console.log(event);
		if(event.event === 'stopped') {
			vscode.window.showInformationMessage("we are stopped!");
		}
		if(event.event === "exited") {
			vscode.window.showInformationMessage("we are exiting");
		}
	});

	vscode.tasks.onDidStartTask((e) => {
		vscode.window.showInformationMessage("ok this is cool!");
	});

	vscode.debug.onDidChangeActiveDebugSession(event => {
		vscode.window.showInformationMessage("in change");
	});




	vscode.extensions.getExtension("ms-python.python")?.activate().then((val) => {
		
		// vscode.extensions.getExtension("ms-python.python")?.exports
		vscode.window.showInformationMessage('ok ok!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
