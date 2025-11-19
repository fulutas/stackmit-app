import { ipcRenderer } from 'electron'

const api = {
  send: (channel: string, ...args: any[]) => {
    ipcRenderer.send(channel, ...args)
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_, ...args) => func(...args))
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args)
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  },
  openInVSCode: (directoryPath: string) => {
    ipcRenderer.invoke('open-in-vscode', directoryPath);
  },
  openDirectory: (directoryPath: string) => {
    ipcRenderer.invoke('open-directory', directoryPath);
  },
  exportPackages: (directories: string[], checkLatest: boolean) => {
    return ipcRenderer.invoke('export-packages', directories, checkLatest);
  },
}

export default api
