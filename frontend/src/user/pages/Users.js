import UsersList from '../components/UsersList';

const Users = () => {
  const USERS = [
    {
      id: 'u1',
      name: 'techarm',
      image: 'https://picsum.photos/200/300',
      places: 3,
    },
  ];
  return <UsersList items={USERS} />;
};

export default Users;
