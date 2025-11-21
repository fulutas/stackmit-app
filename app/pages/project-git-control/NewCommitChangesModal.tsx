import { useState } from 'react';
import Modal from '@/app/components/Modal';
import { DirectoryInfo } from './DirectoryList';

interface NewCommitChangesModalProps {
  changeModalDetail: DirectoryInfo | any;
  changeModalOpen: boolean;
  setChangeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setChangeModalDetail: React.Dispatch<React.SetStateAction<DirectoryInfo | Object | null>>;
}

const NewCommitChangesModal: React.FC<NewCommitChangesModalProps> = ({
  changeModalDetail,
  changeModalOpen,
  setChangeModalOpen,
  setChangeModalDetail,
}) => {
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({});
  const [expandedCommits, setExpandedCommits] = useState<Record<string, boolean>>({});

  const toggleDiff = (key: string) => {
    setExpandedDiffs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleCommit = (key: string) => {
    setExpandedCommits((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const closeModal = () => {
    setChangeModalOpen(false);
    setChangeModalDetail(null);
    setExpandedDiffs({});
    setExpandedCommits({});
  };

  if (!changeModalDetail) {
    return (
      <Modal isOpen={changeModalOpen} onClose={closeModal} title="Project Version Changes" size="lg">
        <p className="text-gray-500 dark:text-gray-300">No details to display.</p>
      </Modal>
    );
  }

  const { name, currentBranch, newCommitDetails = [] } = changeModalDetail;

  return (
    <Modal isOpen={changeModalOpen} onClose={closeModal} title="New Incoming Commits" size="lg">
      <div className="space-y-6">
        <h2 className="text-md font-semibold text-gray-800 dark:text-gray-100">
          {name} - {currentBranch}
        </h2>

        {/* --------------------------------------------- */}
        {/* YENİ COMMİTLER */}
        {/* --------------------------------------------- */}
        <div>
          <h3 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
            Incoming Commits (origin → local)
          </h3>

          {newCommitDetails.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No incoming commits.</p>
          ) : (
            <ul className="space-y-3">
              {newCommitDetails.map((commit) => (
                <li
                  key={`commit-${commit.hash}`}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                  {/* Commit header */}
                  <button
                    onClick={() => toggleCommit(commit.hash)}
                    className="w-full text-left p-4 flex flex-col cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-xl"
                  >
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {commit.message}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {commit.shortHash} — {commit.author}
                    </span>
                  </button>

                  {/* Expanded commit content */}
                  {expandedCommits[commit.hash] && (
                    <div className="px-4 pb-4 space-y-4">

                      {/* Changed files inside commit */}
                      {commit.files && commit.files.length > 0 ? (
                        <ul className="space-y-2">
                          {commit.files.map((cf, i) => (
                            <li
                              key={`${commit.hash}-file-${i}`}
                              className="flex items-center justify-between p-2 text-xs rounded bg-gray-100 dark:bg-gray-800"
                            >
                              <span className="text-gray-800 dark:text-gray-200">{cf.filePath}</span>

                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cf.status === 'M'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : cf.status === 'A'
                                    ? 'bg-green-100 text-green-800'
                                    : cf.status === 'D'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                              >
                                {cf.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          No file list for this commit.
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NewCommitChangesModal;
