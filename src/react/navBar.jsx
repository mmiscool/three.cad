

import React, { useEffect, useReducer } from 'react';

import { useDispatch, useSelector } from 'react-redux'

import { FaEdit } from 'react-icons/fa'
import { MdSave } from 'react-icons/md'
import { FaFolderOpen } from 'react-icons/fa'

import * as Icon from "./icons";
import { Dialog } from './dialog'
import { STLExport, savePart } from './fileExporter'


const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();

}


function saveArrayBuffer(buffer, filename) {

  save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

}




export const NavBar = () => {
  const dispatch = useDispatch()
  const activeSketchId = useSelector(state => state.treeEntries.activeSketchId)
  const treeEntriesById = useSelector(state => state.treeEntries.byId)

  const boolOp = (code) => {
    if (sc.selected.length != 2 || !sc.selected.every(e => e.userData.type == 'mesh')) return
    const [m1, m2] = sc.selected
    sc.boolOp(m1, m2, code)
    sc.render()
    forceUpdate()
  }

  const addSketch = () => {
    sc.addSketch()
    dispatch({ type: 'set-dialog', action: 'sketch' })

    forceUpdate()
  }

  useEffect(() => {  // hacky way to handle mounting and unmounting mouse listeners for feature mode
    if (!activeSketchId) {
      sc.canvas.addEventListener('pointermove', sc.onHover)
      sc.canvas.addEventListener('pointerdown', sc.onPick)
      return () => {
        sc.canvas.removeEventListener('pointermove', sc.onHover)
        sc.canvas.removeEventListener('pointerdown', sc.onPick)
      }
    }
  }, [activeSketchId])

  const sketchModeButtons = [
    [Icon.Extrude, () => {
      dispatch({ type: 'finish-sketch' })
      dispatch({ type: 'set-dialog', action: 'extrude', target: sc.activeSketch })

    }, 'Extrude [e]'],
    [Icon.Dimension, () => sc.activeSketch.command('d'), 'Dimension [d]'],
    [Icon.Line, () => sc.activeSketch.command('l'), 'Line [l]'],
    [Icon.Arc, () => sc.activeSketch.command('a'), 'Arc [a]'],
    [Icon.Coincident, () => sc.activeSketch.command('c'), 'Coincident [c]'],
    [Icon.Vertical, () => sc.activeSketch.command('v'), 'Vertical [v]'],
    [Icon.Horizontal, () => sc.activeSketch.command('h'), 'Horizontal [h]'],
    [Icon.Tangent, () => sc.activeSketch.command('t'), 'Tangent [t]'],
  ]


  const partModeButtons = [
    [FaEdit, addSketch, 'Sketch [s]'],
    [Icon.Extrude, () => {
      dispatch({ type: 'set-dialog', action: 'extrude', target: treeEntriesById[sc.selected[0].name] })
    }, 'Extrude [e]'],

    [Icon.Union, () => boolOp('u'), 'Union'],
    [Icon.Subtract, () => boolOp('s'), 'Subtract'],
    [Icon.Intersect, () => boolOp('i'), 'Intersect'],
    [MdSave, savePart, 'Save [ctrl+s]'],
    [FaFolderOpen, () => boolOp('i'), 'Load'],
    [Icon.Stl, STLExport, 'Export STL'],
  ]

  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  return <div className='topNav flex justify-center items-center bg-gray-700'>

    <div className='w-auto h-full flex-1 flex items-center justify-end'>
      <Dialog />
    </div>
    <div className='w-auto h-full flex-none'>
      {
        activeSketchId ?
          sketchModeButtons.map(([Icon, fcn, txt, shortcut], idx) => (
            <Icon className="btn w-auto h-full p-3.5" tooltip={txt}
              onClick={fcn} key={idx}
            />
          ))
          :
          partModeButtons.map(([Icon, fcn, txt, shortcut], idx) => (
            <Icon className="btn w-auto h-full p-3.5" tooltip={txt}
              onClick={fcn} key={idx}
            />
          ))
      }
    </div>
    <div className='w-auto h-full flex-1 items-center'>
    </div>

  </div>
}