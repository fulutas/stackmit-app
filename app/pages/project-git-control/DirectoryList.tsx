import React, { useState } from "react";
import { FaGitAlt, FaFolder, FaCodeBranch, FaGitlab } from "react-icons/fa";
import { BiLogoVisualStudio } from "react-icons/bi";
import { IoLink } from "react-icons/io5";
import { TbGitBranch } from "react-icons/tb";
import { VscGitPullRequestNewChanges } from "react-icons/vsc";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPendingChanges, setFilterPendingChanges] = useState(false);
  const [filterGitRepo, setFilterGitRepo] = useState(false);

  const filteredDirectories = directories.filter((dir) => {
    const matchesSearchTerm =
      dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dir.path.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPendingChanges = filterPendingChanges ? dir.pendingChanges !== '' : true;
    const matchesGitRepo = filterGitRepo ? dir.isGitRepo : true;

    return matchesSearchTerm && matchesPendingChanges && matchesGitRepo;
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl text-white font-bold mb-6">Git Repositories ({filteredDirectories.length})</h1>
      <input
        type="text"
        placeholder="Search repositories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 w-full p-3 rounded-xl border-2 border-gray-700 focus:outline-none focus:ring-0 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600"
      />

      {filteredDirectories.length > 0 && (
        <div className="mb-6 flex gap-4">
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
        </div>
      )}

      <div className="space-y-4">
        {filteredDirectories.length > 0 && filteredDirectories.map((dir) => (
          <div
            key={dir.path}
            className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-900"
          >
            <div className="flex items-start justify-between">
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
                    <div className="flex gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium flex gap-1 items-center">
                        <TbGitBranch />
                        Branches:
                      </span>
                      {dir.allBranches.join(', ')}
                    </div>
                    {/* {dir.pendingChanges && (
                      <div className="text-sm text-yellow-600">
                        <span className="font-medium">Pending Changes:</span> {dir.pendingChanges}
                      </div>
                    )} */}
                  </div>
                )}
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
        {filteredDirectories.length === 0 && (
          <>
            <p className="text-center font-medium text-[15px] text-gray-200">Kayıt bulunamadı.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DirectoryList