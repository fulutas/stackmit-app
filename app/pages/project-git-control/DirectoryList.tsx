import React, { useEffect, useState } from "react";
import { FaFolder, FaCodeBranch } from "react-icons/fa";
import { BiLogoVisualStudio, BiPackage } from "react-icons/bi";
import { IoLink } from "react-icons/io5";
import { TbGitBranch } from "react-icons/tb";
import { VscGitPullRequestNewChanges } from "react-icons/vsc";
import ProjectVersionChangesModal from "./ProjectVersionChangesModal";
import { FiSend } from "react-icons/fi";
import SendBatchCommitModal from "./SendBatchCommitModal";
import { toast } from "sonner";
import { MoonLoader } from "react-spinners";
import { FaXmark } from "react-icons/fa6";

export interface DirectoryInfo {
  path: string;
  name: string;
  isGitRepo: boolean;
  pendingChanges: string;
  gitRemoteUrl: string;
  currentBranch: string;
  allBranches: string[];
  fileDiffs: Array<{
    filePath: string;
    status: string;
    diff: string;
    error?: string;
  }>;
}
interface Props {
  directories: DirectoryInfo[];
  setDirectories: React.Dispatch<React.SetStateAction<DirectoryInfo[]>>;
}
const DirectoryList: React.FC<Props> = ({ directories, setDirectories }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [repoRefreshStatus, setRepoRefreshStatus] = useState<Record<string, string>>({});
  const [repoGitPullStatus, setRepoGitPullStatus] = useState<Record<string, string>>({});

  const [filterPendingChanges, setFilterPendingChanges] = useState<boolean>(false);
  const [filterGitRepo, setFilterGitRepo] = useState<boolean>(false);
  const [filterSelectAllChanged, setFilterSelectAllChanged] = useState<boolean>(false);

  const [changeModalOpen, setChangeModalOpen] = useState<boolean>(false);
  const [changeModalDetail, setChangeModalDetail] = useState<DirectoryInfo | Object | null>(null);
  const [batchCommitModalOpen, setBatchCommitModalOpen] = useState<boolean>(false);
  const [selectedDirectories, setSelectedDirectories] = useState<string[]>([]);
  const [exportPackagesLoading, setExportPackagesLoading] = useState<boolean>(false);

  const filteredDirectories = directories.filter((dir) => {
    const matchesSearchTerm =
      dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dir.path.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPendingChanges = filterPendingChanges ? dir.pendingChanges !== '' : true;
    const matchesGitRepo = filterGitRepo ? dir.isGitRepo : true;

    return matchesSearchTerm && matchesPendingChanges && matchesGitRepo;
  });

  // Effect to handle the "Select All Changed" filter
  useEffect(() => {
    if (filterSelectAllChanged) {
      const changedPaths = filteredDirectories
        .filter((dir) => dir.pendingChanges)
        .map((dir) => dir.path);

      setSelectedDirectories((prev) => {
        const merged = [...new Set([...prev, ...changedPaths])];
        return merged;
      });
    } else {
      setSelectedDirectories([]);
    }
  }, [filterSelectAllChanged]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault(); // default select-all davranışını engelle

        if (selectedDirectories.length === filteredDirectories.length) {
          // Hepsi seçili → temizle
          setSelectedDirectories([]);
        } else {
          // Hepsi seçili değil → tümünü seç
          setSelectedDirectories(filteredDirectories.map(dir => dir.path));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredDirectories, selectedDirectories]);
  const directoriesCheckboxChange = (path: string) => {
    setSelectedDirectories((prev) =>
      prev.includes(path)
        ? prev.filter((p) => p !== path) // kaldır
        : [...prev, path] // ekle
    );
  };
  const openBatchCommit = () => {
    if (selectedDirectories.length === 0) {
      toast.error('Please select at least one directory.');
      return;
    }

    setBatchCommitModalOpen(true);

  }
  const exportPackages = async () => {
    if (selectedDirectories.length === 0) {
      toast.error("Please select at least one directory.");
      return;
    }

    const checkLatest = true;

    setExportPackagesLoading(true)
    toast.warning("Checking the package versions may take a little while. We will notify you when it is complete.");
    const result = await window.api.exportPackages(selectedDirectories, checkLatest);

    if (result.success) {
      setExportPackagesLoading(false)
      toast.success(`Excel saved to: ${result.filePath}`);
    } else {
      setExportPackagesLoading(false)
      toast.error("Export failed: " + result.error);
    }
  };
  const sendBatchCommit = async (commitMessage: string) => {
    if (!commitMessage || commitMessage.trim() === '') {
      toast.error('Commit message cannot be empty.');
      return;
    }

    try {
      const response = await window.gitLib.sendCommit({ directories: selectedDirectories, commitMessage });
      console.log("sendBatchCommit Response -->", response);

      const successCount = response.filter(item => item.success).length;
      const errorCount = response.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} project${successCount > 1 ? 's' : ''} were committed successfully.`);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} project${errorCount > 1 ? 's' : ''} failed to commit due to an error.`);
      }
    } catch (error) {
      console.error('Commit Error:', error);
      toast.error('An unexpected error occurred. Commit process failed.');
    }
  }
  const refreshDirectories = async () => {
    const allDirectories = directories.map(dir => dir.path);

    try {
      const directoryList = await window.gitLib.refreshDirectories(allDirectories)
      setDirectories(directoryList);

      if (directoryList.length > 0) {
        toast.success('Folders successfully refreshed.');
      } else {
        toast.info('No directories found.');
      }
    } catch (error) {
      console.error('Error refreshing directories:', error);
      toast.error('An error occurred while refreshing directories.');
    }
  };
  const repoCheckUpdates = async (dirPath: string) => {
    try {
      const updatedDir = await window.gitLib.repoCheckUpdates(dirPath);
      console.log(updatedDir)

      // Eğer güncel ve değişiklik yoksa buton yazısını değiştir
      if (updatedDir.success && updatedDir.count === 0) {
        setRepoRefreshStatus((prev) => ({ ...prev, [dirPath]: 'Up to date' }));

        // 2 saniye sonra tekrar 'Refresh' olarak değiştir
        setTimeout(() => {
          setRepoRefreshStatus((prev) => {
            const updated = { ...prev };
            delete updated[dirPath];
            return updated;
          });
        }, 2000);
      }

      setDirectories((prev) =>
        prev.map((dir) => (dir.path === updatedDir.path ? updatedDir : dir))
      );
      toast.success(`${dirPath.split('/').pop()} repository updated successfully.`);
    } catch (error) {
      console.error('Error checking repository updates:', error);
      toast.error(`${dirPath.split('/').pop()} repository update failed.`);
    }
  };

  const repoGitPull = async (dirPath: string) => {
    try {
      const resGitPull = await window.gitLib.gitPull(dirPath);
      console.log(resGitPull)

      // Eğer güncel ve değişiklik yoksa buton yazısını değiştir
      if (resGitPull.success) {
        setRepoGitPullStatus((prev) => ({ ...prev, [dirPath]: 'Pull success' }));

        setTimeout(() => {
          setRepoGitPullStatus((prev) => {
            const updated = { ...prev };
            delete updated[dirPath];
            return updated;
          });
        }, 2000);
      }

      setDirectories((prev) =>
        prev.map((dir) => (dir.path === resGitPull.path ? resGitPull : dir))
      );
      toast.success(`${dirPath.split('/').pop()} repository pulled successfully.`);
    } catch (error) {
      console.error('Error checking repository updates:', error);
      toast.error(`${dirPath.split('/').pop()} repository pull failed.`);
    }
  };

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-baseline">
          <h1 className="w-full text-3xl text-white font-bold mb-6">Projects ({filteredDirectories.length})</h1>
          {/* Directories Action Buttons */}
          {directories.length > 0 && (
            <div className="flex gap-3">
              <button
                disabled={exportPackagesLoading}
                onClick={() => !exportPackagesLoading && exportPackages()}
                className="relative flex gap-2 min-w-[200px] cursor-pointer justify-center items-center mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:opacity-90 transition"
              >
                {exportPackagesLoading && selectedDirectories.length > 0 && (
                  <span
                    className="
                    absolute -top-1 -left-1
                    bg-red-600 text-white
                    text-xs font-bold
                    px-2 py-0.5
                    rounded-full
                    shadow-md
                   "
                  >
                    {selectedDirectories.length}
                  </span>
                )}

                {/* Spinner veya Icon */}
                {exportPackagesLoading ? (
                  <MoonLoader size={16} color="#FFFF" />
                ) : (
                  <BiPackage size={16} />
                )}
                {exportPackagesLoading ? "Exporting..." : "Export Packages"}
              </button>
              <button
                onClick={() => openBatchCommit()}
                className="flex gap-2 min-w-[200px] cursor-pointer justify-center items-center mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:opacity-90 transition">
                <FiSend size={16} />
                Send Batch Commit
              </button>
            </div>
          )}
          {/* Directories Action Buttons */}
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 w-full p-3 rounded-xl border-2 border-gray-700 focus:outline-none focus:ring-0 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        {/* Filters */}
        {directories.length > 0 && (
          <div id="filters" className="mb-6 flex gap-4">
            <h2 className="text-white font-medium">Filters:</h2>
            <div className="flex gap-5">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterPendingChanges}
                  onChange={() => setFilterPendingChanges(!filterPendingChanges)}
                  className="text-blue-500"
                />
                Pending Changes
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterGitRepo}
                  onChange={() => setFilterGitRepo(!filterGitRepo)}
                  className="text-blue-500"
                />
                Git Connected
              </label>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterSelectAllChanged}
                  onChange={() => setFilterSelectAllChanged(!filterSelectAllChanged)}
                  className="text-blue-500"
                />
                Select All Changed
              </label>
            </div>
          </div>
        )}
        {/* Filters */}

        {/* DirectoriesList */}
        <div className="directories-list space-y-4">
          {filteredDirectories.length > 0 && filteredDirectories.map((dir, index) => (
            <div
              key={dir.path}
              data-index={index}
              className="relative rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-900"
            >
              <span
                onClick={() => setDirectories(prev => prev.filter(d => d.path !== dir.path))}
                className="
                    absolute -top-2 -right-1
                    bg-gray-700 text-white
                    text-xs font-bold
                    px-2 py-1
                    rounded-lg
                    shadow-md
                    cursor-pointer
                    hover:opacity-80
                   "
              >
                <FaXmark size={14} />
              </span>

              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    className={classNames('mt-1 border cursor-pointer accent-blue-600 w-5 h-5', { 'opacity-40 !cursor-not-allowed': !dir.isGitRepo || !dir.fileDiffs.length })}
                    checked={selectedDirectories.includes(dir.path)}
                    title={!dir.isGitRepo || !dir.fileDiffs.length ? 'No git repository or no file diffs available' : 'Select this directory'}
                    disabled={!dir.isGitRepo || !dir.fileDiffs.length}
                    onChange={() => directoriesCheckboxChange(dir.path)}
                  />
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-ellipsis overflow-hidden">
                      {dir.name}
                    </h2>
                    <p
                      onClick={() => window.api.openDirectory(dir.path)}
                      className="flex gap-2 items-center text-sm text-gray-400 hover:underline cursor-pointer text-ellipsis overflow-hidden">
                      <FaFolder /> {dir.path}
                    </p>
                    {dir.isGitRepo && (
                      <div className="mt-5 space-y-1">
                        <div className="flex gap-1 text-sm">
                          <span className="font-medium flex gap-1 items-center"> <FaGit /> Remote Status: </span>
                          <label className={classNames('text-sm font-medium', { 'text-green-500': dir.isGitRepo, 'text-red-500': !dir.isGitRepo })}>{dir.isGitRepo ? "Git Connected" : "No Git Connection"}</label>
                        </div>
                        <div className="flex gap-1 text-sm">
                          <span className="font-medium flex gap-1 items-center"> <FaCodeBranch /> Current Branch: </span>
                          {dir.currentBranch}
                        </div>
                        <div className="flex gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium flex gap-1 items-center">
                            <TbGitBranch />
                            All Branches:
                          </span>
                          {dir.allBranches.join(', ')}
                        </div>
                        <div className="flex gap-1 text-sm">
                          <span className="font-medium flex gap-1 items-center">
                            <IoLink />
                            Remote URL:
                          </span>
                          <a
                            href={dir.gitRemoteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {dir.gitRemoteUrl}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start">
                  {!dir.isGitRepo && (
                    <button className="flex gap-2  items-centermt-4 px-4 py-2 w-full bg-red-500 text-white text-sm rounded-lg hover:opacity-90 transition">
                      No Git Connection
                    </button>
                  )}
                  <button
                    onClick={() => window.api.openInVSCode(dir.path)}
                    className="flex gap-2 items-center px-4 py-2 w-full cursor-pointer bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    <BiLogoVisualStudio />
                    Open VSCode
                  </button>
                  {dir.pendingChanges && (
                    <button
                      onClick={() => {
                        setChangeModalDetail(dir)
                        setChangeModalOpen(true)
                      }}
                      className="flex gap-2 items-center mt-4 px-4 py-2 w-full cursor-pointer bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition"
                    >
                      <VscGitPullRequestNewChanges />
                      Changes
                    </button>
                  )}
                </div>
              </div>
              <hr className="mt-5 mb-5 h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
              {/* Git Actions */}
              <div className="git-actions flex flex-col mt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Git Actions</h3>
                <div className="flex flex-row gap-2">
                  <button
                    onClick={() => repoCheckUpdates(dir.path)}
                    className={classNames(
                      "flex gap-2 cursor-pointer justify-center items-center px-4 py-2 text-white text-sm rounded-lg transition",
                      repoRefreshStatus[dir.path] === 'Up to date' ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:opacity-90"
                    )}
                  >
                    {repoRefreshStatus[dir.path] === 'Up to date' ? (
                      <FaCheck size={16} />
                    ) : (
                      <IoRefresh size={16} />
                    )}
                    {repoRefreshStatus[dir.path] || 'Check Updates'}
                  </button>
                  <button
                    onClick={() => repoGitPull(dir.path)}
                    className={classNames(
                      "flex gap-2 cursor-pointer justify-center items-center px-4 py-2 text-white text-sm rounded-lg transition",
                      repoGitPullStatus[dir.path] === 'Pull success' ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:opacity-90"
                    )}
                  >
                    {repoGitPullStatus[dir.path] === 'Pull success' ? (
                      <FaCheck size={16} />
                    ) : (
                      <FaCodePullRequest size={16} />
                    )}
                    {repoGitPullStatus[dir.path] || 'Git Pull'}
                  </button>
                </div>
              </div>
              {/* Git Actions */}
            </div>
          ))}

          {filteredDirectories.length === 0 && <p className="py-3 bg-gray-700 rounded-md text-center font-medium text-[15px] text-gray-200">Record not found.</p>}
        </div>
        {/* DirectoriesList */}
      </div>

      {changeModalOpen && (
        <ProjectVersionChangesModal
          changeModalDetail={changeModalDetail}
          setChangeModalDetail={setChangeModalDetail}
          changeModalOpen={changeModalOpen}
          setChangeModalOpen={setChangeModalOpen}
        />
      )}

      {batchCommitModalOpen && (
        <SendBatchCommitModal
          isOpen={batchCommitModalOpen}
          onClose={() => setBatchCommitModalOpen(false)}
          onSubmit={(commitMessage) => sendBatchCommit(commitMessage)}
        />
      )}

    </>
  );
};

export default DirectoryList