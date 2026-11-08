// Реестр генераторов математики: какой генератор отвечает за какой навык SAT.

import { inequalities, linEq, linFunc, linModel, systems } from './algebra.js';
import { equivalent, exponential, functions, nonlinear, quadratics } from './advanced.js';
import { models, percent, probability, ratios, stats } from './data.js';
import { angles, areaVolume, circles, rightTri, similar } from './geometry.js';
import { SKILLS } from '../skills.js';

const REGISTRY = {
  'lin-eq': linEq,
  'lin-func': linFunc,
  'lin-model': linModel,
  systems,
  inequalities,
  quadratics,
  equivalent,
  exponential,
  functions,
  nonlinear,
  ratios,
  percent,
  stats,
  probability,
  models,
  'area-volume': areaVolume,
  angles,
  'right-tri': rightTri,
  circles,
  similar,
};

export const MATH_GENERATORS = Object.entries(REGISTRY).map(([skill, make]) => ({
  skill,
  domain: SKILLS[skill].domain,
  make,
}));
