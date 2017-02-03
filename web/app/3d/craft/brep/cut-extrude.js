import {Matrix3, ORIGIN} from '../../../math/l3space'
import * as math from '../../../math/math'
import Vector from '../../../math/vector'
import {Extruder} from '../../../brep/brep-builder'
import {BREPValidator} from '../../../brep/brep-validator'
import {subtract} from '../../../brep/operations/boolean'
import {Loop} from '../../../brep/topo/loop'
import {Shell} from '../../../brep/topo/shell'
import {ReadSketchFromFace} from './sketch-reader'

import {BREPSceneSolid} from '../../scene/brep-scene-object'

export function Extrude(app, params) {
  
}

export function Cut(app, params) {
  const face = app.findFace(params.face);
  const solid = face.solid;

  const sketch = ReadSketchFromFace(app, face);
  for (let polygon of sketch) {
    if (!Loop.isPolygonCCWOnSurface(polygon, face.brepFace.surface)) {
      polygon.reverse();
    }
  }

  const extruder = new ParametricExtruder(face, params);
  console.error('normal should be explicitly passed to the extruder#extrude method. there is no way to guess normal from points of sketch!');
  const cutter = combineCutters(sketch.map(s => extruder.extrude(s))) ;
  BREPValidator.validateToConsole(cutter);
  solid.vanish();
  app.viewer.render();//just for debug purposes
  const newSolid = new BREPSceneSolid(subtract(solid.shell, cutter));
  //const newSolid = new BREPSceneSolid(cutter);
  
  app.viewer.workGroup.add(newSolid.cadGroup);
  app.bus.notify('solid-list', {
    solids: [],
    needRefresh: [newSolid]
  });

}

function combineCutters(cutters) {
  if (cutters.length == 1) {
    return cutters[0];
  }
  const cutter = new Shell();
  cutters.forEach(c => c.faces.forEach(f => cutter.faces.push(f)));
  return cutter;
}

export class ParametricExtruder extends Extruder {
  
  constructor(face, params) {
    super();
    this.face = face;
    this.params = params;
  }
  
  prepareLidCalculation(baseNormal, lidNormal) {
    let target;
    if (this.params.rotation != 0) {
      const basis = this.face.basis();
      target = Matrix3.rotateMatrix(this.params.rotation * Math.PI / 180, basis[0], ORIGIN).apply(lidNormal);
      if (this.params.angle != 0) {
        target = Matrix3.rotateMatrix(this.params.angle * Math.PI / 180, basis[2], ORIGIN)._apply(target);
      }
      target._multiply(Math.abs(this.params.value));
    } else {
      target = lidNormal.multiply(Math.abs(this.params.value));
    }
    this.target = target;
  }

  calculateLid(basePoints) {
    if (this.params.prism != 1) {
      const scale = this.params.prism < 0.001 ? 0.0001 : this.params.prism;
      const _3Dtr = this.face.brepFace.surface.get3DTransformation();
      const _2Dtr = _3Dtr.invert();
      const poly2d = basePoints.map(p => _2Dtr.apply(p));
      basePoints = math.polygonOffset(poly2d, scale).map(p => _3Dtr.apply(p));
    }
    return basePoints.map(p => p.plus(this.target));
  }
}
