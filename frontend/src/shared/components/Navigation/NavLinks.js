import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = () => {
  const authContext = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" exact>
          ALL USERS
        </NavLink>
      </li>
      {authContext.isLoggedIn && (
        <>
          <li>
            <NavLink to={`/${authContext.userId}/places`}>MY PLACES</NavLink>
          </li>
          <li>
            <NavLink to="/places/new">ADD PLACE</NavLink>
          </li>
          <li>
            <button onClick={authContext.logout}>LOGOUT</button>
          </li>
        </>
      )}
      {!authContext.isLoggedIn && (
        <li>
          <NavLink to="/auth">AUTHENTICATE</NavLink>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
