import { useContext, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '../../shared/components/FormElements/Button';
import Input from '../../shared/components/FormElements/Input';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from '../../shared/util/validators';

import './PlaceForm.css';

const UpdatePlace = () => {
  const authContext = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false,
      },
      description: {
        value: '',
        isValid: false,
      },
      address: {
        value: '',
        isValid: false,
      },
    },
    false
  );

  const placeId = useParams().placeId;
  const history = useHistory();

  useEffect(() => {
    sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`).then(
      (responseData) => {
        console.log(responseData);
        setFormData(
          {
            title: {
              value: responseData.place.title,
              isValid: true,
            },
            description: {
              value: responseData.place.description,
              isValid: true,
            },
            address: {
              value: responseData.place.address,
              isValid: true,
            },
          },
          true
        );
      }
    );
  }, [setFormData, sendRequest, placeId]);

  // if (!identifiedPlace) {
  //   return (
  //     <div className="center">
  //       <Card>
  //         <h2>Could not find place!</h2>
  //       </Card>
  //     </div>
  //   );
  // }

  const placeSubmitHandler = (event) => {
    event.preventDefault();
    sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + authContext.token,
      },
      body: JSON.stringify({
        title: formState.inputs.title.value,
        description: formState.inputs.description.value,
      }),
    }).then((responseData) => {
      history.push(`/${authContext.userId}/places`);
    });
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && (
        <form className="place-form" onSubmit={placeSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={formState.inputs.title.value}
            initialValid={formState.inputs.title.isValid}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (min. 5 characters)."
            onInput={inputHandler}
            initialValue={formState.inputs.description.value}
            initialValid={formState.inputs.description.isValid}
          />
          <Input
            id="address"
            element="input"
            type="text"
            label="Address"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid address."
            onInput={inputHandler}
            initialValue={formState.inputs.address.value}
            initialValid={formState.inputs.address.isValid}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </>
  );
};

export default UpdatePlace;
