import { useState } from 'react';
import Modal from '@/app/components/Modal';
import { DirectoryInfo } from './DirectoryList';

interface ProjectVersionChangesModalProps {
  changeModalDetail: DirectoryInfo | any;
  changeModalOpen: boolean;
  setChangeModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setChangeModalDetail: React.Dispatch<React.SetStateAction<DirectoryInfo | Object | null>>
}

const ProjectVersionChangesModal: React.FC<ProjectVersionChangesModalProps> = ({
  changeModalDetail,
  changeModalOpen,
  setChangeModalOpen,
  setChangeModalDetail
}) => {
  const [expandedDiffs, setExpandedDiffs] = useState<Record<string, boolean>>({});

  const toggleDiff = (filePath: string) => {
    setExpandedDiffs((prev) => ({
      ...prev,
      [filePath]: !prev[filePath],
    }));
  };

  const closeModal = () => {
    setChangeModalOpen(false);
    setChangeModalDetail(null);
    setExpandedDiffs({});
  };

  return (
    <Modal isOpen={changeModalOpen} onClose={closeModal} title="Project Version Changes" size="lg">
      {!changeModalDetail ? (
        <p className="text-gray-500 dark:text-gray-300">No details to display.</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-md font-semibold text-gray-800 dark:text-gray-100">
            {changeModalDetail.name} - {changeModalDetail.currentBranch}
          </h2>

          {changeModalDetail.fileDiffs.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No file changes found.</p>
          ) : (
            <ul className="space-y-3">
              {changeModalDetail.fileDiffs.map((diff, idx) => (
                <li
                  key={`${diff.filePath}-${idx}`}
                  className="rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                  <button
                    onClick={() => toggleDiff(diff.filePath)}
                    className="w-full text-left p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-t-xl"
                  >
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{diff.filePath}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${diff.status === 'M'
                        ? 'bg-yellow-100 text-yellow-800'
                        : diff.status === 'A'
                          ? 'bg-green-100 text-green-800'
                          : diff.status === 'D'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {diff.status}
                    </span>
                  </button>

                  {expandedDiffs[diff.filePath] && (
                    <div className="px-4 pb-4">
                      {diff.diff ? (
                        <pre className="mt-2 p-3 text-xs bg-black/60 text-green-200 rounded whitespace-pre-wrap overflow-x-auto">
                          {diff.diff}
                        </pre>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400">No diff content available.</p>
                      )}

                      {diff.error && (
                        <p className="text-sm text-red-500 mt-2">
                          Error: {diff.error}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ProjectVersionChangesModal;
