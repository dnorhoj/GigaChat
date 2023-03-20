import type { IpcRenderer } from "electron";
import { browser } from "$app/environment";

// Only import the ipcRenderer if we are in the browser
const ipcRenderer: IpcRenderer = window.require('electron').ipcRenderer;

export enum IPCEvent {
    Notification = 'app:notification',
}

export const sendNotification = (title: string, body: string) => {
    ipcRenderer!.send(IPCEvent.Notification, {
        title,
        body
    });
}