import React from "react";
import "./AboutUs.css";

export const AboutUs = () => (
  <div className="aboutus-container">
    <h1 className="aboutus-title">Sobre Nosotros</h1>
    <p className="aboutus-text">
      Nostel es un sistema integral diseñado para optimizar la gestión de aprendices, instructores, fichas y programas del SENA Colombia. Nuestro objetivo es facilitar los procesos administrativos y de seguimiento, permitiendo a los instructores registrar y consultar actas de actividades complementarias, planes de mejoramiento y comentarios de manera eficiente, mientras se gestionan las fichas y los instructores de forma centralizada.
    </p>

    <h2 className="aboutus-subtitle">Misión</h2>
    <p className="aboutus-text">
      Nuestra misión es proporcionar una herramienta tecnológica que simplifique la administración de los procesos formativos del SENA, asegurando un seguimiento claro y organizado de las actividades de los aprendices, con un enfoque en la mejora continua y el cumplimiento de los estándares educativos.
    </p>

    <h2 className="aboutus-subtitle">Visión</h2>
    <p className="aboutus-text">
      Aspiramos a convertirnos en la solución líder para la gestión educativa dentro del SENA, siendo reconocidos por nuestra capacidad para integrar tecnología y educación, ofreciendo una experiencia intuitiva y confiable para instructores y administradores.
    </p>

    <h2 className="aboutus-subtitle">Objetivos</h2>
    <ul className="aboutus-list">
      <li>Facilitar la creación y consulta de actas de actividades complementarias, planes de mejoramiento y comentarios.</li>
      <li>Centralizar la gestión de fichas e instructores, permitiendo un acceso rápido y eficiente a la información.</li>
      <li>Mejorar la comunicación y el seguimiento entre instructores y aprendices mediante un sistema organizado y accesible.</li>
      <li>Contribuir al desarrollo educativo del SENA mediante herramientas que promuevan la eficiencia y la calidad en la gestión formativa.</li>
    </ul>
  </div>
);
