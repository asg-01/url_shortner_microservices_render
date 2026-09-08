import React from 'react';
import { Search } from 'lucide-react';
import GenericErrorPage from './GenericErrorPage';

const NotFound = () => {
  return (
    <GenericErrorPage
      code="404"
      title="Link Not Found"
      message={<>This page or short link doesn't exist.</>}
      icon={Search}
      actionText="← Back to Home"
    />
  );
};

export default NotFound;
