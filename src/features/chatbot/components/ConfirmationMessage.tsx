import React from 'react';
import {ConfirmationPopup} from './ConfirmationPopup';

interface ConfirmationMessageProps {
  data: any;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmationMessage: React.FC<ConfirmationMessageProps> = ({
  data,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const entityType = data?.type;

  const renderDetails = () => {
    switch (entityType) {
      case 'project_confirmation':
        return renderProjectDetails();

      default:
        return (
          <div>
            <p>Please review the details before confirming.</p>
          </div>
        );
    }
  };

  const renderProjectDetails = () => {
    const project = data?.project;

    if (!project) {
      return <p>No project details available.</p>;
    }

    return (
      <div className="confirmation-details">
        <h4>Project Details</h4>

        <div>
          <strong>Account:</strong>
          <span>{project.account_name || '-'}</span>
        </div>

        <div>
          <strong>Project Name:</strong>
          <span>{project.project_name || '-'}</span>
        </div>

        <div>
          <strong>Customer:</strong>
          <span>{project.customer_name || '-'}</span>
        </div>

        <div>
          <strong>Expected End Date:</strong>
          <span>{project.expected_end_date || '-'}</span>
        </div>

        <div>
          <strong>Project Manager ID:</strong>
          <span>{project.project_manager_id || '-'}</span>
        </div>

        <div>
          <strong>Delivery Head ID:</strong>
          <span>{project.delivery_head_id || '-'}</span>
        </div>

        <div>
          <strong>User Emails:</strong>
          <span>
            {project.user_emails?.length
              ? project.user_emails.join(', ')
              : '-'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="confirmation-message">
        {renderDetails()}
      </div>

      <ConfirmationPopup
        open={true}
        loading={loading}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
};

export default ConfirmationMessage;