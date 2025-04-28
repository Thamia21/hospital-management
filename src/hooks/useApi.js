import { useState, useCallback } from 'react';
import { useError } from '../context/ErrorContext';
import { useLoading } from '../context/LoadingContext';

export function useApi(apiFunction, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { showError, showSuccess } = useError();
  const { showLoading, hideLoading } = useLoading();

  const {
    loadingId = 'api-call',
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    transform
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      showLoading(loadingId);
      setError(null);
      const response = await apiFunction(...args);
      const transformedData = transform ? transform(response) : response;
      setData(transformedData);

      if (successMessage) {
        showSuccess(successMessage);
      }

      if (onSuccess) {
        onSuccess(transformedData);
      }

      return transformedData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);

      if (errorMessage) {
        showError(errorMessage);
      } else {
        showError(errorMsg);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      hideLoading(loadingId);
    }
  }, [apiFunction, loadingId, successMessage, errorMessage, onSuccess, onError, transform, showError, showSuccess, showLoading, hideLoading]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    error,
    execute,
    reset,
    isLoading: false, // Loading state is managed by LoadingContext
  };
}

// Helper hook for paginated data
export function usePaginatedApi(apiFunction, options = {}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(options.defaultRowsPerPage || 10);
  const [totalCount, setTotalCount] = useState(0);

  const api = useApi(apiFunction, {
    ...options,
    transform: (response) => {
      if (response.totalCount !== undefined) {
        setTotalCount(response.totalCount);
      }
      return response.data || response;
    },
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
    api.execute({ page: newPage, rowsPerPage });
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    api.execute({ page: 0, rowsPerPage: newRowsPerPage });
  };

  return {
    ...api,
    page,
    rowsPerPage,
    totalCount,
    handlePageChange,
    handleRowsPerPageChange,
  };
}

// Helper hook for form submissions
export function useFormSubmit(apiFunction, options = {}) {
  const api = useApi(apiFunction, {
    successMessage: 'Successfully saved!',
    ...options,
  });

  const handleSubmit = async (values) => {
    try {
      await api.execute(values);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    ...api,
    handleSubmit,
  };
}
