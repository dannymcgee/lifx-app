/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app as electron, BrowserWindow, ipcMain } from "electron";
import { environment } from "../../environments/environment";

namespace electronEvents {
	export function bootstrapElectronEvents(): Electron.IpcMain {
		// Retrieve app version
		ipcMain.handle("get-app-version", () => {
			console.log(`Fetching application version... [v${environment.version}]`);

			return environment.version;
		});

		ipcMain.handle("window-close", () => {
			BrowserWindow.getFocusedWindow().close();
		});

		ipcMain.handle("window-minimize", () => {
			BrowserWindow.getFocusedWindow().minimize();
		});

		ipcMain.handle("window-toggle-max", async () => {
			let win = BrowserWindow.getFocusedWindow();

			if (win.isMaximized()) {
				win.restore();
				return false;
			}
			else if (win.isMaximizable()) {
				win.maximize();
				return true;
			}
			return false;
		});

		// Handle App termination
		ipcMain.on("quit", (_, code) => {
			electron.exit(code);
		});

		return ipcMain;
	}
}

export default electronEvents;
