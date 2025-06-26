import React from 'react'
import './Container.css'
import ContainerNavbar from "../ContainerNavbar/ContainerNavbar";

export const Container = ({children}) => {

  const content = 0 /* `
    w-screen h-screen bg-violet-950 flex justify-center items-center text-4xl text-white
  ` */

  return (
    <>
    <ContainerNavbar />
    <div className= "content" >
      
      { children }
    </div>
    </>
    
  )
}
