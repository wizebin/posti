function NotSvg(parent, props) {
  var that = me(this, props);
  this.view = spawnFromHtml(`
    <svg max-width="100%" max-height="100%" viewBox="226 327 48 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="not" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(226.000000, 327.000000)">
            <path d="M28.763932,12 L12,3.61803399 L12,20.381966 L28.763932,12 Z M10,23.618034 L10,0.381966011 L33.236068,12 L10,23.618034 Z" id="Triangle-Copy" fill="currentColor" fill-rule="nonzero"></path>
            <path d="M36,16 C33.790861,16 32,14.209139 32,12 C32,9.790861 33.790861,8 36,8 C38.209139,8 40,9.790861 40,12 C40,14.209139 38.209139,16 36,16 Z M36,14 C37.1045695,14 38,13.1045695 38,12 C38,10.8954305 37.1045695,10 36,10 C34.8954305,10 34,10.8954305 34,12 C34,13.1045695 34.8954305,14 36,14 Z" id="Oval-2-Copy" fill="currentColor" fill-rule="nonzero"></path>
            <polygon id="Line-Copy" fill="currentColor" fill-rule="nonzero" points="7 11 0 11 0 13 7 13"></polygon>
            <polygon id="Line-Copy-3" fill="currentColor" fill-rule="nonzero" points="48 11 41 11 41 13 48 13"></polygon>
        </g>
    </svg>
  `, parent, { style: objectAssign({ maxWidth: '100%', maxHeight: '100%' }, this.style) });
}

function NandSvg(parent, props) {
  var that = me(this, props);
  this.view = spawnFromHtml(`
    <svg max-width="100%" max-height="100%" viewBox="280 329 47 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="nand" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(280.000000, 329.000000)">
            <path d="M14,18 L23,18 C23.1660768,18 23.5384751,17.9704446 24.0420715,17.877186 C24.8968393,17.7188957 25.7490805,17.4348153 26.5287141,17.0016854 C28.7119332,15.788786 30,13.6420079 30,10 C30,6.35799207 28.7119332,4.21121401 26.5287141,2.99831455 C25.7490805,2.56518474 24.8968393,2.28110434 24.0420715,2.12281401 C23.5384751,2.02955541 23.1660768,2 23,2 L14,2 L14,18 Z M12,0 L23,0 C23,0 32,0 32,10 C32,20 23,20 23,20 L12,20 L12,0 Z" id="Rectangle" fill="currentColor" fill-rule="nonzero"></path>
            <path d="M35,14 C32.790861,14 31,12.209139 31,10 C31,7.790861 32.790861,6 35,6 C37.209139,6 39,7.790861 39,10 C39,12.209139 37.209139,14 35,14 Z M35,12 C36.1045695,12 37,11.1045695 37,10 C37,8.8954305 36.1045695,8 35,8 C33.8954305,8 33,8.8954305 33,10 C33,11.1045695 33.8954305,12 35,12 Z" id="Oval-2-Copy-2" fill="currentColor" fill-rule="nonzero"></path>
            <polygon id="Line-Copy-5" fill="currentColor" fill-rule="nonzero" points="10 4 0 4 0 6 10 6"></polygon>
            <polygon id="Line-Copy-11" fill="currentColor" fill-rule="nonzero" points="10 14 0 14 0 16 10 16"></polygon>
            <polygon id="Line-Copy-4" fill="currentColor" fill-rule="nonzero" points="47 9 40 9 40 11 47 11"></polygon>
        </g>
    </svg>
  `, parent, { style: objectAssign({ maxWidth: '100%', maxHeight: '100%' }, this.style) });
}

