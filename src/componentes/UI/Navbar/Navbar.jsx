import React from 'react'
import './Navbar.css'
import { NavLink } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav>
      <ul>
        <li><NavLink to='/'>Inicio</NavLink></li>
        <li><NavLink to='/gestion-aprendices'>Aprendices</NavLink></li>
        <li><NavLink to='/gestion-fichas'>Fichas</NavLink></li>
        <li><NavLink to='/seguimiento-instructores'>Instructores</NavLink></li>
        <li><NavLink to='/gestion-programas'>Programas</NavLink></li>
        <li><NavLink to='/aboutUs'>Acerca de Nosotros</NavLink></li>
      </ul>
    </nav>
  )
}

export default Navbar;