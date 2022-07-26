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
			// vscode.commands.executeCommand('cadquery.render');

			
			vscode.debug.registerDebugAdapterTrackerFactory('python', {
				createDebugAdapterTracker(session: vscode.DebugSession) {
					return {
						onDidSendMessage: m => {
							if (m.event === "stopped") {
								session.customRequest('stackTrace', { threadId: 1 }).then(sTrace => {
									const frameId = sTrace.stackFrames[0].id;
									return session.customRequest(
										"evaluate", {
											"expression": "contextcad.context.Context.stack[-1]._get_description()",
											frameId: frameId,
											context: 'hover'
										});
								}).then(reply => {
									vscode.window.showInformationMessage(`result: ${reply.result}`);
									let model = JSON.parse(reply.result.replace("'", "").replace("'", ""))
									if (panel) {
										panel.webview.postMessage({
											command: 'render',
											model: model,
											options: viewerOptions
										});
									}
									}, error => {
										vscode.window.showInformationMessage(`error: ${error.message}`);
									}
								);
							}
						}
					};
				}
			}
		);

			panel.onDidDispose(() => {
				panel = undefined;
				deactivate();
			}, null, context.subscriptions);
		}
	}

	console.log('Congratulations, your extension "contextcad-vscode" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('contextcad-vscode.init', init));
}

function getResourceUri(webview: vscode.Webview, resoucePath: string) {
	return webview.asWebviewUri(vscode.Uri.file(resoucePath)).toString();
}

// this method is called when your extension is deactivated
export function deactivate() {}