function NorSvg(parent, props) {
  var that = me(this, props);
  this.view = spawnFromHtml(`
    <svg max-width="100%" max-height="100%" viewBox="226 361 48 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="nor" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(226.000000, 362.000000)">
            <path d="M13.9272383,2 C13.7877287,1.66195872 13.6550326,1.35896718 13.5358967,1.0972092 L14.1872001,7.49400542e-16 L15.2369569,-5.68434189e-14 C15.4964465,0.553514996 15.7859196,1.22767011 16.0792717,2 L13.9272383,2 Z M16.2433563,2.44144366 C17.1688356,4.98621596 17.7275899,7.54687525 17.7275899,10 C17.7275899,12.4531248 17.1688356,15.013784 16.2433563,17.5585563 C16.1886393,17.7090106 16.1338882,17.8562069 16.0792717,18 L23.458708,18 C23.7205551,17.842585 24.0092615,17.6627249 24.3184591,17.462319 C25.3104757,16.8193453 26.3020512,16.1032074 27.2196312,15.3385574 C29.6115113,13.345324 31,11.4168675 31,10 C31,8.58313251 29.6115113,6.65467596 27.2196312,4.66144256 C26.3020512,3.89679259 25.3104757,3.18065469 24.3184591,2.53768097 C24.0092615,2.3372751 23.7205551,2.15741499 23.458707,2 L16.0792717,2 C16.1338882,2.14379315 16.1886393,2.29098936 16.2433563,2.44144366 Z M13,0 L24,0 C24,0 33,5 33,10 C33,15 24,20 24,20 L13,20 C13,20 15.7275899,15 15.7275899,10 C15.7275899,5 13,0 13,0 Z" id="Rectangle-Copy-4" fill="currentColor" fill-rule="nonzero"></path>
            <polygon id="Line-Copy-20" fill="currentColor" fill-rule="nonzero" points="13 4 0 4 0 6 13 6"></polygon>
            <polygon id="Line-Copy-19" fill="currentColor" fill-rule="nonzero" points="13 14 0 14 0 16 13 16"></polygon>
            <path d="M36,14 C33.790861,14 32,12.209139 32,10 C32,7.790861 33.790861,6 36,6 C38.209139,6 40,7.790861 40,10 C40,12.209139 38.209139,14 36,14 Z M36,12 C37.1045695,12 38,11.1045695 38,10 C38,8.8954305 37.1045695,8 36,8 C34.8954305,8 34,8.8954305 34,10 C34,11.1045695 34.8954305,12 36,12 Z" id="Oval-2-Copy-3" fill="currentColor" fill-rule="nonzero"></path>
            <polygon id="Line-Copy-6" fill="currentColor" fill-rule="nonzero" points="48 9 41 9 41 11 48 11"></polygon>
        </g>
    </svg>
  `, parent, { style: objectAssign({ maxWidth: '100%', maxHeight: '100%' }, this.style) });
}

function AndSvg(parent, props) {
  var that = me(this, props);
  this.view = spawnFromHtml(`
    <svg max-width="100%" max-height="100%" viewBox="280 362 47 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="and" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(280.000000, 362.000000)">
            <path d="M14,18 L23,18 C23.1660768,18 23.5384751,17.9704446 24.0420715,17.877186 C24.8968393,17.7188957 25.7490805,17.4348153 26.5287141,17.0016854 C28.7119332,15.788786 30,13.6420079 30,10 C30,6.35799207 28.7119332,4.21121401 26.5287141,2.99831455 C25.7490805,2.56518474 24.8968393,2.28110434 24.0420715,2.12281401 C23.5384751,2.02955541 23.1660768,2 23,2 L14,2 L14,18 Z M12,0 L23,0 C23,0 32,0 32,10 C32,20 23,20 23,20 L12,20 L12,0 Z" id="Rectangle-Copy" fill="currentColor" fill-rule="nonzero"></path>
            <polygon id="Line-Copy-9" fill="currentColor" fill-rule="nonzero" points="10 4 0 4 0 6 10 6"></polygon>
            <polygon id="Line-Copy-10" fill="currentColor" fill-rule="nonzero" points="10 14 0 14 0 16 10 16"></polygon>
            <polygon id="Line-Copy-8" fill="currentColor" fill-rule="nonzero" points="47 9 33 9 33 11 47 11"></polygon>
        </g>
    </svg>
  `, parent, { style: objectAssign({ maxWidth: '100%', maxHeight: '100%' }, this.style) });
}

