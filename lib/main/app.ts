import { BrowserWindow, shell, app, screen, dialog, ipcMain, Notification } from 'electron'
import path from 'path'
import { registerWindowIPC } from '@/lib/window/ipcEvents'
import appIcon from '@/resources/build/icon.png?asset'
import fs from "fs"
import util from 'util'
import { exec } from 'child_process'
import { installExtension, REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import ExcelJS from "exceljs";
import * as os from "os";

let mainWindow;
const execPromise = util.promisify(exec);

export function createAppWindow(): void {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;


  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    backgroundColor: '#101828',
    icon: appIcon,
    frame: false,
    titleBarStyle: 'hiddenInset',
    title: 'Electron React App',
    maximizable: true,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      sandbox: false,
    },
  })

  // Register IPC events for the main window.
  registerWindowIPC(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }


}
app.whenReady().then(() => {
  installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS], { loadExtensionOptions: { allowFileAccess: true } })
    .then(([redux, react]) => console.log(`Added Extensions:  ${redux.name}, ${react.name}`))
    .catch((err) => console.log('An error occurred: ', err));
});

// IPC Events
ipcMain.handle('select-directories', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'multiSelections']
  });

  if (result.canceled) {
    return [];
  }

  console.log(result)

  mainWindow.webContents.send('loading-start'); // 🔴 Renderer'a sinyal gönder
  const directoryInfos = await Promise.all(result.filePaths.map(async (dirPath) => {
    try {
      const isGitRepo = fs.existsSync(path.join(dirPath, '.git'));

      let pendingChanges = '';
      let gitRemoteUrl = '';
      let currentBranch = '';
      let allBranches = [];
      let fileDiffs = [];

      if (isGitRepo) {
        try {
          // Git durumunu kontrol et
          const { stdout: pendingChangesOutput } = await execPromise('git status -s', { cwd: dirPath });
          pendingChanges = pendingChangesOutput;

          // Remote URL'yi al
          const { stdout: remoteOutput } = await execPromise('git remote get-url origin', { cwd: dirPath });
          gitRemoteUrl = remoteOutput.trim();

          // Git current branch
          const { stdout: branchOutput } = await execPromise('git rev-parse --abbrev-ref HEAD', { cwd: dirPath });
          currentBranch = branchOutput.trim();

          // Tüm local branch'ler
          const { stdout: branchesOutput } = await execPromise('git branch --format="%(refname:short)"', { cwd: dirPath });
          allBranches = branchesOutput.trim().split('\n').map(b => b.trim());

          const { stdout: fileStatusOutput } = await execPromise('git status --porcelain', { cwd: dirPath });

          const changedFileInfos = fileStatusOutput
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(line => {
              const status = line.slice(0, 2).trim(); // M, A, D, ?? vs.
              const file = line.slice(3).trim();
              return { file, status };
            });

          // Her dosya için diff al
          for (const { file, status } of changedFileInfos) {
            try {
              const { stdout: diffOutput } = await execPromise(`git diff --no-prefix -- ${file}`, { cwd: dirPath });
              fileDiffs.push({
                filePath: file,
                status,
                diff: diffOutput.trim()
              });
            } catch (diffError) {
              console.error(`Diff alınamadı: ${diffError.message}`);
              fileDiffs.push({
                filePath: file,
                status,
                diff: '',
                error: diffError.message
              });
            }
          }

        } catch (error) {
          console.error(`Git komut hatası: ${(error as Error).message}`);
        }
      }

      return {
        path: dirPath,
        name: path.basename(dirPath),
        isGitRepo,
        pendingChanges,
        gitRemoteUrl,
        currentBranch,
        allBranches,
        fileDiffs
      };
    } catch (error) {
      console.error(`Dizin kontrolünde hata: ${(error as Error).message}`);
      return {
        path: dirPath,
        name: path.basename(dirPath),
        isGitRepo: false,
        pendingChanges: '',
        gitRemoteUrl: '',
        error: (error as Error).message
      };
    }
  }));
  mainWindow.webContents.send('loading-end');

  return directoryInfos;
});

ipcMain.handle('send-commit', async (_, payload) => {
  const { directories, commitMessage } = payload || {};

  const results = [] as any[];
  console.log("send-commit", directories)
  for (const dir of directories) {
    try {
      // Değişiklikleri kaydet
      await execPromise('git add .', { cwd: dir });

      // Commit oluştur
      await execPromise(`git commit -m "${commitMessage}"`, { cwd: dir });

      // Push
      await execPromise('git push origin HEAD', { cwd: dir });

      results.push({
        path: dir,
        // name: dir.name,
        success: true,
        message: 'Commit ve push başarılı'
      });
      new Notification({ title: "Stackmit - Commit & Push Success", body: "Commit and push completed successfully" }).show()

    } catch (error) {
      results.push({
        path: dir,
        // name: dir.name,
        success: false,
        message: `Hata: ${error.message}`
      });
    }
  }

  return results;
});

ipcMain.handle('open-in-vscode', async (_, directoryPath) => {
  const { exec } = require('child_process');
  exec(`code "${directoryPath}"`);
});

ipcMain.handle('open-directory', async (_, directoryPath) => {
  await shell.openPath(directoryPath);
});

ipcMain.handle("export-packages", async (_, directories, checkLatest) => {
  const axios = require("axios");
  const desktopPath = path.join(os.homedir(), "Desktop");

  async function getLatestVersion(pkgName) {
    try {
      const url = `https://registry.npmjs.org/${pkgName}`;
      const response = await axios.get(url);

      return response.data?.["dist-tags"]?.latest || null;
    } catch (err) {
      return null;
    }
  }

  function normalizeVersion(v) {
    return v?.replace(/^[~^]/, "");
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Dependencies");

    // Kolonlar (checkLatest true ise ek kolonlar gelir)
    const header = ["Project Name", "Package", "Version", "Type"];

    if (checkLatest) {
      header.splice(3, 0, "NPM Latest Version", "Up to Date");
    }

    sheet.addRow(header);

    for (const dirPath of directories) {
      const packageJsonPath = path.join(dirPath, "package.json");

      if (!fs.existsSync(packageJsonPath)) continue;

      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const projectName = pkg.name || path.basename(dirPath);

      const addRows = async (deps, type) => {
        for (const [pkgName, version] of Object.entries(deps)) {
          let latest = null;
          let isLatest = null as any;

          if (checkLatest) {
            latest = await getLatestVersion(pkgName);
            isLatest =
              latest && normalizeVersion(latest) === normalizeVersion(version)
                ? "Yes"
                : "No";
          }

          const row = [projectName, pkgName, version];

          if (checkLatest) {
            row.push(latest ?? "Not found.", isLatest);
          }

          row.push(type);

          sheet.addRow(row);
        }
      };

      if (pkg.dependencies) await addRows(pkg.dependencies, "dependency");
      if (pkg.devDependencies) await addRows(pkg.devDependencies, "devDependency");
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = path.join(
      desktopPath,
      `Stackmit-Packages-${timestamp}.xlsx`
    );

    await workbook.xlsx.writeFile(filePath);
    new Notification({ title: "Stackmit - Packages Export Success", body: "Excel saved to desktop." }).show()

    return { success: true, filePath };
  } catch (error: any) {
    console.error("Export Packages Error:", error);
    return { success: false, error: error.message };
  }
});
