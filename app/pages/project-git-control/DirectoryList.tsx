import React, { useEffect, useState } from "react";
import { FaGitAlt, FaFolder, FaCodeBranch } from "react-icons/fa";
import { BiLogoVisualStudio } from "react-icons/bi";
import { IoLink } from "react-icons/io5";
import { TbGitBranch } from "react-icons/tb";
import { VscGitPullRequestNewChanges } from "react-icons/vsc";
import ProjectVersionChangesModal from "./ProjectVersionChangesModal";
import { FiSend } from "react-icons/fi";
import SendBatchCommitModal from "./SendBatchCommitModal";
import { toast } from "sonner";
import { ipcRenderer } from "electron";

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

  const [filterPendingChanges, setFilterPendingChanges] = useState<boolean>(false);
  const [filterGitRepo, setFilterGitRepo] = useState<boolean>(false);
  const [filterSelectAllChanged, setFilterSelectAllChanged] = useState<boolean>(false);

  const [changeModalOpen, setChangeModalOpen] = useState<boolean>(false);
  const [changeModalDetail, setChangeModalDetail] = useState<DirectoryInfo | Object>({});
  const [batchCommitModalOpen, setBatchCommitModalOpen] = useState<boolean>(false);

  const [selectedDirectories, setSelectedDirectories] = useState<string[]>([]);

  const filteredDirectories = directories.filter((dir) => {
    const matchesSearchTerm =
      dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dir.path.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPendingChanges = filterPendingChanges ? dir.pendingChanges !== '' : true;
    const matchesGitRepo = filterGitRepo ? dir.isGitRepo : true;

    return matchesSearchTerm && matchesPendingChanges && matchesGitRepo;
  });

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

  const sendBatchCommit = async (commitMessage: string) => {
    // ipcRenderer.send('send-commit', { directories: selectedDirectories, commitMessage });
    const directoryList = await window.gitLib.sendCommit({ directories: selectedDirectories, commitMessage });

    console.log(directoryList)
    // try {
    //   const results = await ipcRenderer.invoke('send-commit', {
    //     directories: selectedDirectories,
    //     commitMessage
    //   });

    //   console.log(results)
    //   // // Dizinleri yenile
    //   // directories = await ipcRenderer.invoke('select-directories');
    //   // renderDirectories();

    // } catch (error) {
    //   console.error('Commit Error:', error);
    //   alert('An error occurred during commit.');
    // }
  }

  return (
    <>
      <div className="p-6">
        <div className="flex justify-between items-baseline">
          <h1 className="w-full text-3xl text-white font-bold mb-6">Git Repositories ({filteredDirectories.length})</h1>
          {directories.length > 0 && (
            <button
              onClick={() => openBatchCommit()}
              className="flex gap-2 min-w-[200px] cursor-pointer justify-center items-center mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:opacity-90 transition">
              <FiSend size={16} />
              Send Batch Commit
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-6 w-full p-3 rounded-xl border-2 border-gray-700 focus:outline-none focus:ring-0 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />

        {filteredDirectories.length > 0 && (
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

        <div className="space-y-4">
          {filteredDirectories.length > 0 && filteredDirectories.map((dir, index) => (
            <div
              key={dir.path}
              data-index={index}
              className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <input
                    type="checkbox"
                    className="mt-1 cursor-pointer accent-blue-600 w-5 h-5"
                    checked={selectedDirectories.includes(dir.path)}
                    onChange={() => directoriesCheckboxChange(dir.path)}
                  />
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {dir.name}
                    </h2>
                    <p
                      onClick={() => window.api.openDirectory(dir.path)}
                      className="flex gap-2 items-center text-sm text-gray-400 hover:underline cursor-pointer">
                      <FaFolder /> {dir.path}
                    </p>

                    {dir.isGitRepo && (
                      <div className="mt-5 space-y-1">
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
                  {dir.isGitRepo ? (
                    <button className="flex gap-2 items-center mt-4 px-4 py-2 w-full bg-green-600 text-white text-sm rounded-lg hover:opacity-90 transition">
                      <FaGitAlt size={20} />
                      Git Connected
                    </button>
                  ) : (
                    <button className="flex gap-2  items-centermt-4 px-4 py-2 w-full bg-red-500 text-white text-sm rounded-lg hover:opacity-90 transition">
                      No Git Connection
                    </button>
                  )}
                  <button
                    onClick={() => window.api.openInVSCode(dir.path)}
                    className="flex gap-2 items-center mt-4 px-4 py-2 w-full cursor-pointer bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
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
            </div>
          ))}
          {filteredDirectories.length === 0 && <p className="text-center font-medium text-[15px] text-gray-200">Kayıt bulunamadı.</p>}
        </div>
      </div>

      {changeModalOpen && <ProjectVersionChangesModal changeModalDetail={changeModalDetail} setChangeModalDetail={setChangeModalDetail} changeModalOpen={changeModalOpen} setChangeModalOpen={setChangeModalOpen} />}

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