function XorSvg(parent, props) {
  var that = me(this, props);
  this.view = spawnFromHtml(`
    <svg max-width="100%" max-height="100%" viewBox="226 394 48 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="xor" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(226.000000, 395.000000)">
            <path d="M13.9272383,2 C13.7877287,1.66195872 13.6550326,1.35896718 13.5358967,1.0972092 L14.1872001,7.49400542e-16 L15.2369569,-5.68434189e-14 C15.4964465,0.553514996 15.7859196,1.22767011 16.0792717,2 L13.9272383,2 Z M16.2433563,2.44144366 C17.1688356,4.98621596 17.7275899,7.54687525 17.7275899,10 C17.7275899,12.4531248 17.1688356,15.013784 16.2433563,17.5585563 C16.1886393,17.7090106 16.1338882,17.8562069 16.0792717,18 L23.458708,18 C23.7205551,17.842585 24.0092615,17.6627249 24.3184591,17.462319 C25.3104757,16.8193453 26.3020512,16.1032074 27.2196312,15.3385574 C29.6115113,13.345324 31,11.4168675 31,10 C31,8.58313251 29.6115113,6.65467596 27.2196312,4.66144256 C26.3020512,3.89679259 25.3104757,3.18065469 24.3184591,2.53768097 C24.0092615,2.3372751 23.7205551,2.15741499 23.458707,2 L16.0792717,2 C16.1338882,2.14379315 16.1886393,2.29098936 16.2433563,2.44144366 Z M13,0 L24,0 C24,0 33,5 33,10 C33,15 24,20 24,20 L13,20 C13,20 15.7275899,15 15.7275899,10 C15.7275899,5 13,0 13,0 Z" id="Rectangle-Copy-3" fill="currentColor" fill-rule="nonzero"></path>
            <polygon id="Line-Copy-17" fill="currentColor" fill-rule="nonzero" points="7 4 0 4 0 6 7 6"></polygon>
            <polygon id="Line-Copy-16" fill="currentColor" fill-rule="nonzero" points="7 14 0 14 0 16 7 16"></polygon>
            <polygon id="Line-Copy-15" fill="currentColor" fill-rule="nonzero" points="48 9 34 9 34 11 48 11"></polygon>
            <path d="M8.15958614,2.04194515 C8.22291988,2.14015907 8.3451442,2.34680882 8.50681724,2.65033638 C8.78179757,3.16658884 9.05797782,3.75727212 9.31612061,4.41057368 C10.0518418,6.27251917 10.4922982,8.25054521 10.4922982,10.25 C10.4922982,12.2494548 10.0518418,14.2274808 9.31612061,16.0894263 C9.05797782,16.7427279 8.78179757,17.3334112 8.50681724,17.8496636 C8.3451442,18.1531912 8.22291988,18.3598409 8.15958614,18.4580549 L7.61764099,19.2984687 L9.29846872,20.382359 L9.84041386,19.5419451 C9.93284875,19.398603 10.0832195,19.1443649 10.2720259,18.7898967 C10.581178,18.2094897 10.8891301,17.550854 11.1761775,16.8244013 C11.9981427,14.7441916 12.4922982,12.5250107 12.4922982,10.25 C12.4922982,7.97498927 11.9981427,5.75580842 11.1761775,3.67559873 C10.8891301,2.94914598 10.581178,2.2905103 10.2720259,1.71010327 C10.0832195,1.35563515 9.93284875,1.10139697 9.84041386,0.958054855 L9.29846872,0.117640993 L7.61764099,1.20153128 L8.15958614,2.04194515 Z" id="Line" fill="currentColor" fill-rule="nonzero"></path>
        </g>
    </svg>
  `, parent, { style: objectAssign({ maxWidth: '100%', maxHeight: '100%' }, this.style) });
}

function OrSvg(parent, props) {
  var that = me(this, props);
  this.view = spawnFromHtml(`
    <svg max-width="100%" max-height="100%" viewBox="280 394 47 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="or" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(280.000000, 395.000000)">
            <path d="M12.9272383,2 C12.7877287,1.66195872 12.6550326,1.35896718 12.5358967,1.0972092 L13.1872001,7.49400542e-16 L14.2369569,-5.68434189e-14 C14.4964465,0.553514996 14.7859196,1.22767011 15.0792717,2 L12.9272383,2 Z M15.2433563,2.44144366 C16.1688356,4.98621596 16.7275899,7.54687525 16.7275899,10 C16.7275899,12.4531248 16.1688356,15.013784 15.2433563,17.5585563 C15.1886393,17.7090106 15.1338882,17.8562069 15.0792717,18 L22.458708,18 C22.7205551,17.842585 23.0092615,17.6627249 23.3184591,17.462319 C24.3104757,16.8193453 25.3020512,16.1032074 26.2196312,15.3385574 C28.6115113,13.345324 30,11.4168675 30,10 C30,8.58313251 28.6115113,6.65467596 26.2196312,4.66144256 C25.3020512,3.89679259 24.3104757,3.18065469 23.3184591,2.53768097 C23.0092615,2.3372751 22.7205551,2.15741499 22.458707,2 L15.0792717,2 C15.1338882,2.14379315 15.1886393,2.29098936 15.2433563,2.44144366 Z M12,0 L23,0 C23,0 32,5 32,10 C32,15 23,20 23,20 L12,20 C12,20 14.7275899,15 14.7275899,10 C14.7275899,5 12,0 12,0 Z" id="Rectangle-Copy-2" fill="currentColor" fill-rule="nonzero"></path>
            <polygon id="Line-Copy-14" fill="currentColor" fill-rule="nonzero" points="12 4 0 4 0 6 12 6"></polygon>
            <polygon id="Line-Copy-13" fill="currentColor" fill-rule="nonzero" points="12 14 0 14 0 16 12 16"></polygon>
            <polygon id="Line-Copy-12" fill="currentColor" fill-rule="nonzero" points="47 9 33 9 33 11 47 11"></polygon>
        </g>
    </svg>
  `, parent, { style: objectAssign({ maxWidth: '100%', maxHeight: '100%' }, this.style) });
}