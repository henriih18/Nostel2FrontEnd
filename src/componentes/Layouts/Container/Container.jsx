import React from 'react'
import './Container.css'

export const Container = ({children}) => {

  const content = 0 /* `
    w-screen h-screen bg-violet-950 flex justify-center items-center text-4xl text-white
  ` */

  return (
    <div className= "content" >
      { children }
    </div>
  )
}
