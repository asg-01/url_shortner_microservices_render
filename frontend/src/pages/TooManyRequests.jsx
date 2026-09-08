import React from 'react';
import { ShieldAlert } from 'lucide-react';
import GenericErrorPage from './GenericErrorPage';

const TooManyRequests = () => {
  return (
    <GenericErrorPage
      code="429"
      title="Too Many Requests"
      message={<>You're making requests too quickly.<br/>Please wait a moment and try again.</>}
      icon={ShieldAlert}
      actionText="← Back to Home"
    />
  );
};

export default TooManyRequests;
