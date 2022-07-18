// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as  path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let panel: vscode.WebviewPanel | undefined = undefined;
	const modulesPath = path.join(context.extensionPath, 'node_modules');
	const threeCadViewerPath = path.join(modulesPath, 'three-cad-viewer', 'dist');
	const staticPath = path.join(context.extensionPath, 'static');
	const viewerOptions = {
		theme: 'browser',
		glass: true,
		control: 'trackball'			
	}

	function init() {
		if (panel) {
			panel.reveal(vscode.ViewColumn.Two);
		} else {
			panel = vscode.window.createWebviewPanel(
				'cadQuery', 'CadQuery view', vscode.ViewColumn.Two, {
					enableScripts: true,
					localResourceRoots: [
						vscode.Uri.file(threeCadViewerPath),
						vscode.Uri.file(staticPath)
					]
				}
			);

			const cqViewerPath = path.join(staticPath, 'cq-viewer.html');
			let html = fs.readFileSync(vscode.Uri.file(cqViewerPath).fsPath).toString();

			const cssPath = path.join(threeCadViewerPath, 'three-cad-viewer.esm.min.css');
			html = html.replace('{{cq-view-css}}', getResourceUri(panel.webview, cssPath));

			const jsPath = path.join(threeCadViewerPath, 'three-cad-viewer.esm.min.js');
			html = html.replace('{{cq-view-js}}', getResourceUri(panel.webview, jsPath));

			panel.webview.html = html;
			vscode.commands.executeCommand('cadquery.render');

			// panel.webview.onDidReceiveMessage(
			// 	message => {
			// 		if (message.status === 'dom_loaded') {
			// 			render()
			// 		}
			// 	},
			// 	undefined,
			// 	context.subscriptions
			// );

			panel.onDidDispose(() => {
				panel = undefined;
				deactivate();
			}, null, context.subscriptions);
		}
	}
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "contextcad-vscode" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('contextcad-vscode.init', init));

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('contextcad-vscode.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from contextcad-vscode!');

		vscode.debug.registerDebugAdapterTrackerFactory('python', {
			createDebugAdapterTracker(session: vscode.DebugSession) {
				return {
					onWillReceiveMessage: m => console.log(`will > ${JSON.stringify(m, undefined, 2)}`),
					onDidSendMessage: m => {
						console.log(`did < ${JSON.stringify(m, undefined, 2)}`);
						if (m.event === "stopped" && m.body.reason === "breakpoint") {
							session.customRequest('stackTrace', { threadId: 1 }).then(sTrace => {
								const frameId = sTrace.stackFrames[0].id;
								session.customRequest("evaluate", {"expression": "5 + 5", frameId: frameId, context: 'hover'}).then(reply => {
									vscode.window.showInformationMessage(`result: ${reply.result}`);
								}, error => {
									vscode.window.showInformationMessage(`error: ${error.message}`);
								});
							});
						}
					}
				};
			}
		  }
		);
	});

	context.subscriptions.push(disposable);
}

function getResourceUri(webview: vscode.Webview, resoucePath: string) {
	return webview.asWebviewUri(vscode.Uri.file(resoucePath)).toString();
}

// this method is called when your extension is deactivated
export function deactivate() {}
