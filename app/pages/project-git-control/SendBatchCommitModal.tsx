import React from "react";
import Modal from "@/app/components/Modal";

interface SendBatchCommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

const SendBatchCommitModal: React.FC<SendBatchCommitModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [commitMessage, setCommitMessage] = React.useState("");

  const handleSubmit = () => {
    if (commitMessage.trim()) {
      onSubmit(commitMessage);
      setCommitMessage("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batch Commit Message"
      size="md"
    >
      <div className="space-y-4">
        <textarea
          rows={6}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          className="w-full p-3 text-sm rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          placeholder="Enter your commit message here..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-700 rounded-md hover:opacity-80"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send Commit
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SendBatchCommitModal;
