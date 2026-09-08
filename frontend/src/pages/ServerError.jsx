import React from 'react';
import { AlertOctagon } from 'lucide-react';
import GenericErrorPage from './GenericErrorPage';

const ServerError = () => {
  return (
    <GenericErrorPage
      code="500"
      title="Something Went Wrong"
      message={<>Something went wrong on our side.<br/>Please try again later.</>}
      icon={AlertOctagon}
      actionText="← Back to Home"
    />
  );
};

export default ServerError;
