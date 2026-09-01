import { memo } from 'react';

interface SchoolDetailFeedbackProps {
  feedback: { type: 'success' | 'error'; message: string } | null;
}

const SchoolDetailFeedback = ({ feedback }: SchoolDetailFeedbackProps) => {
  if (!feedback) return null;
  return (
    <div
      className={`supervisor-detail__feedback supervisor-detail__feedback--${feedback.type}`}
      role="status"
    >
      {feedback.message}
    </div>
  );
};

export default memo(SchoolDetailFeedback);
