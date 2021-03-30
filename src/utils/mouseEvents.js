import * as THREE from 'three/src/Three';
import { raycaster, color } from './static';

export function onHover(e) {
  if (this.mode || e.buttons) return

  raycaster.setFromCamera(
    new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      - (e.clientY / window.innerHeight) * 2 + 1
    ),
    this.camera
  );

  let hoverPts;
  if (this.name == 'Scene') {
    hoverPts = raycaster.intersectObjects(this.children, true)
  } else {
    hoverPts = raycaster.intersectObjects(this.children)
  }

  let idx = []
  if (hoverPts.length) {
    // console.log(hoverPts)
    let minDist = Infinity;
    for (let i = 0; i < hoverPts.length; i++) {
      if (!hoverPts[i].distanceToRay) continue;
      if (hoverPts[i].distanceToRay < minDist) {
        minDist = hoverPts[i].distanceToRay
        idx = [i]
      } else if (hoverPts[i].distanceToRay == minDist) {
        idx.push(i)
      }
    }
    if (!idx.length) idx.push(0)
  }

  if (idx.length) {
    if (hoverPts[idx[0]].object != this.hovered[0]) {

      for (let x = 0; x < this.hovered.length; x++) {
        const obj = this.hovered[x]
        if (obj && !this.selected.includes(obj)) {
          obj.material.color.set(0x555555)
        }
      }
      this.hovered = []

      for (let x = 0; x < idx.length; x++) {
        const i = idx[x]
        hoverPts[i].object.material.color.set(color.hover)
        this.hovered.push(hoverPts[i].object)
      }

      // console.log('render1')
      this.dispatchEvent({ type: 'change' })
    }
  } else {
    if (this.hovered.length) {

      for (let x = 0; x < this.hovered.length; x++) {
        const obj = this.hovered[x]
        if (obj && !this.selected.includes(obj)) {
          // console.log(obj)
          obj.material.color.set(0x555555)
        }
      }
      this.hovered = []

      // console.log('render2')
      this.dispatchEvent({ type: 'change' })
    }
  }
}


export function onPick(e) {
  if (this.mode || e.buttons != 1) return

  if (this.hovered.length) {

    this.selected.push(this.hovered[this.hovered.length-1])

    if (this.hovered[0].type == "Points") {
      this.canvas.addEventListener('pointermove', this.onDrag);
      this.canvas.addEventListener('pointerup', this.onRelease)
    }
  } else {
    for (let obj of this.selected) {
      obj.material.color.set(0x555555)
    }
    this.dispatchEvent({ type: 'change' })
    this.selected = []
  }
}

export function onDrag(e) {
  const mouseLoc = this.getLocation(e);

  for (let x = 0; x < this.hovered.length; x++) {
    const obj = this.hovered[x]
    this.ptsBuf.set(
      mouseLoc,
      this.objIdx.get(obj.id) * 3
    )
  }

  this.solve()
  this.dispatchEvent({ type: 'change' })
}


export function onRelease() {
  this.canvas.removeEventListener('pointermove', this.onDrag)
  this.canvas.removeEventListener('pointerup', this.onRelease)

  for (let x = 0; x < this.hovered.length; x++) {
    const obj = this.hovered[x]
    obj.geometry.computeBoundingSphere()
  }

}
