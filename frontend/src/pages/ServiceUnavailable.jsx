import React from 'react';
import { ServerCrash } from 'lucide-react';
import GenericErrorPage from './GenericErrorPage';

const ServiceUnavailable = () => {
  return (
    <GenericErrorPage
      code="503"
      title="Service Unavailable"
      message={<>The service is temporarily unavailable.<br/>Please try again later.</>}
      icon={ServerCrash}
      actionText="← Back to Home"
    />
  );
};

export default ServiceUnavailable;
