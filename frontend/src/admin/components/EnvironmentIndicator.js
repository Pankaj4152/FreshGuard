import React from 'react';
import AdminDataUtil from '../utils/AdminDataUtil';

/**
 * A small indicator showing the current environment
 */
const EnvironmentIndicator = () => {
  const environment = process.env.NODE_ENV || 'development';
  const config = AdminDataUtil.getConfig();
  const useMock = AdminDataUtil.useMockData();
  
  return (
    <div className={`environment-indicator env-${environment}`}>
      {environment} {useMock ? '(mock data)' : '(api)'}
    </div>
  );
};

export default EnvironmentIndicator;
