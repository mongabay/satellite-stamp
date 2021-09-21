import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

const Attributions = ({ attributions, exporting }) => (
  <div className="c-tool-attributions">
    {exporting && (
      <img src={`${process.env.BASE_PATH ?? ''}/images/mongabay-horizontal.jpg`} alt="Mongabay" />
    )}
    {!exporting && <div />}
    <div className="d-flex align-items-center">
      <a
        href="https://www.mapbox.com/about/maps/"
        target="_blank"
        rel="noopener noreferrer"
        className="d-inline-block mt-1"
      >
        <svg width="70" height="18" viewBox="0 0 70 18">
          <title>Mapbox</title>
          <g fillRule="nonzero" fill="none" opacity=".601">
            <path
              d="M62.205 11.985a4.513 4.513 0 0 1-2.937 1.08A4.51 4.51 0 0 1 55.4 10.89c-.738 1.301-2.092 2.175-3.637 2.175a4.073 4.073 0 0 1-1.767-.399 1.15 1.15 0 0 1-.688.228h-1.155c-.64 0-1.162-.522-1.162-1.163v-.625c-.76 1.18-2.049 1.959-3.507 1.959-.447 0-.882-.071-1.293-.208v1.545c0 .64-.521 1.163-1.162 1.163h-1.154c-.64 0-1.162-.523-1.162-1.163v-2.066a1.162 1.162 0 0 1-.991.558h-1.155c-.26 0-.5-.086-.694-.23a4.092 4.092 0 0 1-1.761.4c-1.34 0-2.535-.655-3.31-1.676v.342c0 .642-.521 1.163-1.162 1.163h-1.163c-.64 0-1.16-.52-1.16-1.161V7.94c0-.275-.19-.44-.373-.44-.123 0-.284.181-.337.448l.009 3.78c0 .643-.522 1.164-1.162 1.164h-1.163c-.64 0-1.162-.52-1.162-1.161V7.94c0-.275-.188-.44-.372-.44-.133 0-.337.222-.355.57v3.66c0 .641-.52 1.162-1.16 1.162h-1.155c-.64 0-1.162-.52-1.162-1.161V5.53c0-.641.521-1.163 1.162-1.163h1.155c.21 0 .406.056.576.155a3.16 3.16 0 0 1 1.396-.327c.805 0 1.556.27 2.152.746a3.244 3.244 0 0 1 2.024-.746c1.431 0 2.655.85 3.158 2.05.752-1.232 2.069-2.05 3.564-2.05.62 0 1.22.137 1.766.399.193-.142.43-.227.689-.227h1.155c.486 0 .903.3 1.076.725.173-.424.59-.725 1.077-.725h1.154c.26 0 .5.086.693.23a4.096 4.096 0 0 1 1.762-.403c1.458 0 2.747.779 3.507 1.96V2.86c0-.641.521-1.162 1.162-1.162h1.155c.64 0 1.16.52 1.16 1.162v1.548c.416-.14.853-.213 1.295-.213 1.545 0 2.899.874 3.637 2.176a4.51 4.51 0 0 1 3.867-2.176c1.129 0 2.161.413 2.952 1.093.104-.523.568-.92 1.122-.92h1.336c.447 0 .852.227 1.081.607l.33.552.33-.554c.223-.378.639-.613 1.084-.613h1.335c.23 0 .45.065.634.189.529.353.67 1.068.319 1.591l-1.625 2.474 1.68 2.555.025.052c.086.17.129.35.129.538 0 .63-.514 1.144-1.145 1.144h-1.318c-.445 0-.861-.235-1.086-.614l-.352-.587-.356.591a1.27 1.27 0 0 1-1.083.61h-1.335c-.223 0-.438-.062-.622-.181a1.182 1.182 0 0 1-.498-.736zm1.54-2.954l.269-.409-.27-.411a4.413 4.413 0 0 1 .001.82zM50.48 8.62c.004.628.461 1.114 1.017 1.114.561 0 1.018-.495 1.018-1.103 0-.609-.457-1.105-1.018-1.105-.56 0-1.008.48-1.017 1.094zm7.762.01c0 .61.457 1.104 1.018 1.104.561 0 1.018-.495 1.018-1.103 0-.609-.457-1.105-1.018-1.105-.561 0-1.018.496-1.018 1.105zm-24.879 0c0 .61.457 1.104 1.018 1.104.556 0 1.012-.486 1.017-1.086-.005-.635-.46-1.122-1.017-1.122-.561 0-1.018.496-1.018 1.105zM42.2 8.62c.005.629.462 1.115 1.018 1.115.561 0 1.018-.495 1.018-1.103 0-.609-.457-1.105-1.018-1.105-.56 0-1.008.48-1.018 1.093zM0 8.63C0 3.87 3.872 0 8.63 0c4.76 0 8.63 3.87 8.63 8.63 0 4.758-3.87 8.63-8.63 8.63-4.758 0-8.63-3.872-8.63-8.63z"
              fill="#FFF"
            />
            <path
              d="M51.496 10.707c1.095 0 1.99-.93 1.99-2.077 0-1.145-.886-2.076-1.99-2.076-1.093 0-1.971.913-1.99 2.05v.052c.01 1.138.897 2.05 1.99 2.05zm.268-5.54c1.8 0 3.256 1.55 3.256 3.463 0 1.912-1.456 3.463-3.256 3.463a3.134 3.134 0 0 1-2.266-.973v.612a.19.19 0 0 1-.189.19h-1.155a.192.192 0 0 1-.19-.19V2.859c0-.104.087-.19.19-.19h1.155c.103 0 .189.086.189.19V6.14a3.147 3.147 0 0 1 2.266-.973zm7.495 5.54c1.094 0 1.99-.93 1.99-2.077 0-1.145-.896-2.076-1.99-2.076-1.095 0-1.99.93-1.99 2.076s.887 2.077 1.99 2.077zm.009-5.54c1.946 0 3.523 1.55 3.523 3.463 0 1.912-1.577 3.463-3.523 3.463-1.948 0-3.524-1.55-3.524-3.463 0-1.912 1.576-3.463 3.524-3.463zm-24.888 5.54c1.094 0 1.98-.913 1.99-2.05v-.053c-.01-1.137-.896-2.05-1.99-2.05-1.095 0-1.99.93-1.99 2.076s.887 2.077 1.99 2.077zm3.343-5.368c.103 0 .19.087.19.19v6.203c0 .103-.087.19-.19.19h-1.155a.19.19 0 0 1-.19-.19v-.612a3.147 3.147 0 0 1-2.265.973c-1.8 0-3.256-1.55-3.256-3.463 0-1.912 1.455-3.463 3.256-3.463.861 0 1.67.354 2.266.973V5.53a.19.19 0 0 1 .189-.19h1.155zm5.495 5.368c1.103 0 1.99-.93 1.99-2.077 0-1.145-.887-2.076-1.99-2.076-1.093 0-1.972.913-1.99 2.05v.052c.009 1.138.897 2.05 1.99 2.05zm.267-5.54c1.8 0 3.257 1.55 3.257 3.463 0 1.912-1.457 3.463-3.257 3.463-.86 0-1.67-.354-2.266-.973v3.282c0 .103-.086.19-.19.19h-1.153a.191.191 0 0 1-.19-.19V5.53c0-.103.086-.19.19-.19h1.154c.103 0 .19.087.19.19v.611a3.147 3.147 0 0 1 2.265-.973zm-16.083 0c1.335 0 2.42 1.025 2.42 2.3l.01 4.264c0 .104-.087.19-.19.19h-1.164a.191.191 0 0 1-.189-.19V7.94c0-.801-.612-1.413-1.344-1.413-.662 0-1.206.586-1.309 1.344l.008 3.859c0 .104-.086.19-.19.19h-1.161a.192.192 0 0 1-.191-.19V7.94c0-.801-.61-1.413-1.344-1.413-.706 0-1.283.663-1.327 1.49v3.713c0 .104-.085.19-.188.19h-1.154a.192.192 0 0 1-.19-.19V5.529c0-.103.086-.19.19-.19h1.154a.19.19 0 0 1 .188.19v.551a2.212 2.212 0 0 1 1.783-.913 2.435 2.435 0 0 1 2.172 1.292 2.255 2.255 0 0 1 2.016-1.292zm41.6 6.487a.221.221 0 0 1 .025.103.173.173 0 0 1-.172.172h-1.318a.29.29 0 0 1-.25-.137L66.1 9.811l-1.189 1.981a.291.291 0 0 1-.25.137h-1.336a.18.18 0 0 1-.094-.025.179.179 0 0 1-.051-.24l1.997-3.042-1.981-3.016a.178.178 0 0 1-.025-.094c0-.095.078-.172.172-.172h1.336c.103 0 .197.051.25.137l1.162 1.947 1.163-1.955a.289.289 0 0 1 .25-.138h1.335c.035 0 .069.009.095.025a.179.179 0 0 1 .05.242l-1.98 3.015 2 3.041zm-56.736-1.146c1.455-1.456 1.404-3.876-.12-5.393C10.62 3.6 8.207 3.54 6.751 4.995 4.125 7.623 4.97 12.29 4.97 12.29s4.679.836 7.297-1.783zM8.63.972a7.659 7.659 0 1 1-.001 15.317 7.659 7.659 0 0 1 0-15.317zm.878 4.488l.75 1.542 1.541.75-1.54.75-.75 1.541-.75-1.542-1.542-.75 1.542-.749.75-1.542z"
              fill="#555"
            />
          </g>
        </svg>
      </a>
      <span dangerouslySetInnerHTML={{ __html: attributions }} />
    </div>
  </div>
);

Attributions.propTypes = {
  attributions: PropTypes.string.isRequired,
  exporting: PropTypes.bool.isRequired,
};

export default Attributions;