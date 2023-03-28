import type { IpcRenderer } from "electron";

const inElectron = !!window.require;
const electron = inElectron ? window.require('electron') : { ipcRenderer: undefined };

const ipcRenderer: IpcRenderer | undefined = electron.ipcRenderer;

export enum IPCEvent {
    Notification = 'app:notification',
}

const sendIPC = (event: IPCEvent, data: any) => {
    if (!inElectron) return;

    ipcRenderer!.send(event, data);
}

export const sendNotification = (title: string, body: string) => {
    sendIPC(IPCEvent.Notification, {
        title,
        body
    });
}