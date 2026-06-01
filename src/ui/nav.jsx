
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, Users, User } from '../assets/icons.jsx';

export default function BottomNav() {
  return (
    <nav className="bottom-navbar">
      <NavLink to="/feed" className={({ isActive }) => isActive? "nav-icon active" : "nav-icon"}>
        <Home size={28} />
      </NavLink>

      <NavLink to="/create" className={({ isActive }) => isActive? "nav-icon active" : "nav-icon"}>
        <PlusCircle size={28} />
      </NavLink>

      <NavLink to="/inbox" className={({ isActive }) => isActive? "nav-icon active" : "nav-icon"}>
        <MessageSquare size={28} />
      </NavLink>

      <NavLink to="/friends" className={({ isActive }) => isActive? "nav-icon active" : "nav-icon"}>
        <Users size={28} />
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => isActive? "nav-icon active" : "nav-icon"}>
        <User size={28} />
      </NavLink>
    </nav>
  );
}
