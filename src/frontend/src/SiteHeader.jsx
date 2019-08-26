import React from 'react';
import { Link } from "react-router-dom";

const UserMenuLoggedIn = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  {YangConfig.user.email}
                </a>
                <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                  <Link className="dropdown-item" to="/a/add">Add Question</Link>
                  {YangConfig.user.is_approver &&
                   <Link className="dropdown-item" to="/a/approvals">Approvals</Link>
                  }
                  <a className="dropdown-item" href="/logout">Logout</a>
                </div>
              </li>
            </ul>
          </div>
        </nav>
    );
};

const UserMenuAnon = () => {
    return <a className="btn btn-outline-info" href="/login">Login</a>;
};

const SiteHeader = () => {
    return (
        <div>
          <header className="py-3 yang-header mb-5 pr-3">
            <div className="row flex-nowrap justify-content-between align-items-center">
              <div className="col-4 pt-1"></div>
              <div className="col-4 text-center">
                <Link to="/" className="yang-center-header">
                  <span className="bg-blue-brand">Yang</span>
                  <span className="bg-red-brand">Explains!</span>
                </Link>
              </div>
              <div className="col-4 d-flex justify-content-end align-items-center">
                {YangConfig.user ? <UserMenuLoggedIn /> : <UserMenuAnon />}
              </div>
            </div>
          </header>
        </div>
    );
};

export default SiteHeader;
