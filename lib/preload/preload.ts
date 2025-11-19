import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import api from './api'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('gitLib', {
      selectDirectories: () => ipcRenderer.invoke('select-directories'),
      refreshDirectories: (directories) => ipcRenderer.invoke('refresh-directories', directories),
      sendCommit: (payload) => ipcRenderer.invoke('send-commit', payload),
      repoCheckUpdates: (dirPath) => ipcRenderer.invoke('repo-check-updates', dirPath),
      gitPull: (dirPath) => ipcRenderer.invoke('git-pull', dirPath),
    });
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.gitLib = gitLib
  window.api = api
}
