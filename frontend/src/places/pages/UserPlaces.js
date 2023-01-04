import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import PlaceList from '../components/PlaceList';

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  useEffect(() => {
    sendRequest(`http://localhost:3001/api/places/user/${userId}`).then(
      (responseData) => {
        setLoadedPlaces(responseData.places);
      }
    );
  }, [sendRequest, userId]);

  const onDeletePlaceHandler = (deeltePlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deeltePlaceId)
    );
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={onDeletePlaceHandler} />
      )}
    </>
  );
};

export default UserPlaces;
