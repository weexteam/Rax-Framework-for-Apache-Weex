const easyfile = require('easyfile');
const path = require('path');

const whitelist = [
  'typeof',
  // 'jsx',
  'asyncToGenerator',
  'classCallCheck',
  'createClass',
  'defineEnumerableProperties',
  'defaults',
  'defineProperty',
  'extends',
  'get',
  'inherits',
  'instanceof',
  'interopRequireDefault',
  'interopRequireWildcard',
  'newArrowCheck',
  'objectDestructuringEmpty',
  'objectWithoutProperties',
  'possibleConstructorReturn',
  'selfGlobal',
  'set',
  'slicedToArray',
  'slicedToArrayLoose',
  'taggedTemplateLiteral',
  'taggedTemplateLiteralLoose',
  'temporalRef',
  'temporalUndefined',
  'toArray',
  'toConsumableArray'
];

const helpersCode = require('babel-core').buildExternalHelpers(whitelist, 'umd');
const targetFile = path.join(__dirname, '../src/babelHelpers.js');
easyfile.write(targetFile, helpersCode, {force: true});
console.log(`Generate babelHelpers(${whitelist}) to ${targetFile}`);
