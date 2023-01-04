import { useEffect, useState } from 'react';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import UsersList from '../components/UsersList';

const Users = () => {
  const [loadedUsers, setLoadedUsers] = useState();
  const { isLoading, error, sendRequest, clearnError } = useHttpClient();

  useEffect(() => {
    sendRequest('http://localhost:3001/api/users').then((responseData) =>
      setLoadedUsers(responseData.users)
    );
  }, [sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearnError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner asOverlay />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </>
  );
};

export default Users;
