import React from "react";
import Modal from "@/app/components/Modal";

interface AppInformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppInformationModal: React.FC<AppInformationModalProps> = ({
  isOpen,
  onClose,
}) => {

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stackmit - App Overview"
      size="lg"
    >
      <div className="space-y-4">
        <p>
          Stackmit is a desktop application designed to help developers manage multiple projects and Git repositories from a single, centralized interface. <br /> Its main goal is to enable micro frontend projects to manage Git statuses and package dependencies under a single roof. The application allows users to track updates, file changes, and dependency versions quickly and visually, simplifying project maintenance and collaboration.
        </p>
        <ul className="list-disc list-inside  space-y-2">
          <li>View all project directories and their Git status in one place.</li>
          <li>Monitor pending changes and commits for each repository.</li>
          <li>Open projects in VSCode or Visual Studio directly from the app.</li>
          <li>Export package dependencies to Excel, with optional NPM latest version checks.</li>
          <li>Batch commit multiple repositories at once.</li>
          <li>Filter projects by Git status, pending changes, or search terms.</li>
          <li>Modal interface to inspect detailed file changes and commit history.</li>
        </ul>

      </div>
    </Modal>
  );
};

export default AppInformationModal;
